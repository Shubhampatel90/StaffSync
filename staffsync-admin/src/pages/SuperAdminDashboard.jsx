import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";

import {
  AdminPanelSettings,
  Assessment,
  CalendarMonth,
  CheckCircle,
  EventAvailable,
  Group,
  People,
  TrendingUp,
  ChevronRight,
} from "@mui/icons-material";

import superAdminDashboardApiService from "../services/superAdminDashboardApi";

const COLORS = {
  navy: "#0F2747",
  navyDark: "#0A1C35",
  navyLight: "#183B67",
  blue: "#2563EB",
  teal: "#0D9488",
  green: "#16A34A",
  purple: "#7C3AED",
  orange: "#F59E0B",
  text: "#14213D",
  muted: "#64748B",
  border: "#E5EAF1",
  background: "#F5F8FC",
  white: "#FFFFFF",
};

function SuperAdminDashboard() {
  const navigate = useNavigate();

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

      const data =
        await superAdminDashboardApiService.getDashboardData();

      console.log(
        "Super Admin Dashboard Data:",
        data
      );

      setDashboard(data);
    } catch (err) {
      console.error(
        "Dashboard API error:",
        err
      );

      if (err.response) {
        console.error(
          "Status:",
          err.response.status
        );

        console.error(
          "Response:",
          err.response.data
        );
      }

      setError(
        err.response?.data ||
          "Unable to load dashboard data. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight:
            "calc(100vh - 72px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
          backgroundColor:
            COLORS.background,
          px: 2,
        }}
      >
        <CircularProgress
          size={42}
          thickness={4}
          sx={{
            color: COLORS.teal,
          }}
        />

        <Typography
          sx={{
            color: COLORS.muted,
            fontSize: 14,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          Loading StaffSync dashboard...
        </Typography>
      </Box>
    );
  }

  // ============================================================
  // DASHBOARD
  // ============================================================

  return (
    <Box
      sx={{
        width: "100%",
        minHeight:
          "calc(100vh - 72px)",
        backgroundColor:
          COLORS.background,
        overflowX: "hidden",

        px: {
          xs: 1.5,
          sm: 2.5,
          md: 3,
          lg: 4,
          xl: 5,
        },

        py: {
          xs: 2,
          sm: 2.5,
          md: 3,
          lg: 3.5,
        },
      }}
    >
      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 2.5,
          }}
        >
          {error}
        </Alert>
      )}

      {/* ======================================================
          WELCOME CARD
      ====================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: {
            xs: 2,
            md: 2.5,
          },

          borderRadius: {
            xs: 3,
            md: 4,
          },

          border:
            "1px solid #DCEAF4",

          background:
            "linear-gradient(105deg, #EAF4FF 0%, #EFFCFB 52%, #DDF8F4 100%)",

          overflow: "hidden",

          position: "relative",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.2,
              sm: 3,
              md: 3.5,
            },

            "&:last-child": {
              pb: {
                xs: 2.2,
                sm: 3,
                md: 3.5,
              },
            },
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: 22,
                sm: 28,
                md: 32,
                lg: 34,
              },

              fontWeight: 800,
              lineHeight: 1.15,
              color: COLORS.navy,
              letterSpacing: -0.8,
            }}
          >
            Welcome back, Super Admin 👋
          </Typography>

          <Typography
            sx={{
              mt: 0.8,

              color: "#496582",

              fontSize: {
                xs: 12.5,
                sm: 14,
                md: 15,
              },
            }}
          >
            Here's what's happening in
            your StaffSync system today.
          </Typography>
        </CardContent>
      </Card>

      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },

          gap: {
            xs: 1.5,
            sm: 2,
            lg: 2.25,
          },

          mb: {
            xs: 2,
            md: 2.5,
          },
        }}
      >
        <StatCard
          title="Total Admins"
          value={
            dashboard?.totalAdmins ?? 0
          }
          subtitle="System administrators"
          change="Live"
          changeText="from database"
          icon={<AdminPanelSettings />}
          iconColor={COLORS.blue}
        />

        <StatCard
          title="Total Employees"
          value={
            dashboard?.totalEmployees ?? 0
          }
          subtitle="Registered employees"
          change="Live"
          changeText="from database"
          icon={<Group />}
          iconColor={COLORS.teal}
        />

        <StatCard
          title="Today's Present"
          value={
            dashboard?.present ?? 0
          }
          subtitle="Employees present"
          change={`${dashboard?.attendancePercentage ?? 0}%`}
          changeText="today"
          icon={<EventAvailable />}
          iconColor={COLORS.purple}
        />

        <StatCard
          title="Active Admins"
          value={
            dashboard?.activeAdmins ?? 0
          }
          subtitle="System administrators"
          change="Live"
          changeText="from database"
          icon={<AdminPanelSettings />}
          iconColor={COLORS.orange}
        />
      </Box>

      {/* ======================================================
          TWO COLUMN SECTION
      ====================================================== */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 2fr) minmax(300px, 1fr)",
            xl: "minmax(0, 2.1fr) minmax(330px, 0.9fr)",
          },

          gap: {
            xs: 1.5,
            md: 2.25,
          },

          mb: {
            xs: 2,
            md: 2.5,
          },
        }}
      >
        {/* ====================================================
            ATTENDANCE OVERVIEW
        ==================================================== */}

        <Card
          elevation={0}
          sx={{
            minWidth: 0,

            borderRadius: {
              xs: 3,
              md: 4,
            },

            border:
              `1px solid ${COLORS.border}`,

            backgroundColor:
              "#FFFFFF",
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2,
                sm: 2.5,
                md: 3,
              },

              "&:last-child": {
                pb: {
                  xs: 2,
                  sm: 2.5,
                  md: 3,
                },
              },
            }}
          >
            {/* Header */}

            <Box
              sx={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "flex-start",
                gap: 2,
                mb: 2.5,
              }}
            >
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: 1.2,
                  }}
                >
                  <IconCircle
                    icon={<CalendarMonth />}
                    background="#E9F5FF"
                    color={COLORS.blue}
                  />

                  <Box>
                    <Typography
                      sx={{
                        fontSize: {
                          xs: 17,
                          sm: 19,
                        },

                        fontWeight: 800,
                      }}
                    >
                      Attendance Overview
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.4,
                        color:
                          COLORS.muted,

                        fontSize: {
                          xs: 11.5,
                          sm: 13,
                        },
                      }}
                    >
                      Today's employee
                      attendance
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Date */}

              <Box
                sx={{
                  display: {
                    xs: "none",
                    sm: "flex",
                  },

                  alignItems:
                    "center",

                  gap: 0.5,

                  px: 1.2,
                  py: 0.8,

                  borderRadius: 2,

                  border:
                    `1px solid ${COLORS.border}`,

                  color:
                    COLORS.muted,
                }}
              >
                <CalendarMonth
                  sx={{
                    fontSize: 17,
                  }}
                />

                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {dashboard?.date ||
                    new Date()
                      .toISOString()
                      .split("T")[0]}
                </Typography>
              </Box>
            </Box>

            {/* Attendance Cards */}

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",

                gap: {
                  xs: 1,
                  sm: 1.5,
                },
              }}
            >
              <AttendanceCard
                label="Present"
                value={
                  dashboard?.present ?? 0
                }
                percentage={`${dashboard?.attendancePercentage ?? 0}%`}
                icon={<CheckCircle />}
                iconColor={COLORS.green}
                background="#F0FBF6"
              />

              <AttendanceCard
                label="Absent"
                value={
                  dashboard?.absent ?? 0
                }
                percentage="Absent today"
                icon={<People />}
                iconColor={COLORS.blue}
                background="#F2F7FF"
              />

              <AttendanceCard
                label="Half Day"
                value={
                  dashboard?.halfDay ?? 0
                }
                percentage="Half day today"
                icon={<EventAvailable />}
                iconColor={COLORS.orange}
                background="#FFF9EC"
              />
            </Box>

            {/* Attendance Progress */}

            <Box sx={{ mt: 2.5 }}>
              <Box
                sx={{
                  height: {
                    xs: 9,
                    sm: 11,
                  },

                  borderRadius: 20,

                  backgroundColor:
                    "#E7ECF2",

                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${Math.min(
                      dashboard?.attendancePercentage ||
                        0,
                      100
                    )}%`,

                    height: "100%",

                    borderRadius: 20,

                    background:
                      "linear-gradient(90deg, #0D9488, #19B7A8)",

                    transition:
                      "width 0.5s ease",
                  }}
                />
              </Box>

              <Typography
                sx={{
                  textAlign: "center",

                  mt: 1,

                  color:
                    COLORS.muted,

                  fontSize: {
                    xs: 10.5,
                    sm: 12,
                  },
                }}
              >
                {dashboard?.attendancePercentage ??
                  0}
                % attendance today
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <Card
          elevation={0}
          sx={{
            minWidth: 0,

            borderRadius: {
              xs: 3,
              md: 4,
            },

            border:
              `1px solid ${COLORS.border}`,

            backgroundColor:
              "#FFFFFF",
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2,
                sm: 2.5,
                md: 3,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                mb: 2.5,
              }}
            >
              <IconCircle
                icon={<TrendingUp />}
                background="#EEF2FF"
                color={COLORS.blue}
              />

              <Box>
                <Typography
                  sx={{
                    fontSize: {
                      xs: 17,
                      sm: 19,
                    },

                    fontWeight: 800,
                  }}
                >
                  Quick Actions
                </Typography>

                <Typography
                  sx={{
                    mt: 0.4,

                    color:
                      COLORS.muted,

                    fontSize: {
                      xs: 11.5,
                      sm: 13,
                    },
                  }}
                >
                  Manage your StaffSync
                  system
                </Typography>
              </Box>
            </Box>

            <QuickAction
              icon={
                <AdminPanelSettings />
              }
              label="Manage Admins"
              description="Add, edit or remove administrators"
              color={COLORS.teal}
              onClick={() =>
                navigate(
                  "/super-admin/admins"
                )
              }
            />

            <QuickAction
              icon={<People />}
              label="Manage Employees"
              description="View and manage employee details"
              color={COLORS.blue}
              onClick={() =>
                navigate(
                  "/super-admin/employees"
                )
              }
            />

            <QuickAction
              icon={<Assessment />}
              label="View Reports"
              description="Access attendance and system reports"
              color={COLORS.purple}
              onClick={() =>
                navigate(
                  "/super-admin/reports"
                )
              }
            />
          </CardContent>
        </Card>
      </Box>

      {/* ======================================================
          DATABASE STATUS
      ====================================================== */}

      <Card
        elevation={0}
        sx={{
          borderRadius: {
            xs: 3,
            md: 4,
          },

          border:
            `1px solid ${COLORS.border}`,

          backgroundColor:
            "#FFFFFF",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2,
              sm: 2.5,
              md: 3,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: {
                    xs: 17,
                    sm: 19,
                  },

                  fontWeight: 800,
                }}
              >
                StaffSync System Status
              </Typography>

              <Typography
                sx={{
                  mt: 0.4,

                  color:
                    COLORS.muted,

                  fontSize: {
                    xs: 11.5,
                    sm: 13,
                  },
                }}
              >
                Dashboard information is
                loaded directly from the
                StaffSync database.
              </Typography>
            </Box>

            <Chip
              icon={
                <CheckCircle
                  sx={{
                    fontSize: 17,
                  }}
                />
              }
              label={
                dashboard
                  ? "Connected"
                  : "Unavailable"
              }
              sx={{
                color: dashboard
                  ? COLORS.green
                  : "#DC2626",

                backgroundColor:
                  dashboard
                    ? "#F0FBF6"
                    : "#FEF2F2",

                border:
                  dashboard
                    ? "1px solid #C9F0DA"
                    : "1px solid #FECACA",

                fontWeight: 700,

                flexShrink: 0,
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

/* ============================================================
   ICON CIRCLE
============================================================ */

function IconCircle({
  icon,
  background,
  color,
}) {
  return (
    <Box
      sx={{
        width: {
          xs: 38,
          sm: 42,
        },

        height: {
          xs: 38,
          sm: 42,
        },

        borderRadius: "50%",

        display: "grid",
        placeItems: "center",

        backgroundColor:
          background,

        color,

        flexShrink: 0,

        "& svg": {
          fontSize: {
            xs: 19,
            sm: 21,
          },
        },
      }}
    >
      {icon}
    </Box>
  );
}

/* ============================================================
   STATISTICS CARD
============================================================ */

function StatCard({
  title,
  value,
  subtitle,
  change,
  changeText,
  icon,
  iconColor,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        minWidth: 0,
        height: "100%",

        borderRadius: {
          xs: 3,
          md: 3.5,
        },

        border:
          `1px solid ${COLORS.border}`,

        backgroundColor:
          "#FFFFFF",

        transition:
          "transform 0.18s ease, box-shadow 0.18s ease",

        "&:hover": {
          transform:
            "translateY(-2px)",

          boxShadow:
            "0 12px 28px rgba(15,39,71,0.08)",
        },
      }}
    >
      <CardContent
        sx={{
          height: "100%",

          p: {
            xs: 1.8,
            sm: 2.2,
            md: 2.5,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",

            alignItems:
              "flex-start",

            justifyContent:
              "space-between",

            gap: 1.5,
          }}
        >
          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                color:
                  COLORS.muted,

                fontSize: {
                  xs: 11.5,
                  sm: 13,
                },

                fontWeight: 600,

                whiteSpace:
                  "nowrap",

                overflow:
                  "hidden",

                textOverflow:
                  "ellipsis",
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                mt: 0.4,

                fontSize: {
                  xs: 28,
                  sm: 31,
                  md: 34,
                },

                lineHeight: 1,

                fontWeight: 800,

                color:
                  COLORS.text,
              }}
            >
              {value}
            </Typography>

            <Typography
              sx={{
                mt: 0.7,

                color: "#8A9AAF",

                fontSize: {
                  xs: 10.5,
                  sm: 11.5,
                },

                whiteSpace:
                  "nowrap",

                overflow:
                  "hidden",

                textOverflow:
                  "ellipsis",
              }}
            >
              {subtitle}
            </Typography>
          </Box>

          <Box
            sx={{
              width: {
                xs: 42,
                sm: 48,
              },

              height: {
                xs: 42,
                sm: 48,
              },

              borderRadius: 2.5,

              display: "grid",
              placeItems: "center",

              backgroundColor:
                `${iconColor}14`,

              color: iconColor,

              flexShrink: 0,

              "& svg": {
                fontSize: {
                  xs: 21,
                  sm: 24,
                },
              },
            }}
          >
            {icon}
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",

            alignItems:
              "center",

            gap: 1,

            mt: {
              xs: 1.5,
              sm: 2,
            },
          }}
        >
          <Typography
            sx={{
              color:
                COLORS.green,

              fontSize: 11,

              fontWeight: 800,

              whiteSpace:
                "nowrap",
            }}
          >
            {change}
          </Typography>

          <Typography
            sx={{
              color: "#94A3B8",

              fontSize: 10.5,

              whiteSpace:
                "nowrap",

              overflow:
                "hidden",

              textOverflow:
                "ellipsis",
            }}
          >
            {changeText}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

/* ============================================================
   ATTENDANCE CARD
============================================================ */

function AttendanceCard({
  label,
  value,
  percentage,
  icon,
  iconColor,
  background,
}) {
  return (
    <Box
      sx={{
        minWidth: 0,

        p: {
          xs: 1.1,
          sm: 1.7,
        },

        borderRadius: 2.5,

        backgroundColor:
          background,

        border:
          "1px solid rgba(148,163,184,0.12)",
      }}
    >
      <Box
        sx={{
          display: "flex",

          alignItems:
            "center",

          gap: {
            xs: 0.7,
            sm: 1,
          },
        }}
      >
        <Box
          sx={{
            width: {
              xs: 27,
              sm: 34,
            },

            height: {
              xs: 27,
              sm: 34,
            },

            borderRadius: "50%",

            display: "grid",
            placeItems: "center",

            backgroundColor:
              `${iconColor}18`,

            color: iconColor,

            flexShrink: 0,

            "& svg": {
              fontSize: {
                xs: 15,
                sm: 18,
              },
            },
          }}
        >
          {icon}
        </Box>

        <Typography
          sx={{
            color:
              COLORS.text,

            fontSize: {
              xs: 10.5,
              sm: 12,
            },

            fontWeight: 700,

            whiteSpace:
              "nowrap",

            overflow:
              "hidden",

            textOverflow:
              "ellipsis",
          }}
        >
          {label}
        </Typography>
      </Box>

      <Typography
        sx={{
          mt: {
            xs: 1.1,
            sm: 1.5,
          },

          fontSize: {
            xs: 21,
            sm: 26,
          },

          lineHeight: 1,

          fontWeight: 800,

          color:
            COLORS.text,
        }}
      >
        {value}
      </Typography>

      <Typography
        sx={{
          mt: 0.5,

          color:
            COLORS.muted,

          fontSize: {
            xs: 9.5,
            sm: 11,
          },
        }}
      >
        {percentage}
      </Typography>
    </Box>
  );
}

/* ============================================================
   QUICK ACTION
============================================================ */

function QuickAction({
  icon,
  label,
  description,
  color,
  onClick,
}) {
  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          onClick?.();
        }
      }}
      sx={{
        display: "flex",

        alignItems:
          "center",

        gap: {
          xs: 1.1,
          sm: 1.4,
        },

        p: {
          xs: 1.2,
          sm: 1.35,
        },

        mb: 1.1,

        borderRadius: 2.5,

        border:
          `1px solid ${COLORS.border}`,

        cursor: "pointer",

        transition:
          "all 0.18s ease",

        "&:hover": {
          borderColor:
            `${color}55`,

          backgroundColor:
            "#FBFDFF",

          transform:
            "translateX(2px)",

          boxShadow:
            "0 7px 18px rgba(15,39,71,0.06)",
        },
      }}
    >
      <Box
        sx={{
          width: {
            xs: 38,
            sm: 43,
          },

          height: {
            xs: 38,
            sm: 43,
          },

          borderRadius: 2,

          display: "grid",
          placeItems: "center",

          backgroundColor:
            `${color}13`,

          color,

          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box
        sx={{
          minWidth: 0,
          flex: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: {
              xs: 12.5,
              sm: 13.5,
            },

            fontWeight: 750,

            color:
              COLORS.text,
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            mt: 0.2,

            color:
              COLORS.muted,

            fontSize: {
              xs: 9.5,
              sm: 10.5,
            },

            whiteSpace:
              "nowrap",

            overflow:
              "hidden",

            textOverflow:
              "ellipsis",
          }}
        >
          {description}
        </Typography>
      </Box>

      <ChevronRight
        sx={{
          color:
            "#94A3B8",

          fontSize: 20,

          flexShrink: 0,
        }}
      />
    </Box>
  );
}

export default SuperAdminDashboard;