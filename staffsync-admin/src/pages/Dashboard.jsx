import { useEffect, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import {
  AccessTime,
  Assessment,
  EventAvailable,
  People,
  PersonAdd,
} from "@mui/icons-material";

const COLORS = {
  navy: "#0F2747",
  teal: "#0D9488",
  blue: "#2563EB",
  text: "#14213D",
  muted: "#64748B",
  border: "#E5EAF1",
  background: "#F5F8FC",
  white: "#FFFFFF",
};

  const API_BASE_URL = "https://staffsync-w6wn.onrender.com";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD DASHBOARD DATA
  // ============================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/admin/dashboard`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const responseText = await response.text();

      console.log(
        "Dashboard API status:",
        response.status
      );

      console.log(
        "Dashboard API response:",
        responseText
      );

      if (!response.ok) {
        let message = `Dashboard API failed with status ${response.status}`;

        if (response.status === 401) {
          message =
            "Your admin session has expired. Please login again.";
        } else if (response.status === 403) {
          message =
            "You are not authorized to access the admin dashboard.";
        } else if (response.status === 404) {
          message =
            "Dashboard API was not found. Check the Spring Boot endpoint.";
        } else if (response.status === 500) {
          message =
            "Server error while loading dashboard data.";
        }

        throw new Error(message);
      }

      if (!responseText) {
        throw new Error(
          "Dashboard API returned an empty response."
        );
      }

      const data = JSON.parse(responseText);

      console.log("Dashboard data:", data);

      setDashboard(data);
    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setDashboard(null);

      setError(
        err.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SAFE VALUES
  // ============================================================

  const totalEmployees =
    Number(dashboard?.totalEmployees ?? 0);

  const presentToday =
    Number(dashboard?.presentToday ?? 0);

  const lateToday =
    Number(dashboard?.lateToday ?? 0);

  const absentToday =
    Number(dashboard?.absentToday ?? 0);

  const attendanceRate =
    Number(dashboard?.attendanceRate ?? 0);

  const attendanceDate =
    dashboard?.attendanceDate ?? null;

  const workingHours =
    dashboard?.workingHours ||
    "09:00 AM - 06:00 PM";

  const officeStatus =
    dashboard?.officeStatus || "Open";

  // ============================================================
  // ATTENDANCE PERCENTAGES
  // ============================================================

  const latePercentage =
    totalEmployees > 0
      ? Math.min(
          (lateToday / totalEmployees) * 100,
          100
        ).toFixed(1)
      : "0.0";

  const absentPercentage =
    totalEmployees > 0
      ? Math.min(
          (absentToday / totalEmployees) * 100,
          100
        ).toFixed(1)
      : "0.0";

  const presentPercentage =
    totalEmployees > 0
      ? Math.min(
          (presentToday / totalEmployees) * 100,
          100
        ).toFixed(1)
      : "0.0";

  // ============================================================
  // ATTENDANCE DATE
  // ============================================================

  const formattedAttendanceDate =
    attendanceDate
      ? new Date(
          `${attendanceDate}T00:00:00`
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "-";

  // ============================================================
  // OFFICE STATUS
  // ============================================================

  const isOfficeOpen =
    String(officeStatus).toLowerCase() ===
    "open";

  // ============================================================
  // STATISTICS
  // ============================================================

  const stats = [
    {
      title: "Total Employees",
      value: loading
        ? "..."
        : totalEmployees,
      subtitle: "Active employees",
      icon: <People />,
    },
    {
      title: "Present Today",
      value: loading
        ? "..."
        : presentToday,
      subtitle: "Employees present",
      icon: <EventAvailable />,
    },
    {
      title: "New Employees",
      value: "-",
      subtitle: "Added this month",
      icon: <PersonAdd />,
    },
    {
      title: "Late Today",
      value: loading
        ? "..."
        : lateToday,
      subtitle: "Employees late",
      icon: <AccessTime />,
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "calc(100vh - 72px)",
        backgroundColor: COLORS.background,
        p: {
          xs: 2,
          sm: 2.5,
          md: 3,
          lg: 4,
          xl: 5,
        },
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontSize: {
              xs: 23,
              sm: 26,
            },
            fontWeight: 800,
            color: COLORS.navy,
            letterSpacing: -0.5,
          }}
        >
          Dashboard
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            fontSize: 14,
            color: COLORS.muted,
          }}
        >
          Welcome back. Here's what's happening today.
        </Typography>

        {error && (
          <Typography
            sx={{
              mt: 1,
              fontSize: 13,
              color: "#DC2626",
              fontWeight: 600,
            }}
          >
            {error}
          </Typography>
        )}
      </Box>

      {/* =====================================================
          STATISTICS CARDS
      ===================================================== */}

      <Grid container spacing={2.5}>
        {stats.map((stat) => (
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            key={stat.title}
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
            />
          </Grid>
        ))}
      </Grid>

      {/* =====================================================
          MAIN DASHBOARD SECTION
      ===================================================== */}

      <Grid
        container
        spacing={2.5}
        sx={{
          mt: 0,
        }}
      >
        {/* ===================================================
            ATTENDANCE OVERVIEW
        =================================================== */}

        <Grid item xs={12} lg={8}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              borderRadius: 3,
              border: `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.white,
              overflow: "hidden",
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2.5,
                  sm: 3,
                },
              }}
            >
              <Box
                sx={{
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
                  gap: 1.5,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: COLORS.navy,
                    }}
                  >
                    Today's Attendance
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.4,
                      fontSize: 13,
                      color: COLORS.muted,
                    }}
                  >
                    Current employee attendance status
                  </Typography>
                </Box>

                <Chip
                  label={
                    loading
                      ? "Loading"
                      : "Today"
                  }
                  size="small"
                  sx={{
                    backgroundColor: "#E8F4FF",
                    color: COLORS.blue,
                    fontWeight: 700,
                    borderRadius: 1.5,
                  }}
                />
              </Box>

              <Stack spacing={2.5}>
                <AttendanceRow
                  label="Present"
                  value={
                    loading
                      ? "..."
                      : presentToday
                  }
                  percentage={`${presentPercentage}%`}
                  status="success"
                />

                <AttendanceRow
                  label="Late"
                  value={
                    loading
                      ? "..."
                      : lateToday
                  }
                  percentage={`${latePercentage}%`}
                  status="warning"
                />

                <AttendanceRow
                  label="Absent"
                  value={
                    loading
                      ? "..."
                      : absentToday
                  }
                  percentage={`${absentPercentage}%`}
                  status="error"
                />
              </Stack>

              {/* Attendance Summary */}

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 2.5,
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #EEF2F7",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: COLORS.muted,
                      }}
                    >
                      Attendance Rate
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.3,
                        fontSize: 22,
                        fontWeight: 800,
                        color: COLORS.navy,
                      }}
                    >
                      {loading
                        ? "..."
                        : `${attendanceRate}%`}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      textAlign: "right",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: COLORS.muted,
                      }}
                    >
                      Total Employees
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.3,
                        fontSize: 18,
                        fontWeight: 700,
                        color: COLORS.navy,
                      }}
                    >
                      {loading
                        ? "..."
                        : totalEmployees}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ===================================================
            QUICK INFORMATION
        =================================================== */}

        <Grid item xs={12} lg={4}>
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
                p: {
                  xs: 2.5,
                  sm: 3,
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: COLORS.navy,
                }}
              >
                Quick Information
              </Typography>

              <Typography
                sx={{
                  mt: 0.4,
                  mb: 2.5,
                  fontSize: 13,
                  color: COLORS.muted,
                }}
              >
                Current office information
              </Typography>

              <Stack spacing={2}>
                <InfoRow
                  title="Working Hours"
                  value={workingHours}
                />

                <Divider />

                <InfoRow
                  title="Office Status"
                  value={officeStatus}
                  chip
                  isOpen={isOfficeOpen}
                />

                <Divider />

                <InfoRow
                  title="Attendance Date"
                  value={
                    loading
                      ? "..."
                      : formattedAttendanceDate
                  }
                />

                <Divider />

                <InfoRow
                  title="Total Employees"
                  value={
                    loading
                      ? "..."
                      : totalEmployees
                  }
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* =====================================================
          RECENT ACTIVITY
      ===================================================== */}

      <Box sx={{ mt: 2.5 }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${COLORS.border}`,
            backgroundColor: COLORS.white,
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2.5,
                sm: 3,
              },
            }}
          >
            <Box
              sx={{
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
                gap: 1,
                mb: 2.5,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: COLORS.navy,
                  }}
                >
                  Recent Activity
                </Typography>

                <Typography
                  sx={{
                    mt: 0.4,
                    fontSize: 13,
                    color: COLORS.muted,
                  }}
                >
                  Latest employee activities
                </Typography>
              </Box>

              <Chip
                label="Live"
                size="small"
                sx={{
                  backgroundColor: "#DCFCE7",
                  color: "#166534",
                  fontWeight: 700,
                }}
              />
            </Box>

            <Stack spacing={0}>
              <ActivityRow
                title="Employee attendance marked"
                description={
                  loading
                    ? "Loading attendance data..."
                    : presentToday > 0
                    ? `${presentToday} employee${
                        presentToday === 1
                          ? ""
                          : "s"
                      } checked in for today.`
                    : "No employees have checked in for today."
                }
                time={
                  loading
                    ? "Loading"
                    : "Today"
                }
                icon={<EventAvailable />}
              />

              <Divider />

              <ActivityRow
                title="Employee information"
                description={
                  loading
                    ? "Loading employee data..."
                    : `${totalEmployees} active employee${
                        totalEmployees === 1
                          ? ""
                          : "s"
                      } in the system.`
                }
                time="Current"
                icon={<People />}
              />

              <Divider />

              <ActivityRow
                title="Attendance report updated"
                description={
                  loading
                    ? "Loading attendance data..."
                    : `Today's attendance rate is ${attendanceRate}%.`
                }
                time={
                  loading
                    ? "Loading"
                    : "Today"
                }
                icon={<Assessment />}
              />
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

/* =============================================================
   STAT CARD
============================================================= */

function StatCard({
  title,
  value,
  subtitle,
  icon,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        minHeight: 154,
        borderRadius: 3,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.white,
        transition: "all 0.2s ease",

        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow:
            "0 12px 30px rgba(15,39,71,0.08)",
        },
      }}
    >
      <CardContent
        sx={{
          height: "100%",
          p: 2.5,
          "&:last-child": {
            pb: 2.5,
          },
        }}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 600,
                color: COLORS.muted,
                mb: 0.8,
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                fontSize: {
                  xs: 28,
                  sm: 30,
                },
                lineHeight: 1.1,
                fontWeight: 800,
                color: COLORS.navy,
              }}
            >
              {value}
            </Typography>

            <Typography
              sx={{
                mt: 0.7,
                fontSize: 11.5,
                color: "#94A3B8",
              }}
            >
              {subtitle}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 52,
              height: 52,
              minWidth: 52,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              backgroundColor: "#E8F7F5",
              color: COLORS.teal,

              "& svg": {
                fontSize: 25,
              },
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

/* =============================================================
   ATTENDANCE ROW
============================================================= */

function AttendanceRow({
  label,
  value,
  percentage,
  status,
}) {
  const progressColor =
    status === "success"
      ? COLORS.teal
      : status === "warning"
      ? "#F59E0B"
      : "#EF4444";

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: "#374151",
          }}
        >
          {label}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              color: COLORS.muted,
            }}
          >
            {percentage}
          </Typography>

          <Typography
            sx={{
              minWidth: 28,
              textAlign: "right",
              fontSize: 13,
              fontWeight: 800,
              color: COLORS.navy,
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          width: "100%",
          height: 8,
          borderRadius: 5,
          backgroundColor: "#E8EDF3",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: percentage,
            backgroundColor: progressColor,
            borderRadius: 5,
            transition: "width 0.4s ease",
          }}
        />
      </Box>
    </Box>
  );
}

/* =============================================================
   INFORMATION ROW
============================================================= */

function InfoRow({
  title,
  value,
  chip = false,
  isOpen = true,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Typography
        sx={{
          fontSize: 13,
          color: COLORS.muted,
        }}
      >
        {title}
      </Typography>

      {chip ? (
        <Chip
          label={value}
          size="small"
          sx={{
            height: 26,
            backgroundColor: isOpen
              ? "#DCFCE7"
              : "#FEE2E2",
            color: isOpen
              ? "#166534"
              : "#991B1B",
            fontSize: 11,
            fontWeight: 700,
          }}
        />
      ) : (
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: COLORS.text,
            textAlign: "right",
          }}
        >
          {value}
        </Typography>
      )}
    </Box>
  );
}

/* =============================================================
   ACTIVITY ROW
============================================================= */

function ActivityRow({
  title,
  description,
  time,
  icon,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: 1.8,
      }}
    >
      <Box
        sx={{
          width: 42,
          height: 42,
          minWidth: 42,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          backgroundColor: "#E8F7F5",
          color: COLORS.teal,

          "& svg": {
            fontSize: 20,
          },
        }}
      >
        {icon}
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: COLORS.text,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            mt: 0.3,
            fontSize: 12,
            color: COLORS.muted,
          }}
        >
          {description}
        </Typography>
      </Box>

      <Typography
        sx={{
          flexShrink: 0,
          fontSize: 11,
          color: "#94A3B8",
        }}
      >
        {time}
      </Typography>
    </Box>
  );
}

export default Dashboard;