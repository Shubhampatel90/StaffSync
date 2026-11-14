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
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import {
  AccessTime,
  CalendarMonth,
  CheckCircle,
  Clear,
  DownloadOutlined,
  EventBusyOutlined,
  LoginOutlined,
  LogoutOutlined,
  Refresh,
  Search,
  TrendingUp,
  EditOutlined,
  PersonAddAlt1,
} from "@mui/icons-material";

const API_BASE_URL = "http://localhost:8080";

const COLORS = {
  navy: "#0F2747",
  teal: "#0D9488",
  blue: "#2563EB",
  background: "#F5F8FC",
  white: "#FFFFFF",
  text: "#1F2937",
  muted: "#64748B",
  border: "#E2E8F0",
  green: "#15803D",
  red: "#DC2626",
  orange: "#D97706",
};

const getToday = () => {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const getEmployeeName = (record) =>
  record?.employee?.fullName ||
  record?.employeeName ||
  record?.fullName ||
  "Unknown Employee";

const getEmployeeId = (record) =>
  record?.employee?.id ??
  record?.employeeId ??
  record?.employee?.employeeId ??
  "—";

// Employee list responses may use either `id` or `employeeId`.
const getEmployeeOptionId = (employee) => {
  const id =
    employee?.id ??
    employee?.employeeId ??
    employee?.employee_id ??
    employee?.employee?.id;

  return id == null ? "" : String(id);
};

const getEmployeeOptionName = (employee) =>
  employee?.fullName ||
  employee?.name ||
  employee?.employeeName ||
  `Employee ${getEmployeeOptionId(employee)}`;

const getAttendanceStatus = (record) =>
  String(record?.status || record?.attendanceStatus || "UNKNOWN")
    .replace(/[\s-]+/g, "_")
    .toUpperCase();

const formatTime = (time) => {
  if (!time) return "—";

  const match = String(time).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return String(time);

  const hours = Number(match[1]);
  const minutes = match[2];
  const period = hours >= 12 ? "PM" : "AM";

  return `${hours % 12 || 12}:${minutes} ${period}`;
};

const calculateWorkingHours = (record) => {
  if (record?.workingHours != null) {
    return String(record.workingHours);
  }

  if (record?.totalWorkingHours != null) {
    return String(record.totalWorkingHours);
  }

  if (!record?.punchIn || !record?.punchOut) return "—";

  const toMinutes = (time) => {
    const [hours, minutes, seconds = 0] = String(time)
      .split(":")
      .map(Number);

    return hours * 60 + minutes + seconds / 60;
  };

  let difference = toMinutes(record.punchOut) - toMinutes(record.punchIn);

  if (difference < 0) difference += 24 * 60;

  const hours = Math.floor(difference / 60);
  const minutes = Math.round(difference % 60);

  return `${hours}h ${minutes}m`;
};

const formatDate = (date) => {
  if (!date) return "—";

  const match = String(date).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return String(date);

  return new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusStyle = (status) => {
  const styles = {
    PRESENT: { color: COLORS.green, backgroundColor: "#DCFCE7" },
    ABSENT: { color: COLORS.red, backgroundColor: "#FEE2E2" },
    LATE: { color: COLORS.orange, backgroundColor: "#FEF3C7" },
    HALF_DAY: { color: "#7C3AED", backgroundColor: "#EDE9FE" },
    ON_LEAVE: { color: COLORS.blue, backgroundColor: "#DBEAFE" },
    LEAVE: { color: COLORS.blue, backgroundColor: "#DBEAFE" },
  };

  return (
    styles[status] || {
      color: COLORS.muted,
      backgroundColor: "#F1F5F9",
    }
  );
};

const extractRecords = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.employees)) return data.employees;
  if (Array.isArray(data?.attendance)) return data.attendance;
  return [];
};

const getRecordDate = (record) =>
  String(record?.attendanceDate || record?.date || "").slice(0, 10);

const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "LATE", label: "Late" },
  { value: "HALF_DAY", label: "Half Day" },
  { value: "ON_LEAVE", label: "On Leave" },
];

function SummaryCard({ title, value, subtitle, icon, color }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: `1px solid ${COLORS.border}`,
        borderRadius: 3,
        backgroundColor: COLORS.white,
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{ color: COLORS.muted, fontWeight: 600 }}
            >
              {title}
            </Typography>

            <Typography
              variant="h4"
              sx={{
                color: COLORS.navy,
                fontWeight: 800,
                mt: 1,
                lineHeight: 1.2,
              }}
            >
              {value}
            </Typography>

            <Typography
              variant="caption"
              sx={{ color: COLORS.muted, display: "block", mt: 1 }}
            >
              {subtitle}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color,
              backgroundColor: `${color}15`,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Add attendance dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [savingAdd, setSavingAdd] = useState(false);
  const [addError, setAddError] = useState("");
  const [addForm, setAddForm] = useState({
    employeeId: "",
    date: getToday(),
    punchIn: "",
    punchOut: "",
    status: "PRESENT",
    remarks: "",
  });

  // Edit attendance dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const [editForm, setEditForm] = useState({
    date: "",
    punchIn: "",
    punchOut: "",
    status: "PRESENT",
    remarks: "",
  });

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [attendanceResponse, employeeResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/attendance`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        }),
        fetch(`${API_BASE_URL}/api/admin/employees`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        }),
      ]);

      if (!attendanceResponse.ok) {
        if (
          attendanceResponse.status === 401 ||
          attendanceResponse.status === 403
        ) {
          throw new Error(
            "Access denied or session expired. Please log in again."
          );
        }

        throw new Error(
          `Unable to load attendance records (${attendanceResponse.status}).`
        );
      }

      setAttendance(extractRecords(await attendanceResponse.json()));

      if (employeeResponse.ok) {
        setEmployees(extractRecords(await employeeResponse.json()));
      } else {
        setEmployees([]);
      }
    } catch (err) {
      setError(
        err.message || "Something went wrong while loading attendance."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // If the dialog is open but the form has no employee yet (for example the
  // employee list finished loading after the dialog opened), select the first one.
  useEffect(() => {
    if (!addDialogOpen || addForm.employeeId || employees.length === 0) return;

    const firstId = getEmployeeOptionId(employees[0]);
    if (firstId) {
      setAddForm((previous) => ({ ...previous, employeeId: firstId }));
    }
  }, [addDialogOpen, addForm.employeeId, employees]);

  const handleOpenAdd = (prefill = {}) => {
    setAddError("");
    setError("");
    setSuccess("");
    setAddForm({
      // Preselect the first available employee; the dropdown can still change it.
      employeeId:
        prefill.employeeId ??
        (employees.length ? getEmployeeOptionId(employees[0]) : ""),
      date: prefill.date || getToday(),
      punchIn: "",
      punchOut: "",
      status: prefill.status || "PRESENT",
      remarks: "",
    });
    setAddDialogOpen(true);
  };

  const handleCloseAdd = () => {
    if (savingAdd) return;
    setAddDialogOpen(false);
    setAddError("");
  };

  const handleAddFieldChange = (event) => {
    const { name, value } = event.target;

    // Reject future dates even if manually typed into the date input.
    if (name === "date" && value && value > getToday()) {
      setAddError("Future attendance dates are not allowed.");
      return;
    }

    setAddError("");
    setAddForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSaveAdd = async () => {
    // Resolve the employee from the form value, then fall back to the first
    // option so a visible selection can never fail validation.
    const selectedEmployeeId = String(
      addForm.employeeId || getEmployeeOptionId(employees[0]) || ""
    ).trim();

    if (!selectedEmployeeId) {
      setAddError("Please select an employee from the dropdown.");
      return;
    }

    const employeeIdNumber = Number(selectedEmployeeId);
    if (Number.isNaN(employeeIdNumber)) {
      setAddError("The selected employee has an invalid ID.");
      return;
    }

    if (!addForm.date) {
      setAddError("Please select an attendance date.");
      return;
    }
    if (addForm.date > getToday()) {
      setAddError("Future attendance dates are not allowed.");
      return;
    }
    if (!addForm.punchIn && !["ABSENT", "ON_LEAVE"].includes(addForm.status)) {
      setAddError("Punch-in time is required.");
      return;
    }
    if (
      addForm.punchIn &&
      addForm.punchOut &&
      addForm.punchOut < addForm.punchIn
    ) {
      setAddError("Punch-out must be later than punch-in.");
      return;
    }

    setSavingAdd(true);
    setAddError("");
    setError("");
    setSuccess("");

    try {
      // The Spring Boot controller binds the body to the Attendance entity,
      // so it needs a nested `employee.id` and the field name `attendanceDate`.
      const payload = {
        employee: { id: employeeIdNumber },
        attendanceDate: addForm.date,
        punchIn: addForm.punchIn || null,
        punchOut: addForm.punchOut || null,
        status: addForm.status,
        remarks: addForm.remarks.trim(),
      };

      const response = await fetch(`${API_BASE_URL}/api/admin/attendance`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || `Unable to add attendance (${response.status}).`
        );
      }

      setAddDialogOpen(false);
      setSuccess("Attendance added successfully.");
      setSelectedDate(addForm.date);
      setSelectedStatus("ALL");
      setPage(0);
      await fetchAttendance();
    } catch (err) {
      setAddError(err.message || "Failed to add attendance.");
    } finally {
      setSavingAdd(false);
    }
  };

  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    setEditError("");
    setSuccess("");

    setEditForm({
      date: getRecordDate(record),
      punchIn: String(record.punchIn || "").slice(0, 5),
      punchOut: String(record.punchOut || "").slice(0, 5),
      status: getAttendanceStatus(record),
      remarks: record.remarks || "",
    });

    setEditDialogOpen(true);
  };

  const handleCloseEdit = () => {
    if (savingEdit) return;
    setEditDialogOpen(false);
    setEditingRecord(null);
    setEditError("");
  };

  const handleEditFieldChange = (event) => {
    const { name, value } = event.target;

    if (name === "date" && value && value > getToday()) {
      setEditError("Future attendance dates are not allowed.");
      return;
    }
    if (name === "date") setEditError("");

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    if (editingRecord?.id == null) {
      setEditError("Attendance record ID is missing.");
      return;
    }

    if (!editForm.date) {
      setEditError("Please select an attendance date.");
      return;
    }
    if (editForm.date > getToday()) {
      setEditError("Future attendance dates are not allowed.");
      return;
    }

    if (editForm.punchOut && !editForm.punchIn) {
      setEditError("Punch-in time is required when punch-out is provided.");
      return;
    }

    if (
      editForm.punchIn &&
      editForm.punchOut &&
      editForm.punchIn === editForm.punchOut
    ) {
      setEditError("Punch-in and punch-out times cannot be identical.");
      return;
    }

    if (
      editForm.punchIn &&
      editForm.punchOut &&
      editForm.punchOut < editForm.punchIn
    ) {
      setEditError(
        "Punch-out must be later than punch-in. Overnight shifts require backend support."
      );
      return;
    }

    setSavingEdit(true);
    setEditError("");
    setError("");
    setSuccess("");

    try {
      // Field names match the Attendance entity used by the PUT endpoint.
      const payload = {
        attendanceDate: editForm.date,
        punchIn: editForm.punchIn || null,
        punchOut: editForm.punchOut || null,
        status: editForm.status,
        remarks: editForm.remarks.trim(),
      };

      const response = await fetch(
        `${API_BASE_URL}/api/admin/attendance/${editingRecord.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || `Unable to update attendance (${response.status}).`
        );
      }

      setEditDialogOpen(false);
      setEditingRecord(null);
      setSuccess("Attendance updated successfully.");

      await fetchAttendance();
    } catch (err) {
      setEditError(err.message || "Failed to update attendance.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Employees with no record on the selected day are shown as Absent.
  // These rows are display-only; they disappear once a real record exists.
  const displayRecords = useMemo(() => {
    if (!selectedDate || selectedDate > getToday()) return attendance;

    const recorded = new Set(
      attendance
        .filter((record) => getRecordDate(record) === selectedDate)
        .map((record) => String(getEmployeeId(record)))
    );

    const missing = employees
      .filter((employee) => {
        const id = getEmployeeOptionId(employee);
        return id && !recorded.has(id);
      })
      .map((employee) => ({
        id: null,
        virtual: true,
        employee,
        employeeId: getEmployeeOptionId(employee),
        employeeName: getEmployeeOptionName(employee),
        attendanceDate: selectedDate,
        punchIn: null,
        punchOut: null,
        status: "ABSENT",
        remarks: "No attendance recorded",
      }));

    return [...attendance, ...missing];
  }, [attendance, employees, selectedDate]);

  const filteredAttendance = useMemo(() => {
    const query = search.trim().toLowerCase();

    return displayRecords.filter((record) => {
      const employeeName = getEmployeeName(record).toLowerCase();
      const employeeId = String(getEmployeeId(record)).toLowerCase();

      const matchesSearch =
        !query || employeeName.includes(query) || employeeId.includes(query);

      const matchesDate = !selectedDate || getRecordDate(record) === selectedDate;
      const status = getAttendanceStatus(record);
      const matchesStatus =
        selectedStatus === "ALL" || status === selectedStatus;

      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [displayRecords, search, selectedDate, selectedStatus]);

  const dailyRecords = useMemo(
    () =>
      displayRecords.filter(
        (record) => !selectedDate || getRecordDate(record) === selectedDate
      ),
    [displayRecords, selectedDate]
  );

  const summary = useMemo(() => {
    const present = dailyRecords.filter((record) =>
      ["PRESENT", "HALF_DAY", "LATE"].includes(getAttendanceStatus(record))
    ).length;

    const absent = dailyRecords.filter(
      (record) => getAttendanceStatus(record) === "ABSENT"
    ).length;

    const late = dailyRecords.filter(
      (record) => getAttendanceStatus(record) === "LATE"
    ).length;

    return {
      total: employees.length || dailyRecords.length,
      present,
      absent,
      late,
    };
  }, [dailyRecords, employees]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedDate(getToday());
    setSelectedStatus("ALL");
    setPage(0);
  };

  const handleExportCsv = () => {
    const headers = [
      "Employee ID",
      "Employee Name",
      "Date",
      "Punch In",
      "Punch Out",
      "Working Hours",
      "Status",
      "Remarks",
    ];

    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = filteredAttendance.map((record) => [
      getEmployeeId(record),
      getEmployeeName(record),
      record?.attendanceDate || record?.date || "",
      record?.punchIn || "",
      record?.punchOut || "",
      calculateWorkingHours(record),
      getAttendanceStatus(record),
      record?.remarks || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `staffsync-attendance-${selectedDate || "all-dates"}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    // Revoke after the browser has had a chance to start the download.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        backgroundColor: COLORS.background,
        p: { xs: 2, sm: 3, md: 3.5 },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          mb: 3,
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              color: COLORS.navy,
              fontWeight: 800,
              letterSpacing: -0.4,
            }}
          >
            Attendance Management
          </Typography>

          <Typography variant="body2" sx={{ color: COLORS.muted, mt: 0.75 }}>
            Monitor employee attendance, working hours, and daily status.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<PersonAddAlt1 />}
            onClick={() => handleOpenAdd()}
            sx={{
              textTransform: "none",
              backgroundColor: COLORS.teal,
              borderRadius: 2,
              fontWeight: 700,
              "&:hover": { backgroundColor: "#0F766E" },
            }}
          >
            Add Attendance
          </Button>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => fetchAttendance()}
            disabled={loading}
            sx={{
              textTransform: "none",
              borderColor: COLORS.border,
              color: COLORS.navy,
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<DownloadOutlined />}
            onClick={handleExportCsv}
            disabled={filteredAttendance.length === 0}
            sx={{
              textTransform: "none",
              backgroundColor: COLORS.navy,
              borderRadius: 2,
              fontWeight: 700,
              "&:hover": { backgroundColor: "#193B66" },
            }}
          >
            Export CSV
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => fetchAttendance()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            title="Total Employees"
            value={loading ? "—" : summary.total}
            subtitle="Registered employees"
            color={COLORS.blue}
            icon={<TrendingUp fontSize="medium" />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            title="Present Today"
            value={loading ? "—" : summary.present}
            subtitle="Present, late, or half-day"
            color={COLORS.green}
            icon={<CheckCircle fontSize="medium" />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            title="Absent Today"
            value={loading ? "—" : summary.absent}
            subtitle="No record or marked absent"
            color={COLORS.red}
            icon={<EventBusyOutlined fontSize="medium" />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            title="Late Arrivals"
            value={loading ? "—" : summary.late}
            subtitle="Late attendance records"
            color={COLORS.orange}
            icon={<AccessTime fontSize="medium" />}
          />
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${COLORS.border}`,
          borderRadius: 3,
          overflow: "hidden",
          backgroundColor: COLORS.white,
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{
              justifyContent: "space-between",
              alignItems: { xs: "stretch", md: "center" },
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ color: COLORS.navy, fontWeight: 800 }}
              >
                Attendance Records
              </Typography>

              <Typography variant="body2" sx={{ color: COLORS.muted, mt: 0.5 }}>
                {filteredAttendance.length} matching records
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              useFlexGap
            >
              <TextField
                size="small"
                placeholder="Search employee..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
                sx={{
                  minWidth: { sm: 210 },
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: COLORS.muted }} />
                      </InputAdornment>
                    ),
                    endAdornment: search ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          aria-label="Clear search"
                          onClick={() => {
                            setSearch("");
                            setPage(0);
                          }}
                        >
                          <Clear fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  },
                }}
              />

              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <TextField
                  type="date"
                  size="small"
                  value={selectedDate}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value && value > getToday()) return;
                    setSelectedDate(value);
                    setPage(0);
                  }}
                  sx={{
                    minWidth: { xs: 155, sm: 165 },
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarMonth sx={{ color: COLORS.muted }} />
                        </InputAdornment>
                      ),
                    },
                    inputLabel: { shrink: true },
                    htmlInput: { max: getToday() },
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSelectedDate(getToday());
                    setPage(0);
                  }}
                  sx={{
                    minWidth: "auto",
                    px: 1.5,
                    whiteSpace: "nowrap",
                    textTransform: "none",
                    borderRadius: 2,
                    borderColor: COLORS.border,
                    color: COLORS.navy,
                    fontWeight: 700,
                  }}
                >
                  Today
                </Button>
              </Stack>

              <TextField
                select
                size="small"
                label="Status"
                value={selectedStatus}
                onChange={(event) => {
                  setSelectedStatus(event.target.value);
                  setPage(0);
                }}
                sx={{
                  minWidth: 135,
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <Tooltip title="Reset filters">
                <IconButton
                  onClick={handleResetFilters}
                  aria-label="Reset attendance filters"
                  sx={{
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 2,
                    color: COLORS.navy,
                  }}
                >
                  <Clear />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: COLORS.border }} />

        {loading ? (
          <Box
            sx={{
              minHeight: 280,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            <CircularProgress size={32} sx={{ color: COLORS.teal }} />
            <Typography variant="body2" color="text.secondary">
              Loading attendance records...
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: 1150 }}>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "#F8FAFC",
                      "& th": {
                        color: COLORS.muted,
                        fontWeight: 800,
                        fontSize: 12,
                        whiteSpace: "nowrap",
                        py: 2,
                        borderBottom: `1px solid ${COLORS.border}`,
                      },
                    }}
                  >
                    <TableCell>EMPLOYEE</TableCell>
                    <TableCell>EMPLOYEE ID</TableCell>
                    <TableCell>DATE</TableCell>
                    <TableCell>PUNCH IN</TableCell>
                    <TableCell>PUNCH OUT</TableCell>
                    <TableCell>WORKING HOURS</TableCell>
                    <TableCell>STATUS</TableCell>
                    <TableCell>REMARKS</TableCell>
                    <TableCell align="center">ACTION</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredAttendance
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((record, index) => {
                      const employeeName = getEmployeeName(record);
                      const employeeId = getEmployeeId(record);
                      const status = getAttendanceStatus(record);
                      const statusStyle = getStatusStyle(status);

                      return (
                        <TableRow
                          key={record.id ?? `${employeeId}-${index}`}
                          hover
                          sx={{
                            "& td": {
                              borderBottom: `1px solid ${COLORS.border}`,
                              py: 1.75,
                            },
                            "&:last-child td": { borderBottom: 0 },
                          }}
                        >
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              sx={{ alignItems: "center", minWidth: 190 }}
                            >
                              <Avatar
                                src={
                                  record?.employee?.profileImageUrl ||
                                  record?.employee?.imageUrl ||
                                  undefined
                                }
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: COLORS.navy,
                                  fontWeight: 700,
                                }}
                              >
                                {employeeName.charAt(0).toUpperCase()}
                              </Avatar>

                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ color: COLORS.text, fontWeight: 700 }}
                                >
                                  {employeeName}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  sx={{ color: COLORS.muted }}
                                >
                                  Employee
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ color: COLORS.text, fontWeight: 600 }}
                            >
                              {employeeId}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            <Typography variant="body2">
                              {formatDate(record.attendanceDate || record.date)}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={0.75}
                              sx={{ alignItems: "center" }}
                            >
                              <LoginOutlined
                                sx={{ fontSize: 17, color: COLORS.green }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ whiteSpace: "nowrap" }}
                              >
                                {formatTime(record.punchIn)}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={0.75}
                              sx={{ alignItems: "center" }}
                            >
                              <LogoutOutlined
                                sx={{ fontSize: 17, color: COLORS.red }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ whiteSpace: "nowrap" }}
                              >
                                {formatTime(record.punchOut)}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ color: COLORS.navy, fontWeight: 700 }}
                            >
                              {calculateWorkingHours(record)}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={status.replace(/_/g, " ")}
                              size="small"
                              sx={{
                                ...statusStyle,
                                fontWeight: 800,
                                fontSize: 11,
                                borderRadius: 1.5,
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                color: COLORS.muted,
                                maxWidth: 180,
                                overflowWrap: "anywhere",
                              }}
                            >
                              {record.remarks || "—"}
                            </Typography>
                          </TableCell>

                          <TableCell align="center">
                            <Tooltip
                              title={
                                record.virtual
                                  ? "Mark attendance"
                                  : "Edit attendance"
                              }
                            >
                              <IconButton
                                aria-label={`Edit attendance for ${employeeName}`}
                                onClick={() =>
                                  record.virtual
                                    ? handleOpenAdd({
                                        employeeId: String(employeeId),
                                        date: selectedDate,
                                      })
                                    : handleOpenEdit(record)
                                }
                                size="small"
                                sx={{
                                  color: COLORS.blue,
                                  border: `1px solid ${COLORS.border}`,
                                  borderRadius: 2,
                                }}
                              >
                                <EditOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                  {filteredAttendance.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Box sx={{ py: 7 }}>
                          <EventBusyOutlined
                            sx={{ fontSize: 44, color: "#CBD5E1", mb: 1 }}
                          />

                          <Typography
                            variant="subtitle1"
                            sx={{ color: COLORS.navy, fontWeight: 700 }}
                          >
                            No attendance records found
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{ color: COLORS.muted, mt: 0.5 }}
                          >
                            Try another date or clear your filters.
                          </Typography>

                          <Button
                            onClick={handleResetFilters}
                            sx={{
                              mt: 1.5,
                              textTransform: "none",
                              color: COLORS.teal,
                            }}
                          >
                            Clear filters
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ borderColor: COLORS.border }} />

            <TablePagination
              component="div"
              count={filteredAttendance.length}
              page={Math.min(
                page,
                Math.max(
                  0,
                  Math.ceil(filteredAttendance.length / rowsPerPage) - 1
                )
              )}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(Number(event.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                "& .MuiTablePagination-toolbar": {
                  flexWrap: "wrap",
                  px: 2,
                },
              }}
            />
          </>
        )}
      </Paper>

      {/* Add Attendance Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={handleCloseAdd}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            color: COLORS.navy,
            fontWeight: 800,
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          Add Attendance
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 2 }}>
            {addError && (
              <Alert severity="error" onClose={() => setAddError("")}>
                {addError}
              </Alert>
            )}

            <TextField
              select
              label="Employee"
              name="employeeId"
              value={String(addForm.employeeId ?? "")}
              onChange={(event) => {
                setAddError("");
                setAddForm((previous) => ({
                  ...previous,
                  employeeId: String(event.target.value),
                }));
              }}
              fullWidth
              required
              disabled={employees.length === 0}
              helperText={
                employees.length === 0
                  ? "No employees available. Please check employee loading."
                  : "Select the employee for this attendance record."
              }
            >
              {employees.map((employee, index) => {
                const employeeOptionId = getEmployeeOptionId(employee);

                return (
                  <MenuItem
                    key={employeeOptionId || `employee-option-${index}`}
                    value={employeeOptionId}
                  >
                    {getEmployeeOptionName(employee)} (ID:{" "}
                    {employeeOptionId || "—"})
                  </MenuItem>
                );
              })}
            </TextField>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ alignItems: { xs: "stretch", sm: "center" } }}
            >
              <TextField
                label="Attendance Date"
                name="date"
                type="date"
                value={addForm.date}
                onChange={handleAddFieldChange}
                fullWidth
                required
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { max: getToday() },
                }}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  setAddForm((previous) => ({ ...previous, date: getToday() }));
                  setAddError("");
                }}
                sx={{
                  minWidth: { xs: "100%", sm: 100 },
                  height: { sm: 56 },
                  textTransform: "none",
                  borderRadius: 2,
                  borderColor: COLORS.border,
                  color: COLORS.navy,
                  fontWeight: 700,
                }}
              >
                Today
              </Button>
            </Stack>

            <Typography
              variant="caption"
              sx={{ color: COLORS.muted, mt: -1.5 }}
            >
              Future dates are disabled. You can select today or a past date
              only.
            </Typography>

            <TextField
              label="Punch In"
              name="punchIn"
              type="time"
              value={addForm.punchIn}
              onChange={handleAddFieldChange}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              label="Punch Out"
              name="punchOut"
              type="time"
              value={addForm.punchOut}
              onChange={handleAddFieldChange}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              select
              label="Attendance Status"
              name="status"
              value={addForm.status}
              onChange={handleAddFieldChange}
              fullWidth
              required
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Remarks"
              name="remarks"
              value={addForm.remarks}
              onChange={handleAddFieldChange}
              fullWidth
              multiline
              minRows={3}
              placeholder="Enter a reason or attendance note"
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            onClick={handleCloseAdd}
            disabled={savingAdd}
            sx={{ textTransform: "none", color: COLORS.muted }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveAdd}
            disabled={savingAdd || employees.length === 0}
            sx={{
              textTransform: "none",
              backgroundColor: COLORS.teal,
              fontWeight: 700,
              "&:hover": { backgroundColor: "#0F766E" },
            }}
          >
            {savingAdd ? "Saving..." : "Add Attendance"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Attendance Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEdit}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            color: COLORS.navy,
            fontWeight: 800,
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          Edit Attendance
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Employee: {editingRecord ? getEmployeeName(editingRecord) : ""}
              {" · "}
              ID: {editingRecord ? getEmployeeId(editingRecord) : ""}
            </Alert>

            {editError && (
              <Alert severity="error" onClose={() => setEditError("")}>
                {editError}
              </Alert>
            )}

            <TextField
              label="Attendance Date"
              name="date"
              type="date"
              value={editForm.date}
              onChange={handleEditFieldChange}
              fullWidth
              required
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { max: getToday() },
              }}
            />

            <TextField
              label="Punch In"
              name="punchIn"
              type="time"
              value={editForm.punchIn}
              onChange={handleEditFieldChange}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              label="Punch Out"
              name="punchOut"
              type="time"
              value={editForm.punchOut}
              onChange={handleEditFieldChange}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              select
              label="Attendance Status"
              name="status"
              value={editForm.status}
              onChange={handleEditFieldChange}
              fullWidth
              required
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Remarks"
              name="remarks"
              value={editForm.remarks}
              onChange={handleEditFieldChange}
              fullWidth
              multiline
              minRows={3}
              placeholder="Enter a reason or attendance note"
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            onClick={handleCloseEdit}
            disabled={savingEdit}
            sx={{ textTransform: "none", color: COLORS.muted }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={savingEdit}
            sx={{
              textTransform: "none",
              backgroundColor: COLORS.navy,
              fontWeight: 700,
              "&:hover": { backgroundColor: "#193B66" },
            }}
          >
            {savingEdit ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}