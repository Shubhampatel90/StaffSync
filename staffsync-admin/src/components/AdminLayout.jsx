
import { useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  GlobalStyles,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  Assessment,
  Dashboard,
  EventAvailable,
  KeyboardArrowDown,
  Logout,
  Menu as MenuIcon,
  NotificationsNone,
  People,
  Search,
  Settings,
  ChevronRight,
} from "@mui/icons-material";

import staffSyncLogo from "../assets/staffsync_logo.png";

const DRAWER_WIDTH = 276;

const COLORS = {
  navy: "#0F2747",
  navyDark: "#0A1C35",
  blue: "#2563EB",
  teal: "#0D9488",
  text: "#14213D",
  muted: "#64748B",
  border: "#E5EAF1",
  background: "#F5F8FC",
  white: "#FFFFFF",
};

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [search, setSearch] = useState("");

  // ============================================================
  // NAVIGATION
  // ============================================================

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
    setNotificationOpen(false);
    setProfileAnchor(null);
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");

    navigate("/login");
  };

  // ============================================================
  // DRAWER TOGGLE
  // ============================================================

  const handleDrawerToggle = () => {
    setMobileOpen((previous) => !previous);
  };

  // ============================================================
  // ACTIVE SIDEBAR ITEM
  // ============================================================

  const isActive = (path) => {
    return location.pathname === path;
  };

  // ============================================================
  // SIDEBAR
  // ============================================================

  const sidebarContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(
          180deg,
          ${COLORS.navy} 0%,
          ${COLORS.navyDark} 100%
        )`,
        color: COLORS.white,
      }}
    >
      {/* =====================================================
          LOGO
      ===================================================== */}

      <Box
        sx={{
          minHeight: 88,
          px: 2.5,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.10)",
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={staffSyncLogo}
              alt="StaffSync"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 20,
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: -0.5,
                color: "#FFFFFF",
              }}
            >
              Staff
              <span style={{ color: "#19C7B5" }}>
                Sync
              </span>
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 10,
                color: "#9DB0C8",
                letterSpacing: 0.8,
              }}
            >
              CONNECT • TRACK • GROW
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider
        sx={{
          borderColor: "rgba(255,255,255,0.10)",
        }}
      />

      {/* =====================================================
          ADMINISTRATION TITLE
      ===================================================== */}

      <Box
        sx={{
          px: 2.5,
          py: 2.5,
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            color: "#8EA4BF",
            fontWeight: 600,
          }}
        >
          Administration
        </Typography>

        <Typography
          sx={{
            mt: 0.6,
            fontSize: 18,
            fontWeight: 700,
            color: "#FFFFFF",
          }}
        >
          Admin Panel
        </Typography>
      </Box>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <Box
        sx={{
          px: 1.5,
          flex: 1,
        }}
      >
        <SidebarItem
          icon={<Dashboard />}
          label="Dashboard"
          active={isActive("/admin/dashboard")}
          onClick={() =>
            handleNavigation("/admin/dashboard")
          }
        />

        <SidebarItem
          icon={<People />}
          label="Employee"
          active={isActive("/admin/employee")}
          onClick={() =>
            handleNavigation("/admin/employee")
          }
        />

        <SidebarItem
          icon={<EventAvailable />}
          label="Attendance"
          active={isActive("/admin/attendance")}
          onClick={() =>
            handleNavigation("/admin/attendance")
          }
        />

        <SidebarItem
          icon={<Assessment />}
          label="Reports"
          active={isActive("/admin/reports")}
          onClick={() =>
            handleNavigation("/admin/reports")
          }
        />

        <SidebarItem
          icon={<Settings />}
          label="Settings"
          active={isActive("/admin/settings")}
          onClick={() =>
            handleNavigation("/admin/settings")
          }
        />
      </Box>

      {/* =====================================================
          BOTTOM STAFFSYNC MESSAGE
      ===================================================== */}

      <Box
        sx={{
          mx: 2,
          mb: 2,
          p: 1.7,
          borderRadius: 3,
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.30), rgba(13,148,136,0.30))",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Better Workforce
        </Typography>

        <Typography
          sx={{
            fontSize: 12,
            color: "#B7C8DC",
            mt: 0.2,
          }}
        >
          Better Tomorrow
        </Typography>

        <Typography
          sx={{
            fontSize: 10,
            color: "#63D7CC",
            mt: 1,
            letterSpacing: 0.6,
          }}
        >
          StaffSync
        </Typography>
      </Box>

      <Divider
        sx={{
          borderColor: "rgba(255,255,255,0.10)",
        }}
      />

      {/* =====================================================
          LOGOUT
      ===================================================== */}

      <Box
        sx={{
          px: 1.5,
          py: 1.5,
        }}
      >
        <SidebarItem
          icon={<Logout />}
          label="Logout"
          onClick={handleLogout}
        />
      </Box>
    </Box>
  );

  return (
    <>
      {/* ======================================================
          GLOBAL STYLES
      ====================================================== */}

      <GlobalStyles
        styles={{
          html: {
            width: "100%",
            minHeight: "100%",
            overflowX: "hidden",
          },

          body: {
            margin: 0,
            width: "100%",
            minHeight: "100%",
            overflowX: "hidden",
            backgroundColor: COLORS.background,
          },

          "#root": {
            width: "100%",
            minHeight: "100vh",
          },

          "*": {
            boxSizing: "border-box",
          },
        }}
      />

      {/* ======================================================
          MAIN WRAPPER
      ====================================================== */}

      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: COLORS.background,
          overflowX: "hidden",
        }}
      >
        {/* ====================================================
            DESKTOP SIDEBAR
        ==================================================== */}

        <Drawer
          variant="permanent"
          open
          sx={{
            display: {
              xs: "none",
              md: "block",
            },

            width: DRAWER_WIDTH,
            flexShrink: 0,

            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              border: "none",
              overflowX: "hidden",
            },
          }}
        >
          {sidebarContent}
        </Drawer>

        {/* ====================================================
            MOBILE SIDEBAR
        ==================================================== */}

        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: {
              xs: "block",
              md: "none",
            },

            "& .MuiDrawer-paper": {
              width: {
                xs: "86vw",
                sm: DRAWER_WIDTH,
              },

              maxWidth: DRAWER_WIDTH,
              border: "none",
              boxSizing: "border-box",
            },
          }}
        >
          {sidebarContent}
        </Drawer>

        {/* ====================================================
            MAIN CONTENT
        ==================================================== */}

        <Box
          component="main"
          sx={{
            width: {
              xs: "100%",
              md: `calc(100% - ${DRAWER_WIDTH}px)`,
            },

            ml: {
              xs: 0,
              md: `${DRAWER_WIDTH}px`,
            },

            minHeight: "100vh",
            minWidth: 0,
          }}
        >
          {/* ==================================================
              TOP NAVBAR
          ================================================== */}

          <AppBar
            position="sticky"
            elevation={0}
            sx={{
              top: 0,
              zIndex: (theme) =>
                theme.zIndex.drawer - 1,

              backgroundColor:
                "rgba(255,255,255,0.96)",

              backdropFilter: "blur(12px)",

              color: COLORS.text,

              borderBottom:
                `1px solid ${COLORS.border}`,
            }}
          >
            <Toolbar
              sx={{
                minHeight: {
                  xs: "64px !important",
                  md: "72px !important",
                },

                px: {
                  xs: 1.5,
                  sm: 2.5,
                  md: 3,
                  lg: 4,
                  xl: 5,
                },

                gap: {
                  xs: 1,
                  sm: 2,
                },
              }}
            >
              {/* MOBILE MENU */}

              <IconButton
                onClick={handleDrawerToggle}
                sx={{
                  display: {
                    xs: "flex",
                    md: "none",
                  },

                  color: COLORS.navy,
                  flexShrink: 0,
                }}
              >
                <MenuIcon />
              </IconButton>

              {/* SEARCH */}

              <TextField
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search anything..."
                size="small"
                sx={{
                  width: {
                    xs: "100%",
                    sm: 330,
                    md: 400,
                    lg: 480,
                  },

                  maxWidth: "100%",

                  "& .MuiOutlinedInput-root": {
                    height: 42,
                    borderRadius: 2.5,
                    backgroundColor: "#F1F5F9",

                    "& fieldset": {
                      borderColor: "transparent",
                    },

                    "&:hover fieldset": {
                      borderColor: "#D8E0EA",
                    },

                    "&.Mui-focused fieldset": {
                      borderColor: COLORS.blue,
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search
                        sx={{
                          color: COLORS.navy,
                          fontSize: 20,
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ flex: 1 }} />

              {/* =================================================
                  NOTIFICATIONS
              ================================================= */}

              <Tooltip title="Notifications">
                <IconButton
                  onClick={() =>
                    setNotificationOpen(
                      (value) => !value
                    )
                  }
                  sx={{
                    position: "relative",
                    color: COLORS.navy,
                    flexShrink: 0,
                  }}
                >
                  <NotificationsNone />

                  <Box
                    sx={{
                      position: "absolute",
                      top: 7,
                      right: 7,
                      width: 17,
                      height: 17,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      backgroundColor: "#EF4444",
                      color: "#FFFFFF",
                      fontSize: 9,
                      fontWeight: 700,
                      border: "2px solid #FFFFFF",
                    }}
                  >
                    3
                  </Box>
                </IconButton>
              </Tooltip>

              {/* =================================================
                  NOTIFICATION PANEL
              ================================================= */}

              {notificationOpen && (
                <Box
                  sx={{
                    position: "fixed",
                    top: 62,
                    right: {
                      xs: 10,
                      sm: 20,
                    },
                    width: {
                      xs: 280,
                      sm: 340,
                    },
                    maxWidth:
                      "calc(100vw - 20px)",
                    backgroundColor: "#FFFFFF",
                    border:
                      `1px solid ${COLORS.border}`,
                    borderRadius: 3,
                    boxShadow:
                      "0 16px 45px rgba(15,39,71,0.16)",
                    p: 2,
                    zIndex: 1400,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    Notifications
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: 13,
                      color: COLORS.muted,
                    }}
                  >
                    StaffSync dashboard is connected
                    to your database.
                  </Typography>
                </Box>
              )}

              {/* =================================================
                  PROFILE
              ================================================= */}

              <Box
                onClick={(event) =>
                  setProfileAnchor(
                    event.currentTarget
                  )
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                  minWidth: 0,
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    display: {
                      xs: "none",
                      sm: "block",
                    },

                    textAlign: "right",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: COLORS.text,
                      lineHeight: 1.2,
                    }}
                  >
                    Admin
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 11,
                      color: COLORS.muted,
                    }}
                  >
                    Administrator
                  </Typography>
                </Box>

                <Avatar
                  sx={{
                    width: {
                      xs: 38,
                      sm: 42,
                    },

                    height: {
                      xs: 38,
                      sm: 42,
                    },

                    backgroundColor:
                      COLORS.teal,

                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  A
                </Avatar>

                <KeyboardArrowDown
                  sx={{
                    display: {
                      xs: "none",
                      sm: "block",
                    },

                    color: COLORS.muted,
                  }}
                />
              </Box>

              {/* =================================================
                  PROFILE MENU
              ================================================= */}

              <Menu
                anchorEl={profileAnchor}
                open={Boolean(profileAnchor)}
                onClose={() =>
                  setProfileAnchor(null)
                }
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem
                  onClick={() =>
                    handleNavigation(
                      "/admin/settings"
                    )
                  }
                >
                  <Settings
                    sx={{
                      mr: 1.5,
                      fontSize: 20,
                    }}
                  />

                  Settings
                </MenuItem>

                <MenuItem
                  onClick={handleLogout}
                >
                  <Logout
                    sx={{
                      mr: 1.5,
                      fontSize: 20,
                    }}
                  />

                  Logout
                </MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>

          {/* ==================================================
              PAGE CONTENT
          ================================================== */}

          <Box
            sx={{
              width: "100%",
              minHeight: "calc(100vh - 72px)",
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </>
  );
}

/* =============================================================
   SIDEBAR ITEM
============================================================= */

function SidebarItem({
  icon,
  label,
  active = false,
  onClick,
}) {
  const itemsWithArrow = [
    "Employees",
    "Attendance",
    "Reports",
    "Settings",
  ];

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
        alignItems: "center",
        gap: 1.6,
        minHeight: 48,
        px: 1.8,
        mb: 0.6,
        borderRadius: 2.5,
        cursor: "pointer",

        color: active
          ? "#FFFFFF"
          : "#C5D3E3",

        background: active
          ? "linear-gradient(90deg, #2B65C8, #2456A5)"
          : "transparent",

        boxShadow: active
          ? "0 8px 20px rgba(0,0,0,0.16)"
          : "none",

        transition: "all 0.18s ease",

        "&:hover": {
          backgroundColor: active
            ? undefined
            : "rgba(255,255,255,0.08)",

          color: "#FFFFFF",

          transform:
            "translateX(2px)",
        },
      }}
    >
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          flexShrink: 0,

          "& svg": {
            fontSize: 21,
          },
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          fontSize: 14,
          fontWeight: active ? 700 : 500,
        }}
      >
        {label}
      </Typography>

      {!active &&
        itemsWithArrow.includes(label) && (
          <ChevronRight
            sx={{
              ml: "auto",
              fontSize: 17,
              opacity: 0.55,
            }}
          />
        )}
    </Box>
  );
}

export default AdminLayout;
