
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  AccessTime,
  Add,
  CalendarMonth,
  CheckCircle,
  Close,
  Delete,
  Edit,
  EventAvailable,
  Groups,
  Login,
  Logout,
  Notes,
  Person,
  Refresh,
  Schedule,
  Search,
  Warning,
  BeachAccess,
  EventBusy,
} from "@mui/icons-material";

const API_BASE_URL = "https://staffsync-w6wn.onrender.com";

/*
 * IMPORTANT
 *
 * StaffSync uses Spring Security session authentication.
 * Therefore every protected request must send:
 *
 * credentials: "include"
 *
 * Employee and attendance management are currently exposed
 * through /api/admin/** and a SUPER_ADMIN is authorized to
 * access those endpoints.
 */

const COLORS = {
  navy: "#0F2747",
  navyDark: "#0A1C35",
  blue: "#2563EB",
  teal: "#0D9488",
  green: "#16A34A",
  red: "#DC2626",
  orange: "#EA580C",
  purple: "#7C3AED",
  text: "#14213D",
  muted: "#64748B",
  border: "#E5EAF1",
  background: "#F5F8FC",
  white: "#FFFFFF",
};

const ATTENDANCE_STATUSES = [
  {
    value: "PRESENT",
    label: "Present",
    color: COLORS.green,
    background: "#DCFCE7",
    icon: <CheckCircle />,
  },
  {
    value: "ABSENT",
    label: "Absent",
    color: COLORS.red,
    background: "#FEE2E2",
    icon: <Close />,
  },
  {
    value: "HALF_DAY",
    label: "Half Day",
    color: COLORS.orange,
    background: "#FEF3C7",
    icon: <Schedule />,
  },
  {
    value: "HOLIDAY",
    label: "Holiday",
    color: COLORS.purple,
    background: "#EDE9FE",
    icon: <BeachAccess />,
  },
  {
    value: "LEAVE",
    label: "Leave",
    color: "#B45309",
    background: "#FEF3C7",
    icon: <EventBusy />,
  },
  {
    value: "WEEK_OFF",
    label: "Week Off",
    color: COLORS.blue,
    background: "#DBEAFE",
    icon: <EventAvailable />,
  },
];

const EMPTY_FORM = {
  employeeId: "",
  attendanceDate: "",
  punchIn: "",
  punchOut: "",
  status: "PRESENT",
  remarks: "",
};

function AttendanceManagement() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [dashboard, setDashboard] = useState({
    totalEmployees: 0,
    present: 0,
    absent: 0,
    halfDay: 0,
    attendancePercentage: 0,
    todayAttendanceCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [editingAttendance, setEditingAttendance] = useState(null);
  const [deletingAttendance, setDeletingAttendance] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ============================================================
  // API HELPER
  // ============================================================

  const apiFetch = useCallback(async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(options.body
          ? {
              "Content-Type": "application/json",
            }
          : {}),
        ...(options.headers || {}),
      },
    });

    return response;
  }, []);

  // ============================================================
  // HELPERS
  // ============================================================

  const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) {
      return "-";
    }

    const parts = String(value).split(":");

    if (parts.length < 2) {
      return value;
    }

    const hour = Number(parts[0]);
    const minute = parts[1];

    if (Number.isNaN(hour)) {
      return value;
    }

    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minute} ${suffix}`;
  };

  const getEmployeeName = (record) => {
    if (record?.employee?.fullName) {
      return record.employee.fullName;
    }

    if (record?.employeeName) {
      return record.employeeName;
    }

    if (record?.fullName) {
      return record.fullName;
    }

    return `Employee #${record?.employee?.id || record?.employeeId || "-"}`;
  };

  const getEmployeeId = (record) => {
    if (record?.employee?.id !== undefined) {
      return record.employee.id;
    }

    if (record?.employeeId !== undefined) {
      return record.employeeId;
    }

    return "";
  };

  const normalizeStatus = (status) => {
    if (!status) {
      return "UNKNOWN";
    }

    return String(status).toUpperCase();
  };

  const getStatusConfig = (status) => {
    const normalized = normalizeStatus(status);

    return (
      ATTENDANCE_STATUSES.find(
        (item) => item.value === normalized
      ) || {
        value: "UNKNOWN",
        label: "Unknown",
        color: COLORS.muted,
        background: "#E2E8F0",
        icon: <Schedule />,
      }
    );
  };

  const getStatusColor = (status) => {
    const config = getStatusConfig(status);

    return {
      background: config.background,
      color: config.color,
    };
  };

  const getStatusLabel = (status) => {
    return getStatusConfig(status).label;
  };

  const getStatusIcon = (status) => {
    return getStatusConfig(status).icon;
  };

  const getInitials = (name) => {
    if (!name) {
      return "E";
    }

    const words = String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  const calculateDuration = (punchIn, punchOut) => {
    if (!punchIn || !punchOut) {
      return null;
    }

    const [inHour, inMinute] = punchIn.split(":").map(Number);
    const [outHour, outMinute] = punchOut.split(":").map(Number);

    if (
      Number.isNaN(inHour) ||
      Number.isNaN(inMinute) ||
      Number.isNaN(outHour) ||
      Number.isNaN(outMinute)
    ) {
      return null;
    }

    const start = inHour * 60 + inMinute;
    const end = outHour * 60 + outMinute;

    if (end <= start) {
      return null;
    }

    const totalMinutes = end - start;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes} min`;
    }

    if (minutes === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${minutes} min`;
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // ============================================================
  // ERROR RESPONSE
  // ============================================================

  const getErrorMessage = async (response, fallback) => {
    let serverMessage = "";

    try {
      const contentType =
        response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await response.json();

        if (typeof data === "string") {
          serverMessage = data;
        } else if (data?.message) {
          serverMessage = data.message;
        } else if (data?.error) {
          serverMessage = data.error;
        }
      } else {
        serverMessage = await response.text();
      }
    } catch {
      serverMessage = "";
    }

    if (serverMessage) {
      return `${serverMessage} (HTTP ${response.status})`;
    }

    switch (response.status) {
      case 401:
        return "Your session has expired. Please login again. (HTTP 401)";

      case 403:
        return "You are not authorized to access this attendance data. (HTTP 403)";

      case 404:
        return "The requested attendance API endpoint was not found. (HTTP 404)";

      case 500:
        return "Server error while processing attendance data. (HTTP 500)";

      default:
        return `${fallback} (HTTP ${response.status})`;
    }
  };

  // ============================================================
  // DASHBOARD
  // ============================================================

  const fetchDashboard = useCallback(async () => {
    const response = await apiFetch(
      `${API_BASE_URL}/api/super-admin/dashboard`
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Failed to load dashboard statistics."
        )
      );
    }

    const data = await response.json();

    setDashboard({
      totalEmployees: Number(data.totalEmployees || 0),
      present: Number(data.present || 0),
      absent: Number(data.absent || 0),
      halfDay: Number(data.halfDay || 0),
      attendancePercentage: Number(
        data.attendancePercentage || 0
      ),
      todayAttendanceCount: Number(
        data.todayAttendanceCount || 0
      ),
    });
  }, [apiFetch]);

  // ============================================================
  // EMPLOYEES
  // ============================================================

  const fetchEmployees = useCallback(async () => {
    /*
     * IMPORTANT:
     *
     * EmployeeController/AdminController currently exposes:
     *
     * GET /api/admin/employees
     *
     * SUPER_ADMIN is allowed to access /api/admin/**.
     */

    const endpoint =
      `${API_BASE_URL}/api/admin/employees`;

    console.log("GET EMPLOYEES:", endpoint);

    const response = await apiFetch(endpoint);

    if (!response.ok) {
      const message = await getErrorMessage(
        response,
        "Failed to load employees."
      );

      console.error(
        "EMPLOYEES API FAILED:",
        response.status,
        message
      );

      throw new Error(message);
    }

    const data = await response.json();

    setEmployees(Array.isArray(data) ? data : []);
  }, [apiFetch]);

  // ============================================================
  // ATTENDANCE
  // ============================================================

  const fetchAttendance = useCallback(async () => {
    /*
     * Attendance management endpoint:
     *
     * GET /api/admin/attendance
     *
     * SUPER_ADMIN can access /api/admin/**.
     */

    const endpoint =
      `${API_BASE_URL}/api/admin/attendance`;

    console.log("GET ATTENDANCE:", endpoint);

    const response = await apiFetch(endpoint);

    if (!response.ok) {
      const message = await getErrorMessage(
        response,
        "Failed to load attendance."
      );

      console.error(
        "ATTENDANCE API FAILED:",
        response.status,
        message
      );

      throw new Error(message);
    }

    const data = await response.json();

    setAttendance(Array.isArray(data) ? data : []);
  }, [apiFetch]);

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadData = useCallback(
    async (showRefreshLoader = false) => {
      try {
        if (showRefreshLoader) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const results = await Promise.allSettled([
          fetchDashboard(),
          fetchEmployees(),
          fetchAttendance(),
        ]);

        const failedRequest = results.find(
          (result) => result.status === "rejected"
        );

        if (failedRequest) {
          throw failedRequest.reason;
        }
      } catch (error) {
        console.error(
          "Attendance loading error:",
          error
        );

        showSnackbar(
          error.message ||
            "Unable to load attendance data.",
          "error"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      fetchAttendance,
      fetchDashboard,
      fetchEmployees,
    ]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredAttendance = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return attendance.filter((record) => {
      const employeeName =
        getEmployeeName(record).toLowerCase();

      const employeeId = String(
        getEmployeeId(record)
      ).toLowerCase();

      const email =
        record?.employee?.email ||
        record?.email ||
        "";

      const recordStatus = normalizeStatus(
        record?.status
      );

      const matchesSearch =
        !searchValue ||
        employeeName.includes(searchValue) ||
        employeeId.includes(searchValue) ||
        String(email)
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        recordStatus === statusFilter;

      const matchesDate =
        !dateFilter ||
        String(
          record?.attendanceDate || ""
        ) === dateFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    attendance,
    search,
    statusFilter,
    dateFilter,
  ]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const paginatedAttendance = useMemo(() => {
    const start = page * rowsPerPage;

    return filteredAttendance.slice(
      start,
      start + rowsPerPage
    );
  }, [
    filteredAttendance,
    page,
    rowsPerPage,
  ]);

  useEffect(() => {
    setPage(0);
  }, [search, statusFilter, dateFilter]);

  // ============================================================
  // LOCAL STATS
  // ============================================================

  const visibleStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let halfDay = 0;
    let holiday = 0;
    let leave = 0;
    let weekOff = 0;

    filteredAttendance.forEach((item) => {
      switch (normalizeStatus(item?.status)) {
        case "PRESENT":
          present++;
          break;

        case "ABSENT":
          absent++;
          break;

        case "HALF_DAY":
          halfDay++;
          break;

        case "HOLIDAY":
          holiday++;
          break;

        case "LEAVE":
          leave++;
          break;

        case "WEEK_OFF":
          weekOff++;
          break;

        default:
          break;
      }
    });

    return {
      present,
      absent,
      halfDay,
      holiday,
      leave,
      weekOff,
    };
  }, [filteredAttendance]);

  // ============================================================
  // FORM
  // ============================================================

  const handleFormChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ============================================================
  // ADD DIALOG
  // ============================================================

  const openAddDialog = () => {
    setEditingAttendance(null);

    setForm({
      ...EMPTY_FORM,
      attendanceDate: getToday(),
    });

    setDialogOpen(true);
  };

  // ============================================================
  // EDIT DIALOG
  // ============================================================

  const openEditDialog = (record) => {
    const recordStatus = normalizeStatus(
      record?.status
    );

    const validStatus = ATTENDANCE_STATUSES.some(
      (item) => item.value === recordStatus
    )
      ? recordStatus
      : "PRESENT";

    setEditingAttendance(record);

    setForm({
      employeeId: getEmployeeId(record) || "",
      attendanceDate:
        record?.attendanceDate || getToday(),
      punchIn: record?.punchIn
        ? String(record.punchIn).substring(0, 5)
        : "",
      punchOut: record?.punchOut
        ? String(record.punchOut).substring(0, 5)
        : "",
      status: validStatus,
      remarks: record?.remarks || "",
    });

    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) {
      return;
    }

    setDialogOpen(false);
    setEditingAttendance(null);
    setForm(EMPTY_FORM);
  };

  // ============================================================
  // ADD ATTENDANCE
  // ============================================================

  const addAttendance = async () => {
    const employeeId = Number(form.employeeId);

    if (!employeeId) {
      throw new Error(
        "Invalid employee selected."
      );
    }

    const payload = {
      attendanceDate: form.attendanceDate,
      punchIn: form.punchIn || null,
      punchOut: form.punchOut || null,
      status: form.status,
      remarks: form.remarks.trim() || null,
    };

    const endpoint =
      `${API_BASE_URL}/api/admin/attendance/employee/${employeeId}`;

    console.log(
      "ADD ATTENDANCE ENDPOINT:",
      endpoint
    );

    console.log(
      "ADD ATTENDANCE PAYLOAD:",
      payload
    );

    const response = await apiFetch(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Failed to add attendance."
        )
      );
    }

    return response.json();
  };

  // ============================================================
  // UPDATE ATTENDANCE
  // ============================================================

  const updateAttendance = async () => {
    const attendanceId = Number(
      editingAttendance?.id
    );

    const employeeId = Number(form.employeeId);

    if (!attendanceId) {
      throw new Error(
        "Invalid attendance ID."
      );
    }

    if (!employeeId) {
      throw new Error(
        "Invalid employee ID."
      );
    }

    const endpoint =
      `${API_BASE_URL}/api/admin/attendance/` +
      `${attendanceId}/employee/${employeeId}`;

    const allowedStatuses = [
      "ABSENT",
      "HALF_DAY",
      "HOLIDAY",
      "LEAVE",
      "PRESENT",
      "WEEK_OFF",
    ];

    if (!allowedStatuses.includes(form.status)) {
      throw new Error(
        `Invalid attendance status: ${form.status}`
      );
    }

    const payload = {
      attendanceDate: form.attendanceDate,
      punchIn: form.punchIn || null,
      punchOut: form.punchOut || null,
      status: form.status,
      remarks: form.remarks.trim() || null,
    };

    console.log(
      "================================================"
    );

    console.log("UPDATE ATTENDANCE");

    console.log("METHOD:", "PUT");

    console.log("ENDPOINT:", endpoint);

    console.log(
      "ATTENDANCE ID:",
      attendanceId
    );

    console.log(
      "EMPLOYEE ID:",
      employeeId
    );

    console.log("PAYLOAD:", payload);

    console.log(
      "================================================"
    );

    const response = await apiFetch(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const message = await getErrorMessage(
        response,
        `Failed to update attendance. HTTP ${response.status}`
      );

      console.error(
        "UPDATE ATTENDANCE FAILED:",
        response.status,
        message
      );

      throw new Error(message);
    }

    return response.json();
  };

  // ============================================================
  // SAVE
  // ============================================================

  const handleSave = async () => {
    if (!form.employeeId) {
      showSnackbar(
        "Please select an employee.",
        "warning"
      );
      return;
    }

    if (!form.attendanceDate) {
      showSnackbar(
        "Please select an attendance date.",
        "warning"
      );
      return;
    }

    const validStatuses =
      ATTENDANCE_STATUSES.map(
        (item) => item.value
      );

    if (!validStatuses.includes(form.status)) {
      showSnackbar(
        "Please select a valid attendance status.",
        "warning"
      );
      return;
    }

    if (
      form.punchIn &&
      form.punchOut &&
      form.punchOut <= form.punchIn
    ) {
      showSnackbar(
        "Punch out time must be later than punch in time.",
        "warning"
      );
      return;
    }

    try {
      setSaving(true);

      if (editingAttendance) {
        await updateAttendance();

        showSnackbar(
          "Attendance updated successfully."
        );
      } else {
        await addAttendance();

        showSnackbar(
          "Attendance added successfully."
        );
      }

      setDialogOpen(false);
      setEditingAttendance(null);
      setForm(EMPTY_FORM);

      await loadData(true);
    } catch (error) {
      console.error(
        "Save attendance error:",
        error
      );

      showSnackbar(
        error.message ||
          "Unable to save attendance.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const openDeleteDialog = (record) => {
    setDeletingAttendance(record);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (deleting) {
      return;
    }

    setDeleteDialogOpen(false);
    setDeletingAttendance(null);
  };

  const handleDelete = async () => {
    if (!deletingAttendance?.id) {
      return;
    }

    try {
      setDeleting(true);

      const endpoint =
        `${API_BASE_URL}/api/admin/attendance/` +
        deletingAttendance.id;

      console.log(
        "DELETE ATTENDANCE ENDPOINT:",
        endpoint
      );

      const response = await apiFetch(
        endpoint,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "Failed to delete attendance."
          )
        );
      }

      showSnackbar(
        "Attendance deleted successfully."
      );

      setDeleteDialogOpen(false);
      setDeletingAttendance(null);

      await loadData(true);
    } catch (error) {
      console.error(
        "Delete attendance error:",
        error
      );

      showSnackbar(
        error.message ||
          "Unable to delete attendance.",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  // ============================================================
  // SELECTED EMPLOYEE
  // ============================================================

  const selectedEmployee = useMemo(() => {
    if (!form.employeeId) {
      return null;
    }

    return employees.find(
      (employee) =>
        String(employee.id) ===
        String(form.employeeId)
    );
  }, [employees, form.employeeId]);

  const duration = calculateDuration(
    form.punchIn,
    form.punchOut
  );

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "calc(100vh - 72px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
        >
          <CircularProgress
            size={38}
            sx={{
              color: COLORS.teal,
            }}
          />

          <Typography
            sx={{
              color: COLORS.muted,
              fontSize: 14,
            }}
          >
            Loading attendance...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "calc(100vh - 72px)",
        backgroundColor: COLORS.background,
        px: {
          xs: 1.5,
          sm: 2,
          md: 3,
          lg: 4,
          xl: 5,
        },
        py: {
          xs: 2,
          sm: 2.5,
          md: 3,
        },
      }}
    >
      {/* HEADER */}

      <Box
        sx={{
          display: "flex",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: {
                xs: 22,
                sm: 26,
                md: 30,
              },
              fontWeight: 800,
              color: COLORS.text,
              lineHeight: 1.2,
            }}
          >
            Attendance Management
          </Typography>

          <Typography
            sx={{
              mt: 0.7,
              color: COLORS.muted,
              fontSize: {
                xs: 12,
                sm: 14,
              },
            }}
          >
            Monitor and manage employee attendance records.
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
          width={{
            xs: "100%",
            sm: "auto",
          }}
        >
          <Button
            variant="outlined"
            startIcon={
              refreshing ? (
                <CircularProgress size={17} />
              ) : (
                <Refresh />
              )
            }
            onClick={() => loadData(true)}
            disabled={refreshing}
            sx={{
              minHeight: 42,
              borderRadius: 2,
              borderColor: COLORS.border,
              color: COLORS.navy,
              backgroundColor: COLORS.white,
              textTransform: "none",
              fontWeight: 700,
              px: 2,
            }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openAddDialog}
            sx={{
              minHeight: 42,
              borderRadius: 2,
              backgroundColor: COLORS.teal,
              textTransform: "none",
              fontWeight: 700,
              px: 2,
              boxShadow:
                "0 8px 18px rgba(13,148,136,0.20)",
              "&:hover": {
                backgroundColor: "#0B7F75",
              },
            }}
          >
            Add Attendance
          </Button>
        </Stack>
      </Box>

      {/* STAT CARDS */}

      <Grid
        container
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<Groups />}
            title="Total Employees"
            value={dashboard.totalEmployees}
            subtitle="Registered employees"
            iconBackground="#DBEAFE"
            iconColor={COLORS.blue}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<CheckCircle />}
            title="Present"
            value={dashboard.present}
            subtitle="Today's attendance"
            iconBackground="#DCFCE7"
            iconColor={COLORS.green}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<Close />}
            title="Absent"
            value={dashboard.absent}
            subtitle="Today's attendance"
            iconBackground="#FEE2E2"
            iconColor={COLORS.red}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<Schedule />}
            title="Half Day"
            value={dashboard.halfDay}
            subtitle={`${dashboard.attendancePercentage}% attendance`}
            iconBackground="#FEF3C7"
            iconColor={COLORS.orange}
          />
        </Grid>
      </Grid>

      {/* FILTERS */}

      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${COLORS.border}`,
          mb: 2,
          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 1.5,
              sm: 2,
              md: 2.5,
            },
            "&:last-child": {
              pb: {
                xs: 1.5,
                sm: 2,
                md: 2.5,
              },
            },
          }}
        >
          <Grid
            container
            spacing={1.5}
            alignItems="center"
          >
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                size="small"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search employee, ID or email..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search
                        sx={{
                          color: COLORS.muted,
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#F8FAFC",
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl
                fullWidth
                size="small"
              >
                <InputLabel>Status</InputLabel>

                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value
                    )
                  }
                  sx={{
                    borderRadius: 2,
                    backgroundColor: "#F8FAFC",
                  }}
                >
                  <MenuItem value="ALL">
                    All Status
                  </MenuItem>

                  {ATTENDANCE_STATUSES.map(
                    (status) => (
                      <MenuItem
                        key={status.value}
                        value={status.value}
                      >
                        {status.label}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Attendance Date"
                value={dateFilter}
                onChange={(event) =>
                  setDateFilter(
                    event.target.value
                  )
                }
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonth
                        sx={{
                          color: COLORS.muted,
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#F8FAFC",
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 1 }}>
              <Button
                fullWidth
                variant="text"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setDateFilter("");
                }}
                sx={{
                  height: 40,
                  borderRadius: 2,
                  color: COLORS.blue,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* SUMMARY */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 700,
            color: COLORS.text,
          }}
        >
          Attendance Records
        </Typography>

        <Stack
          direction="row"
          spacing={0.8}
          useFlexGap
          sx={{
            flexWrap: "wrap",
          }}
        >
          <Chip
            size="small"
            label={`Present: ${visibleStats.present}`}
            sx={{
              backgroundColor: "#DCFCE7",
              color: "#166534",
              fontWeight: 700,
            }}
          />

          <Chip
            size="small"
            label={`Absent: ${visibleStats.absent}`}
            sx={{
              backgroundColor: "#FEE2E2",
              color: "#991B1B",
              fontWeight: 700,
            }}
          />

          <Chip
            size="small"
            label={`Half Day: ${visibleStats.halfDay}`}
            sx={{
              backgroundColor: "#FEF3C7",
              color: "#92400E",
              fontWeight: 700,
            }}
          />

          <Chip
            size="small"
            label={`Holiday: ${visibleStats.holiday}`}
            sx={{
              backgroundColor: "#EDE9FE",
              color: "#6D28D9",
              fontWeight: 700,
            }}
          />

          <Chip
            size="small"
            label={`Leave: ${visibleStats.leave}`}
            sx={{
              backgroundColor: "#FEF3C7",
              color: "#B45309",
              fontWeight: 700,
            }}
          />

          <Chip
            size="small"
            label={`Week Off: ${visibleStats.weekOff}`}
            sx={{
              backgroundColor: "#DBEAFE",
              color: "#1D4ED8",
              fontWeight: 700,
            }}
          />
        </Stack>
      </Box>

      {/* TABLE */}

      <Paper
        elevation={0}
        sx={{
          width: "100%",
          borderRadius: 3,
          border: `1px solid ${COLORS.border}`,
          overflow: "hidden",
        }}
      >
        <TableContainer
          sx={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <Table
            sx={{
              minWidth: 950,
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#F8FAFC",
                }}
              >
                <TableCell sx={headerCellStyle}>
                  Employee
                </TableCell>

                <TableCell sx={headerCellStyle}>
                  Date
                </TableCell>

                <TableCell sx={headerCellStyle}>
                  Punch In
                </TableCell>

                <TableCell sx={headerCellStyle}>
                  Punch Out
                </TableCell>

                <TableCell sx={headerCellStyle}>
                  Status
                </TableCell>

                <TableCell
                  sx={{
                    ...headerCellStyle,
                    minWidth: 180,
                  }}
                >
                  Remarks
                </TableCell>

                <TableCell
                  align="right"
                  sx={headerCellStyle}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedAttendance.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{
                      py: 7,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      <EventAvailable
                        sx={{
                          fontSize: 48,
                          color: "#CBD5E1",
                          mb: 1,
                        }}
                      />

                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: COLORS.text,
                        }}
                      >
                        No attendance records found
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          color: COLORS.muted,
                          fontSize: 13,
                        }}
                      >
                        Try changing your filters
                        or add a new attendance record.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAttendance.map(
                  (record) => {
                    const statusColor =
                      getStatusColor(
                        record.status
                      );

                    const employeeName =
                      getEmployeeName(record);

                    const employeeId =
                      getEmployeeId(record);

                    return (
                      <TableRow
                        key={
                          record.id ||
                          `${employeeId}-${record.attendanceDate}`
                        }
                        hover
                        sx={{
                          "&:last-child td": {
                            borderBottom: 0,
                          },
                        }}
                      >
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.2}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                width: 38,
                                height: 38,
                                backgroundColor:
                                  COLORS.navy,
                                fontSize: 14,
                                fontWeight: 700,
                              }}
                            >
                              {getInitials(
                                employeeName
                              )}
                            </Avatar>

                            <Box>
                              <Typography
                                sx={{
                                  fontSize: 14,
                                  fontWeight: 700,
                                  color: COLORS.text,
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {employeeName}
                              </Typography>

                              <Typography
                                sx={{
                                  fontSize: 11,
                                  color: COLORS.muted,
                                }}
                              >
                                ID:{" "}
                                {employeeId || "-"}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Typography
                            sx={{
                              fontSize: 13,
                              color: COLORS.text,
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {formatDate(
                              record.attendanceDate
                            )}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={0.7}
                            alignItems="center"
                          >
                            <AccessTime
                              sx={{
                                fontSize: 17,
                                color: COLORS.teal,
                              }}
                            />

                            <Typography
                              sx={{
                                fontSize: 13,
                                fontWeight: 600,
                              }}
                            >
                              {formatTime(
                                record.punchIn
                              )}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={0.7}
                            alignItems="center"
                          >
                            <AccessTime
                              sx={{
                                fontSize: 17,
                                color: COLORS.blue,
                              }}
                            />

                            <Typography
                              sx={{
                                fontSize: 13,
                                fontWeight: 600,
                              }}
                            >
                              {formatTime(
                                record.punchOut
                              )}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            icon={getStatusIcon(
                              record.status
                            )}
                            label={getStatusLabel(
                              record.status
                            )}
                            sx={{
                              backgroundColor:
                                statusColor.background,
                              color:
                                statusColor.color,
                              fontWeight: 700,
                              fontSize: 11,
                              "& .MuiChip-icon": {
                                color:
                                  statusColor.color,
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: COLORS.muted,
                              maxWidth: 230,
                              overflow: "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                            title={
                              record.remarks || ""
                            }
                          >
                            {record.remarks || "-"}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="flex-end"
                          >
                            <Tooltip title="Edit attendance">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  openEditDialog(
                                    record
                                  )
                                }
                                sx={{
                                  color:
                                    COLORS.blue,
                                  backgroundColor:
                                    "#EFF6FF",
                                  "&:hover": {
                                    backgroundColor:
                                      "#DBEAFE",
                                  },
                                }}
                              >
                                <Edit
                                  sx={{
                                    fontSize: 18,
                                  }}
                                />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete attendance">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  openDeleteDialog(
                                    record
                                  )
                                }
                                sx={{
                                  color:
                                    COLORS.red,
                                  backgroundColor:
                                    "#FEF2F2",
                                  "&:hover": {
                                    backgroundColor:
                                      "#FEE2E2",
                                  },
                                }}
                              >
                                <Delete
                                  sx={{
                                    fontSize: 18,
                                  }}
                                />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  }
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider />

        <TablePagination
          component="div"
          count={filteredAttendance.length}
          page={page}
          onPageChange={(_, newPage) =>
            setPage(newPage)
          }
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(
              Number(event.target.value)
            );
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            "& .MuiTablePagination-toolbar": {
              minHeight: 52,
            },
          }}
        />
      </Paper>

      {/* ADD / EDIT DIALOG */}

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: {
              xs: 2,
              sm: 3,
            },
            overflow: "hidden",
            width: "100%",
            maxHeight: "92vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 0,
            backgroundColor: COLORS.navy,
            color: COLORS.white,
          }}
        >
          <Box
            sx={{
              px: {
                xs: 2,
                sm: 3,
              },
              py: {
                xs: 2,
                sm: 2.5,
              },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              minWidth={0}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  backgroundColor:
                    "rgba(255,255,255,0.12)",
                  flexShrink: 0,
                }}
              >
                {editingAttendance ? (
                  <Edit />
                ) : (
                  <EventAvailable />
                )}
              </Box>

              <Box minWidth={0}>
                <Typography
                  sx={{
                    fontSize: {
                      xs: 17,
                      sm: 20,
                    },
                    fontWeight: 800,
                    lineHeight: 1.2,
                  }}
                >
                  {editingAttendance
                    ? "Edit Attendance"
                    : "Add Attendance"}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: {
                      xs: 11,
                      sm: 12,
                    },
                    color: "#B8C7D9",
                  }}
                >
                  {editingAttendance
                    ? "Update the attendance record details."
                    : "Create a new attendance record for an employee."}
                </Typography>
              </Box>
            </Stack>

            <IconButton
              onClick={closeDialog}
              disabled={saving}
              sx={{
                color: "#FFFFFF",
                flexShrink: 0,
                "&:hover": {
                  backgroundColor:
                    "rgba(255,255,255,0.10)",
                },
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            p: {
              xs: 1.5,
              sm: 2.5,
              md: 3,
            },
            backgroundColor: "#F8FAFC",
          }}
        >
          {/* EMPLOYEE */}

          <Box sx={{ mb: 2.5 }}>
            <SectionTitle
              icon={<Person />}
              title="Employee Information"
              subtitle="Select the employee for this attendance record."
            />

            <Card
              elevation={0}
              sx={{
                mt: 1.5,
                borderRadius: 2.5,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.white,
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 1.5,
                    sm: 2,
                  },
                  "&:last-child": {
                    pb: {
                      xs: 1.5,
                      sm: 2,
                    },
                  },
                }}
              >
                <FormControl
                  fullWidth
                  size="small"
                >
                  <InputLabel>
                    Employee
                  </InputLabel>

                  <Select
                    value={form.employeeId}
                    label="Employee"
                    onChange={(event) =>
                      handleFormChange(
                        "employeeId",
                        event.target.value
                      )
                    }
                    disabled={Boolean(
                      editingAttendance
                    )}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    {employees.length === 0 ? (
                      <MenuItem disabled>
                        No employees found
                      </MenuItem>
                    ) : (
                      employees.map(
                        (employee) => (
                          <MenuItem
                            key={employee.id}
                            value={employee.id}
                            sx={{
                              py: 1.1,
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1.2}
                              alignItems="center"
                            >
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  backgroundColor:
                                    COLORS.navy,
                                  fontSize: 12,
                                  fontWeight: 800,
                                }}
                              >
                                {getInitials(
                                  employee.fullName
                                )}
                              </Avatar>

                              <Box>
                                <Typography
                                  sx={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: COLORS.text,
                                  }}
                                >
                                  {employee.fullName ||
                                    "Unnamed Employee"}
                                </Typography>

                                <Typography
                                  sx={{
                                    fontSize: 11,
                                    color: COLORS.muted,
                                  }}
                                >
                                  ID:{" "}
                                  {employee.id}
                                  {employee.email
                                    ? ` • ${employee.email}`
                                    : ""}
                                </Typography>
                              </Box>
                            </Stack>
                          </MenuItem>
                        )
                      )
                    )}
                  </Select>
                </FormControl>

                {selectedEmployee && (
                  <Box
                    sx={{
                      mt: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      background:
                        "linear-gradient(135deg, #EFF6FF 0%, #F0FDFA 100%)",
                      border:
                        "1px solid #DDE7F3",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.3}
                      alignItems="center"
                    >
                      <Avatar
                        sx={{
                          width: 42,
                          height: 42,
                          backgroundColor:
                            COLORS.navy,
                          fontWeight: 800,
                        }}
                      >
                        {getInitials(
                          selectedEmployee.fullName
                        )}
                      </Avatar>

                      <Box minWidth={0}>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: COLORS.text,
                          }}
                        >
                          {selectedEmployee.fullName}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 11,
                            color: COLORS.muted,
                          }}
                        >
                          Employee ID:{" "}
                          {selectedEmployee.id}
                          {selectedEmployee.email
                            ? ` • ${selectedEmployee.email}`
                            : ""}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}

                {editingAttendance && (
                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: 11,
                      color: COLORS.muted,
                    }}
                  >
                    Employee cannot be changed while
                    editing an existing attendance record.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* DATE + STATUS */}

          <Box sx={{ mb: 2.5 }}>
            <SectionTitle
              icon={<CalendarMonth />}
              title="Attendance Details"
              subtitle="Set the attendance date and status."
            />

            <Card
              elevation={0}
              sx={{
                mt: 1.5,
                borderRadius: 2.5,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.white,
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 1.5,
                    sm: 2,
                  },
                  "&:last-child": {
                    pb: {
                      xs: 1.5,
                      sm: 2,
                    },
                  },
                }}
              >
                <Grid
                  container
                  spacing={2}
                >
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label="Attendance Date"
                      value={
                        form.attendanceDate
                      }
                      onChange={(event) =>
                        handleFormChange(
                          "attendanceDate",
                          event.target.value
                        )
                      }
                      InputLabelProps={{
                        shrink: true,
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonth
                              sx={{
                                fontSize: 19,
                                color:
                                  COLORS.muted,
                              }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 7 }}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: COLORS.text,
                        mb: 1,
                      }}
                    >
                      Attendance Status
                    </Typography>

                    <Grid
                      container
                      spacing={1}
                    >
                      {ATTENDANCE_STATUSES.map(
                        (item) => {
                          const active =
                            form.status ===
                            item.value;

                          return (
                            <Grid
                              size={{
                                xs: 6,
                                sm: 4,
                              }}
                              key={item.value}
                            >
                              <Button
                                fullWidth
                                onClick={() =>
                                  handleFormChange(
                                    "status",
                                    item.value
                                  )
                                }
                                sx={{
                                  minHeight: {
                                    xs: 52,
                                    sm: 58,
                                  },
                                  px: 0.5,
                                  py: 0.7,
                                  borderRadius: 2,
                                  flexDirection:
                                    "column",
                                  gap: 0.3,
                                  textTransform:
                                    "none",
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  color: active
                                    ? item.color
                                    : COLORS.muted,
                                  backgroundColor:
                                    active
                                      ? item.background
                                      : "#F8FAFC",
                                  border: active
                                    ? `2px solid ${item.color}`
                                    : `1px solid ${COLORS.border}`,
                                  boxShadow: active
                                    ? `0 3px 10px ${item.color}22`
                                    : "none",
                                  "&:hover": {
                                    backgroundColor:
                                      item.background,
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    justifyContent:
                                      "center",
                                    color:
                                      item.color,
                                  }}
                                >
                                  {item.icon}
                                </Box>

                                {item.label}
                              </Button>
                            </Grid>
                          );
                        }
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>

          {/* TIME */}

          <Box sx={{ mb: 2.5 }}>
            <SectionTitle
              icon={<AccessTime />}
              title="Working Hours"
              subtitle="Enter punch-in and punch-out times."
            />

            <Card
              elevation={0}
              sx={{
                mt: 1.5,
                borderRadius: 2.5,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.white,
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 1.5,
                    sm: 2,
                  },
                  "&:last-child": {
                    pb: {
                      xs: 1.5,
                      sm: 2,
                    },
                  },
                }}
              >
                <Grid
                  container
                  spacing={2}
                >
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="time"
                      label="Punch In"
                      value={form.punchIn}
                      onChange={(event) =>
                        handleFormChange(
                          "punchIn",
                          event.target.value
                        )
                      }
                      InputLabelProps={{
                        shrink: true,
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Login
                              sx={{
                                fontSize: 19,
                                color:
                                  COLORS.teal,
                              }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="time"
                      label="Punch Out"
                      value={form.punchOut}
                      onChange={(event) =>
                        handleFormChange(
                          "punchOut",
                          event.target.value
                        )
                      }
                      InputLabelProps={{
                        shrink: true,
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Logout
                              sx={{
                                fontSize: 19,
                                color:
                                  COLORS.blue,
                              }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                {duration && (
                  <Box
                    sx={{
                      mt: 1.5,
                      px: 1.5,
                      py: 1.2,
                      borderRadius: 2,
                      backgroundColor: "#F0FDFA",
                      border:
                        "1px solid #CCFBF1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      gap: 1,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <AccessTime
                        sx={{
                          fontSize: 19,
                          color: COLORS.teal,
                        }}
                      />

                      <Typography
                        sx={{
                          fontSize: 12,
                          color: COLORS.muted,
                        }}
                      >
                        Working Duration
                      </Typography>
                    </Stack>

                    <Chip
                      size="small"
                      label={duration}
                      sx={{
                        backgroundColor:
                          "#CCFBF1",
                        color: "#115E59",
                        fontWeight: 800,
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* REMARKS */}

          <Box>
            <SectionTitle
              icon={<Notes />}
              title="Remarks"
              subtitle="Add optional notes about this attendance."
            />

            <Card
              elevation={0}
              sx={{
                mt: 1.5,
                borderRadius: 2.5,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.white,
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 1.5,
                    sm: 2,
                  },
                  "&:last-child": {
                    pb: {
                      xs: 1.5,
                      sm: 2,
                    },
                  },
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={6}
                  size="small"
                  label="Attendance Remarks"
                  value={form.remarks}
                  onChange={(event) =>
                    handleFormChange(
                      "remarks",
                      event.target.value
                    )
                  }
                  placeholder="Example: Employee arrived late due to traffic..."
                  helperText={`${form.remarks.length}/500 characters`}
                  inputProps={{
                    maxLength: 500,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                    "& .MuiFormHelperText-root": {
                      textAlign: "right",
                      marginRight: 0,
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Box>
        </DialogContent>

        {/* ACTIONS */}

        <DialogActions
          sx={{
            px: {
              xs: 1.5,
              sm: 3,
            },
            py: {
              xs: 1.5,
              sm: 2,
            },
            borderTop:
              `1px solid ${COLORS.border}`,
            backgroundColor: COLORS.white,
            display: "flex",
            flexDirection: {
              xs: "column-reverse",
              sm: "row",
            },
            gap: 1,
          }}
        >
          <Button
            fullWidth
            onClick={closeDialog}
            disabled={saving}
            sx={{
              minHeight: 42,
              maxWidth: {
                xs: "100%",
                sm: 110,
              },
              borderRadius: 2,
              textTransform: "none",
              color: COLORS.muted,
              fontWeight: 700,
            }}
          >
            Cancel
          </Button>

          <Button
            fullWidth
            variant="contained"
            onClick={handleSave}
            disabled={
              saving ||
              !form.employeeId ||
              !form.attendanceDate
            }
            startIcon={
              saving ? (
                <CircularProgress
                  size={17}
                  color="inherit"
                />
              ) : editingAttendance ? (
                <Edit />
              ) : (
                <CheckCircle />
              )
            }
            sx={{
              minHeight: 42,
              maxWidth: {
                xs: "100%",
                sm: 180,
              },
              borderRadius: 2,
              backgroundColor: COLORS.teal,
              textTransform: "none",
              fontWeight: 800,
              boxShadow:
                "0 7px 16px rgba(13,148,136,0.20)",
              "&:hover": {
                backgroundColor: "#0B7F75",
              },
              "&.Mui-disabled": {
                backgroundColor: "#CBD5E1",
                color: "#64748B",
              },
            }}
          >
            {saving
              ? editingAttendance
                ? "Updating..."
                : "Saving..."
              : editingAttendance
              ? "Update Attendance"
              : "Save Attendance"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE DIALOG */}

      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
          >
            <Warning
              sx={{
                color: COLORS.red,
              }}
            />

            <Typography
              sx={{
                fontWeight: 800,
              }}
            >
              Delete Attendance
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              color: COLORS.muted,
              fontSize: 14,
            }}
          >
            Are you sure you want to delete this
            attendance record?
          </Typography>

          {deletingAttendance && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: "#F8FAFC",
                border:
                  `1px solid ${COLORS.border}`,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {getEmployeeName(
                  deletingAttendance
                )}
              </Typography>

              <Typography
                sx={{
                  mt: 0.3,
                  fontSize: 12,
                  color: COLORS.muted,
                }}
              >
                {formatDate(
                  deletingAttendance.attendanceDate
                )}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >
          <Button
            onClick={closeDeleteDialog}
            disabled={deleting}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              color: COLORS.muted,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={
              deleting ? (
                <CircularProgress
                  size={17}
                  color="inherit"
                />
              ) : (
                <Delete />
              )
            }
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() =>
          setSnackbar((previous) => ({
            ...previous,
            open: false,
          }))
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() =>
            setSnackbar((previous) => ({
              ...previous,
              open: false,
            }))
          }
          sx={{
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

/* =============================================================
   SECTION TITLE
============================================================= */

function SectionTitle({
  icon,
  title,
  subtitle,
}) {
  return (
    <Stack
      direction="row"
      spacing={1.2}
      alignItems="center"
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.8,
          display: "grid",
          placeItems: "center",
          backgroundColor: "#E6FFFB",
          color: COLORS.teal,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 800,
            color: COLORS.text,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            mt: 0.2,
            fontSize: 11,
            color: COLORS.muted,
          }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Stack>
  );
}

/* =============================================================
   TABLE HEADER
============================================================= */

const headerCellStyle = {
  fontWeight: 800,
  color: COLORS.text,
  whiteSpace: "nowrap",
};

/* =============================================================
   STAT CARD
============================================================= */

function StatCard({
  icon,
  title,
  value,
  subtitle,
  iconBackground,
  iconColor,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.white,
      }}
    >
      <CardContent
        sx={{
          p: 2.2,
          "&:last-child": {
            pb: 2.2,
          },
        }}
      >
        <Stack
          direction="row"
          spacing={1.6}
          alignItems="center"
        >
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.2,
              display: "grid",
              placeItems: "center",
              backgroundColor: iconBackground,
              color: iconColor,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                color: COLORS.muted,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                mt: 0.15,
                fontSize: 25,
                fontWeight: 800,
                lineHeight: 1.1,
                color: COLORS.text,
              }}
            >
              {value}
            </Typography>

            <Typography
              sx={{
                mt: 0.35,
                fontSize: 10.5,
                color: COLORS.muted,
              }}
            >
              {subtitle}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default AttendanceManagement;
