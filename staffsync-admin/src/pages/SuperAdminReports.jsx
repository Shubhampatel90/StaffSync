
import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  Assessment,
  CheckCircle,
  Download,
  EventAvailable,
  Groups,
  PersonOff,
  Refresh,
} from "@mui/icons-material";

const API_BASE_URL = "https://staffsync-w6wn.onrender.com";

const EMPTY_REPORT_DATA = {
  totalEmployees: 0,
  totalPresent: 0,
  totalAbsent: 0,
  totalAttendance: 0,
  attendanceRecords: [],
  employeeRecords: [],
};

function SuperAdminReports() {
  const [reportType, setReportType] = useState("attendance");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [reportData, setReportData] = useState(
    EMPTY_REPORT_DATA
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * Loads report data from backend.
   *
   * credentials: "include" is important when your Spring Security
   * configuration uses a session cookie.
   */
  const fetchReports = useCallback(
    async ({
      type = reportType,
      from = fromDate,
      to = toDate,
    } = {}) => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        params.append("type", type);

        if (type === "attendance") {
          if (from) {
            params.append("fromDate", from);
          }

          if (to) {
            params.append("toDate", to);
          }
        }

        const url = `${API_BASE_URL}/api/super-admin/reports?${params.toString()}`;

        console.log("GET REPORTS:", url);

        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        /*
         * Read the response as text first.
         * This lets us display useful Spring Boot errors such as:
         * 401, 403, 404, 500, etc.
         */
        const responseText = await response.text();

        if (!response.ok) {
          let serverMessage = responseText;

          try {
            const errorJson = JSON.parse(responseText);

            serverMessage =
              errorJson.message ||
              errorJson.error ||
              errorJson.detail ||
              responseText;
          } catch {
            // Response was not JSON.
          }

          throw new Error(
            `Reports API failed (${response.status} ${response.statusText})${
              serverMessage
                ? `: ${serverMessage}`
                : ""
            }`
          );
        }

        let data = {};

        try {
          data = responseText
            ? JSON.parse(responseText)
            : {};
        } catch {
          throw new Error(
            "Reports API returned an invalid JSON response."
          );
        }

        console.log("REPORTS RESPONSE:", data);

        setReportData({
          totalEmployees:
            Number(data.totalEmployees) || 0,

          totalPresent:
            Number(data.totalPresent) || 0,

          totalAbsent:
            Number(data.totalAbsent) || 0,

          totalAttendance:
            Number(data.totalAttendance) || 0,

          attendanceRecords:
            Array.isArray(data.attendanceRecords)
              ? data.attendanceRecords
              : [],

          employeeRecords:
            Array.isArray(data.employeeRecords)
              ? data.employeeRecords
              : [],
        });
      } catch (err) {
        console.error("Reports error:", err);

        setReportData(EMPTY_REPORT_DATA);

        setError(
          err?.message ||
            "Unable to load report data."
        );
      } finally {
        setLoading(false);
      }
    },
    [reportType, fromDate, toDate]
  );

  /*
   * Initial report load.
   *
   * Only runs once when this page opens.
   */
  useEffect(() => {
    fetchReports({
      type: "attendance",
      from: "",
      to: "",
    });
  }, [fetchReports]);

  const handleGenerateReport = () => {
    fetchReports({
      type: reportType,
      from: fromDate,
      to: toDate,
    });
  };

  const handleReset = () => {
    setReportType("attendance");
    setFromDate("");
    setToDate("");

    fetchReports({
      type: "attendance",
      from: "",
      to: "",
    });
  };

  const handleReportTypeChange = (event) => {
    const type = event.target.value;

    setReportType(type);

    setFromDate("");
    setToDate("");

    /*
     * Fetch directly with the new type.
     * Do not use setTimeout because state updates are asynchronous.
     */
    fetchReports({
      type,
      from: "",
      to: "",
    });
  };

  const handleExportCSV = () => {
    if (reportType === "employee") {
      exportEmployeeCSV();
      return;
    }

    exportAttendanceCSV();
  };

  const exportAttendanceCSV = () => {
    const records = reportData.attendanceRecords;

    if (!records.length) {
      return;
    }

    const headers = [
      "Employee ID",
      "Employee Name",
      "Attendance Date",
      "Punch In",
      "Punch Out",
      "Status",
      "Remarks",
    ];

    const rows = records.map((record) => [
      record.employeeId ?? "",
      record.employeeName ?? "",
      record.attendanceDate ?? "",
      record.punchIn ?? "",
      record.punchOut ?? "",
      record.status ?? "",
      record.remarks ?? "",
    ]);

    downloadCSV(
      headers,
      rows,
      "staffsync-attendance-report"
    );
  };

  const exportEmployeeCSV = () => {
    const records = reportData.employeeRecords;

    if (!records.length) {
      return;
    }

    const headers = [
      "Employee ID",
      "Full Name",
      "Email",
      "Phone",
      "Current Address",
      "Permanent Address",
      "Aadhaar / PAN",
      "Birth Date",
      "Marital Status",
      "Spouse Name",
      "Spouse Employer",
      "Spouse Work Phone",
    ];

    const rows = records.map((employee) => [
      employee.id ?? "",
      employee.fullName ?? "",
      employee.email ?? "",
      employee.phone ?? "",
      employee.currentAddress ?? "",
      employee.permanentAddress ?? "",
      employee.aadhaarOrPan ?? "",
      employee.birthDate ?? "",
      employee.maritalStatus ?? "",
      employee.spouseName ?? "",
      employee.spouseEmployer ?? "",
      employee.spouseWorkPhone ?? "",
    ]);

    downloadCSV(
      headers,
      rows,
      "staffsync-employee-report"
    );
  };

  const downloadCSV = (
    headers,
    rows,
    fileName
  ) => {
    const csvRows = [headers, ...rows];

    const csvContent = csvRows
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");

            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `${fileName}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const isEmployeeReport =
    reportType === "employee";

  const recordsCount = isEmployeeReport
    ? reportData.employeeRecords.length
    : reportData.attendanceRecords.length;

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        backgroundColor: "#f7f9fc",
        p: {
          xs: 2,
          sm: 2.5,
          md: 3,
        },
      }}
    >
      {/* Header */}

      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent: "space-between",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          gap: 2,
        }}
      >
        <Box>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 0.5 }}
          >
            <Assessment
              sx={{
                color: "#0D9488",
                fontSize: 30,
              }}
            />

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "#0F2747",
              }}
            >
              Reports
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            Generate and download StaffSync
            reports
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleGenerateReport}
          disabled={loading}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderColor: "#0D9488",
            color: "#0D9488",
            "&:hover": {
              borderColor: "#0D9488",
              backgroundColor:
                "rgba(13,148,136,0.06)",
            },
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Error */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </Alert>
      )}

      {/* Filters */}

      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: "1px solid #e5e7eb",
          borderRadius: 2.5,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2,
              md: 2.5,
            },
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              mb: 2,
              fontWeight: 700,
              color: "#0F2747",
            }}
          >
            Report Filters
          </Typography>

          <Grid container spacing={2}>
            {/* Report Type */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >
              <TextField
                fullWidth
                size="small"
                select
                label="Report Type"
                value={reportType}
                onChange={
                  handleReportTypeChange
                }
              >
                <MenuItem value="attendance">
                  Attendance Report
                </MenuItem>

                <MenuItem value="employee">
                  Employee Report
                </MenuItem>
              </TextField>
            </Grid>

            {/* From Date */}

            {!isEmployeeReport && (
              <Grid
                item
                xs={12}
                sm={6}
                md={3}
              >
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="From Date"
                  value={fromDate}
                  onChange={(event) =>
                    setFromDate(
                      event.target.value
                    )
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            )}

            {/* To Date */}

            {!isEmployeeReport && (
              <Grid
                item
                xs={12}
                sm={6}
                md={3}
              >
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="To Date"
                  value={toDate}
                  onChange={(event) =>
                    setToDate(
                      event.target.value
                    )
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            )}

            {/* Buttons */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1}
                sx={{
                  width: "100%",
                }}
              >
                <Button
                  fullWidth
                  variant="contained"
                  onClick={
                    handleGenerateReport
                  }
                  disabled={loading}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    backgroundColor: "#0F2747",
                    "&:hover": {
                      backgroundColor:
                        "#0b1d36",
                    },
                  }}
                >
                  Generate
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleReset}
                  disabled={loading}
                  sx={{
                    textTransform: "none",
                  }}
                >
                  Reset
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box
          sx={{
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress
            sx={{
              color: "#0D9488",
            }}
          />
        </Box>
      ) : (
        <>
          {/* Summary Cards */}

          <Grid
            container
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >
              <SummaryCard
                title="Total Employees"
                value={
                  reportData.totalEmployees
                }
                icon={<Groups />}
                iconColor="#2563EB"
                iconBackground="rgba(37,99,235,0.1)"
              />
            </Grid>

            {!isEmployeeReport && (
              <>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={3}
                >
                  <SummaryCard
                    title="Present"
                    value={
                      reportData.totalPresent
                    }
                    icon={<CheckCircle />}
                    iconColor="#0D9488"
                    iconBackground="rgba(13,148,136,0.1)"
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={3}
                >
                  <SummaryCard
                    title="Absent"
                    value={
                      reportData.totalAbsent
                    }
                    icon={<PersonOff />}
                    iconColor="#ef4444"
                    iconBackground="rgba(239,68,68,0.1)"
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={3}
                >
                  <SummaryCard
                    title="Attendance Records"
                    value={
                      reportData.totalAttendance
                    }
                    icon={<EventAvailable />}
                    iconColor="#f59e0b"
                    iconBackground="rgba(245,158,11,0.1)"
                  />
                </Grid>
              </>
            )}
          </Grid>

          {/* Report Table */}

          <Card
            elevation={0}
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: 2.5,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: {
                  xs: "flex-start",
                  sm: "center",
                },
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#0F2747",
                  }}
                >
                  {isEmployeeReport
                    ? "Employee Report"
                    : "Attendance Report"}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {isEmployeeReport
                    ? "Complete employee information from StaffSync"
                    : "Attendance records for the selected period"}
                </Typography>
              </Box>

              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExportCSV}
                disabled={recordsCount === 0}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  color: "#0D9488",
                  borderColor: "#0D9488",
                  "&:hover": {
                    borderColor: "#0D9488",
                    backgroundColor:
                      "rgba(13,148,136,0.06)",
                  },
                }}
              >
                Download{" "}
                {isEmployeeReport
                  ? "Employee"
                  : "Attendance"}{" "}
                CSV
              </Button>
            </Box>

            <Divider />

            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                width: "100%",
                overflowX: "auto",
              }}
            >
              {isEmployeeReport ? (
                <EmployeeTable
                  employees={
                    reportData.employeeRecords
                  }
                />
              ) : (
                <AttendanceTable
                  records={
                    reportData.attendanceRecords
                  }
                />
              )}
            </TableContainer>
          </Card>
        </>
      )}
    </Box>
  );
}

function EmployeeTable({ employees }) {
  return (
    <Table
      size="small"
      sx={{
        minWidth: 1100,
      }}
    >
      <TableHead>
        <TableRow
          sx={{
            backgroundColor: "#f8fafc",
          }}
        >
          {[
            "ID",
            "Full Name",
            "Email",
            "Phone",
            "Birth Date",
            "Marital Status",
            "Spouse Name",
            "Current Address",
          ].map((heading) => (
            <TableCell
              key={heading}
              sx={{
                fontWeight: 700,
                color: "#0F2747",
                whiteSpace: "nowrap",
              }}
            >
              {heading}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody>
        {employees.length > 0 ? (
          employees.map((employee) => (
            <TableRow
              key={employee.id}
              hover
            >
              <TableCell>
                {employee.id ?? "-"}
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 600,
                }}
              >
                {employee.fullName ?? "-"}
              </TableCell>

              <TableCell>
                {employee.email ?? "-"}
              </TableCell>

              <TableCell>
                {employee.phone ?? "-"}
              </TableCell>

              <TableCell>
                {employee.birthDate ?? "-"}
              </TableCell>

              <TableCell>
                <Chip
                  label={
                    employee.maritalStatus ??
                    "-"
                  }
                  size="small"
                  variant="outlined"
                />
              </TableCell>

              <TableCell>
                {employee.spouseName ?? "-"}
              </TableCell>

              <TableCell
                sx={{
                  maxWidth: 250,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {employee.currentAddress ??
                  "-"}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={8}
              align="center"
              sx={{
                py: 6,
                color: "text.secondary",
              }}
            >
              No employees found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function AttendanceTable({ records }) {
  return (
    <Table
      size="small"
      sx={{
        minWidth: 900,
      }}
    >
      <TableHead>
        <TableRow
          sx={{
            backgroundColor: "#f8fafc",
          }}
        >
          {[
            "Employee ID",
            "Employee Name",
            "Date",
            "Punch In",
            "Punch Out",
            "Status",
            "Remarks",
          ].map((heading) => (
            <TableCell
              key={heading}
              sx={{
                fontWeight: 700,
                color: "#0F2747",
                whiteSpace: "nowrap",
              }}
            >
              {heading}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody>
        {records.length > 0 ? (
          records.map((record, index) => (
            <TableRow
              key={
                record.id ??
                `${record.employeeId}-${record.attendanceDate}-${index}`
              }
              hover
            >
              <TableCell>
                {record.employeeId ?? "-"}
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 600,
                }}
              >
                {record.employeeName ?? "-"}
              </TableCell>

              <TableCell>
                {record.attendanceDate ?? "-"}
              </TableCell>

              <TableCell>
                {record.punchIn ?? "-"}
              </TableCell>

              <TableCell>
                {record.punchOut ?? "-"}
              </TableCell>

              <TableCell>
                <Chip
                  label={
                    record.status ?? "UNKNOWN"
                  }
                  size="small"
                  sx={{
                    fontWeight: 600,
                    backgroundColor:
                      record.status ===
                      "PRESENT"
                        ? "rgba(13,148,136,0.1)"
                        : record.status ===
                          "ABSENT"
                        ? "rgba(239,68,68,0.1)"
                        : "rgba(245,158,11,0.1)",
                    color:
                      record.status ===
                      "PRESENT"
                        ? "#0D9488"
                        : record.status ===
                          "ABSENT"
                        ? "#ef4444"
                        : "#d97706",
                  }}
                />
              </TableCell>

              <TableCell>
                {record.remarks ?? "-"}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={7}
              align="center"
              sx={{
                py: 6,
                color: "text.secondary",
              }}
            >
              No attendance records found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  iconColor,
  iconBackground,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid #e5e7eb",
        borderRadius: 2.5,
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {title}
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 0.5,
                fontWeight: 700,
                color: "#0F2747",
              }}
            >
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: iconBackground,
              color: iconColor,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default SuperAdminReports;
