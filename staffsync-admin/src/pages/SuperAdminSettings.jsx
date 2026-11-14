import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  MenuItem,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import {
  AccessTime,
  Assessment,
  Business,
  Notifications,
  Save,
  Security,
  Settings as SettingsIcon,
} from "@mui/icons-material";

import {
  getSuperAdminSettings,
  updateSuperAdminSettings,
} from "../services/superAdminSettingsApiService";

const DEFAULT_SETTINGS = {
  companyName: "StaffSync",
  companyEmail: "support@staffsync.com",
  companyPhone: "",
  companyAddress: "",
  website: "",

  officeStartTime: "09:30",
  officeEndTime: "18:30",
  gracePeriod: "15",
  halfDayThreshold: "4",

  sessionTimeout: "30",
  maxLoginAttempts: "5",
  passwordExpiry: "90",

  strongPassword: true,
  ipBlocking: true,
  loginActivity: true,

  attendanceNotifications: true,
  lateAttendanceAlerts: true,
  absentEmployeeAlerts: true,
  emailNotifications: true,

  defaultReport: "attendance",
  defaultDateRange: "current-month",
  dateFormat: "DD-MM-YYYY",
  timeFormat: "12-hour",

  timezone: "Asia/Kolkata",
  maintenanceMode: false,
};

function SuperAdminSettings() {
  const [settings, setSettings] = useState({
    ...DEFAULT_SETTINGS,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSuperAdminSettings();

      setSettings({
        ...DEFAULT_SETTINGS,

        companyName:
          data?.companyName ??
          DEFAULT_SETTINGS.companyName,

        companyEmail:
          data?.companyEmail ??
          DEFAULT_SETTINGS.companyEmail,

        companyPhone:
          data?.companyPhone ??
          DEFAULT_SETTINGS.companyPhone,

        companyAddress:
          data?.companyAddress ??
          DEFAULT_SETTINGS.companyAddress,

        website:
          data?.website ??
          DEFAULT_SETTINGS.website,

        officeStartTime:
          data?.officeStartTime ??
          DEFAULT_SETTINGS.officeStartTime,

        officeEndTime:
          data?.officeEndTime ??
          DEFAULT_SETTINGS.officeEndTime,

        gracePeriod:
          data?.gracePeriod ??
          DEFAULT_SETTINGS.gracePeriod,

        halfDayThreshold:
          data?.halfDayThreshold ??
          DEFAULT_SETTINGS.halfDayThreshold,

        sessionTimeout:
          data?.sessionTimeout ??
          DEFAULT_SETTINGS.sessionTimeout,

        maxLoginAttempts:
          data?.maxLoginAttempts ??
          DEFAULT_SETTINGS.maxLoginAttempts,

        passwordExpiry:
          data?.passwordExpiry ??
          DEFAULT_SETTINGS.passwordExpiry,

        strongPassword: convertBoolean(
          data?.strongPassword,
          DEFAULT_SETTINGS.strongPassword
        ),

        ipBlocking: convertBoolean(
          data?.ipBlocking,
          DEFAULT_SETTINGS.ipBlocking
        ),

        loginActivity: convertBoolean(
          data?.loginActivity,
          DEFAULT_SETTINGS.loginActivity
        ),

        attendanceNotifications: convertBoolean(
          data?.attendanceNotifications,
          DEFAULT_SETTINGS.attendanceNotifications
        ),

        lateAttendanceAlerts: convertBoolean(
          data?.lateAttendanceAlerts,
          DEFAULT_SETTINGS.lateAttendanceAlerts
        ),

        absentEmployeeAlerts: convertBoolean(
          data?.absentEmployeeAlerts,
          DEFAULT_SETTINGS.absentEmployeeAlerts
        ),

        emailNotifications: convertBoolean(
          data?.emailNotifications,
          DEFAULT_SETTINGS.emailNotifications
        ),

        defaultReport:
          data?.defaultReport ??
          DEFAULT_SETTINGS.defaultReport,

        defaultDateRange:
          data?.defaultDateRange ??
          DEFAULT_SETTINGS.defaultDateRange,

        dateFormat:
          data?.dateFormat ??
          DEFAULT_SETTINGS.dateFormat,

        timeFormat:
          data?.timeFormat ??
          DEFAULT_SETTINGS.timeFormat,

        timezone:
          data?.timezone ??
          DEFAULT_SETTINGS.timezone,

        maintenanceMode: convertBoolean(
          data?.maintenanceMode,
          DEFAULT_SETTINGS.maintenanceMode
        ),
      });
    } catch (err) {
      console.error("Settings load error:", err);

      setError(
        err?.message ||
          "Unable to load settings."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setSettings((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  const handleSwitchChange = (field) => (event) => {
    setSettings((previous) => ({
      ...previous,
      [field]: event.target.checked,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const payload =
        convertSettingsForBackend(settings);

      console.log(
        "Saving StaffSync settings:",
        payload
      );

      await updateSuperAdminSettings(payload);

      setSnackbar({
        open: true,
        message:
          "Settings saved successfully.",
        severity: "success",
      });

      await loadSettings();
    } catch (err) {
      console.error(
        "Settings save error:",
        err
      );

      setSnackbar({
        open: true,
        message:
          err?.message ||
          "Failed to save settings.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      ...DEFAULT_SETTINGS,
    });

    setSnackbar({
      open: true,
      message:
        "Form restored to default values. Click Save Changes to save them.",
      severity: "info",
    });
  };

  if (loading) {
    return (
      <Box
          sx={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f7f9fc",
          }}
        >
          <Typography
            sx={{
              color: "#64748b",
              fontWeight: 500,
            }}
          >
            Loading settings...
          </Typography>
      </Box>
    );
  }

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
              sx={{
                mb: 0.5,
              }}
            >
              <SettingsIcon
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
                Settings
              </Typography>
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Manage StaffSync system
              configuration
            </Typography>
          </Box>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1}
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
            }}
          >
            <Button
              variant="outlined"
              onClick={handleReset}
              disabled={saving}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#d1d5db",
                color: "#475569",
                "&:hover": {
                  borderColor: "#94a3b8",
                  backgroundColor: "#f8fafc",
                },
              }}
            >
              Reset
            </Button>

            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                backgroundColor: "#0F2747",
                "&:hover": {
                  backgroundColor: "#0b1d36",
                },
              }}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </Stack>
        </Box>

        {/* Error */}

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}

        {/* General Settings */}

        <SettingsSection
          icon={<Business />}
          title="General Settings"
          description="Basic organization and StaffSync information"
        >
          <Grid
            container
            spacing={2}
          >
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Organization Name"
                value={settings.companyName}
                onChange={handleChange(
                  "companyName"
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="email"
                label="Company Email"
                value={settings.companyEmail}
                onChange={handleChange(
                  "companyEmail"
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Company Phone"
                value={settings.companyPhone}
                onChange={handleChange(
                  "companyPhone"
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Website"
                value={settings.website}
                onChange={handleChange(
                  "website"
                )}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                multiline
                minRows={2}
                label="Company Address"
                value={settings.companyAddress}
                onChange={handleChange(
                  "companyAddress"
                )}
              />
            </Grid>
          </Grid>
        </SettingsSection>

        {/* Attendance Settings */}

        <SettingsSection
          icon={<AccessTime />}
          title="Attendance Settings"
          description="Configure working hours and attendance rules"
        >
          <Grid
            container
            spacing={2}
          >
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <TextField
                fullWidth
                size="small"
                type="time"
                label="Office Start Time"
                value={settings.officeStartTime}
                onChange={handleChange(
                  "officeStartTime"
                )}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <TextField
                fullWidth
                size="small"
                type="time"
                label="Office End Time"
                value={settings.officeEndTime}
                onChange={handleChange(
                  "officeEndTime"
                )}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Grace Period (Minutes)"
                value={settings.gracePeriod}
                onChange={handleChange(
                  "gracePeriod"
                )}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Half-Day Threshold (Hours)"
                value={settings.halfDayThreshold}
                onChange={handleChange(
                  "halfDayThreshold"
                )}
              />
            </Grid>
          </Grid>
        </SettingsSection>

        {/* Security Settings */}

        <SettingsSection
          icon={<Security />}
          title="Security Settings"
          description="Control login and system security policies"
        >
          <Grid
            container
            spacing={2}
          >
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Session Timeout (Minutes)"
                value={settings.sessionTimeout}
                onChange={handleChange(
                  "sessionTimeout"
                )}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Maximum Login Attempts"
                value={settings.maxLoginAttempts}
                onChange={handleChange(
                  "maxLoginAttempts"
                )}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Password Expiry (Days)"
                value={settings.passwordExpiry}
                onChange={handleChange(
                  "passwordExpiry"
                )}
              />
            </Grid>

            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <SettingSwitch
                label="Strong Password"
                description="Require stronger admin passwords"
                checked={settings.strongPassword}
                onChange={handleSwitchChange(
                  "strongPassword"
                )}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <SettingSwitch
                label="IP Blocking"
                description="Block unauthorized IP addresses"
                checked={settings.ipBlocking}
                onChange={handleSwitchChange(
                  "ipBlocking"
                )}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <SettingSwitch
                label="Login Activity"
                description="Track administrator login activity"
                checked={settings.loginActivity}
                onChange={handleSwitchChange(
                  "loginActivity"
                )}
              />
            </Grid>
          </Grid>
        </SettingsSection>

        {/* Notification Settings */}

        <SettingsSection
          icon={<Notifications />}
          title="Notification Settings"
          description="Manage StaffSync notifications and alerts"
        >
          <Grid
            container
            spacing={2}
          >
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <SettingSwitch
                label="Attendance Notifications"
                description="Notify when attendance is recorded"
                checked={
                  settings.attendanceNotifications
                }
                onChange={handleSwitchChange(
                  "attendanceNotifications"
                )}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <SettingSwitch
                label="Late Attendance Alerts"
                description="Notify administrators about late employees"
                checked={
                  settings.lateAttendanceAlerts
                }
                onChange={handleSwitchChange(
                  "lateAttendanceAlerts"
                )}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <SettingSwitch
                label="Absent Employee Alerts"
                description="Notify administrators about absences"
                checked={
                  settings.absentEmployeeAlerts
                }
                onChange={handleSwitchChange(
                  "absentEmployeeAlerts"
                )}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <SettingSwitch
                label="Email Notifications"
                description="Allow system email notifications"
                checked={
                  settings.emailNotifications
                }
                onChange={handleSwitchChange(
                  "emailNotifications"
                )}
              />
            </Grid>
          </Grid>
        </SettingsSection>

        {/* Report Settings */}

        <SettingsSection
          icon={<Assessment />}
          title="Report Settings"
          description="Configure default report preferences"
        >
          <Grid
            container
            spacing={2}
          >
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <TextField
                fullWidth
                size="small"
                select
                label="Default Report"
                value={settings.defaultReport}
                onChange={handleChange(
                  "defaultReport"
                )}
              >
                <MenuItem value="attendance">
                  Attendance Report
                </MenuItem>

                <MenuItem value="employee">
                  Employee Report
                </MenuItem>
              </TextField>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <TextField
                fullWidth
                size="small"
                select
                label="Default Date Range"
                value={settings.defaultDateRange}
                onChange={handleChange(
                  "defaultDateRange"
                )}
              >
                <MenuItem value="today">
                  Today
                </MenuItem>

                <MenuItem value="current-week">
                  Current Week
                </MenuItem>

                <MenuItem value="current-month">
                  Current Month
                </MenuItem>

                <MenuItem value="last-month">
                  Last Month
                </MenuItem>
              </TextField>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <TextField
                fullWidth
                size="small"
                select
                label="Date Format"
                value={settings.dateFormat}
                onChange={handleChange(
                  "dateFormat"
                )}
              >
                <MenuItem value="DD-MM-YYYY">
                  DD-MM-YYYY
                </MenuItem>

                <MenuItem value="MM-DD-YYYY">
                  MM-DD-YYYY
                </MenuItem>

                <MenuItem value="YYYY-MM-DD">
                  YYYY-MM-DD
                </MenuItem>
              </TextField>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <TextField
                fullWidth
                size="small"
                select
                label="Time Format"
                value={settings.timeFormat}
                onChange={handleChange(
                  "timeFormat"
                )}
              >
                <MenuItem value="12-hour">
                  12 Hour
                </MenuItem>

                <MenuItem value="24-hour">
                  24 Hour
                </MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </SettingsSection>

        {/* System Settings */}

        <SettingsSection
          icon={<SettingsIcon />}
          title="System Settings"
          description="Configure system-wide preferences"
        >
          <Grid
            container
            spacing={2}
          >
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <TextField
                fullWidth
                size="small"
                select
                label="Time Zone"
                value={settings.timezone}
                onChange={handleChange(
                  "timezone"
                )}
              >
                <MenuItem value="Asia/Kolkata">
                  India Standard Time (IST)
                </MenuItem>

                <MenuItem value="UTC">
                  UTC
                </MenuItem>

                <MenuItem value="Asia/Dubai">
                  Gulf Standard Time
                </MenuItem>
              </TextField>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <SettingSwitch
                label="Maintenance Mode"
                description="Temporarily restrict access to StaffSync"
                checked={settings.maintenanceMode}
                onChange={handleSwitchChange(
                  "maintenanceMode"
                )}
                warning
              />
            </Grid>
          </Grid>
        </SettingsSection>

        {/* Bottom Save */}

        <Box
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving}
            sx={{
              px: 3,
              textTransform: "none",
              fontWeight: 600,
              backgroundColor: "#0F2747",
              "&:hover": {
                backgroundColor: "#0b1d36",
              },
            }}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </Button>
        </Box>

        {/* Snackbar */}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
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
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
    </Box>
  );
}

/* ---------------------------------- */
/* Settings Section */
/* ---------------------------------- */

function SettingsSection({
  icon,
  title,
  description,
  children,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        mb: 2.5,
        border: "1px solid #e5e7eb",
        borderRadius: 2.5,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: {
            xs: 2,
            md: 2.5,
          },
          py: 1.75,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          backgroundColor: "#ffffff",
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
              "rgba(13,148,136,0.1)",
            color: "#0D9488",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#0F2747",
              fontSize: {
                xs: "1rem",
                sm: "1.1rem",
              },
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {description}
          </Typography>
        </Box>
      </Box>

      <Divider />

      <CardContent
        sx={{
          p: {
            xs: 2,
            md: 2.5,
          },
          "&:last-child": {
            pb: {
              xs: 2,
              md: 2.5,
            },
          },
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
}

/* ---------------------------------- */
/* Setting Switch */
/* ---------------------------------- */

function SettingSwitch({
  label,
  description,
  checked,
  onChange,
  warning = false,
}) {
  return (
    <Box
      sx={{
        minHeight: 68,
        px: 1.5,
        py: 1,
        border: "1px solid #e5e7eb",
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        backgroundColor:
          warning && checked
            ? "rgba(245,158,11,0.05)"
            : "#ffffff",
      }}
    >
      <Box>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: "#0F2747",
          }}
        >
          {label}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
        >
          {description}
        </Typography>
      </Box>

      <Switch
        checked={checked}
        onChange={onChange}
        sx={{
          "& .MuiSwitch-switchBase.Mui-checked": {
            color: "#0D9488",
          },

          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            backgroundColor: "#0D9488",
          },
        }}
      />
    </Box>
  );
}

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

function convertBoolean(value, fallback) {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return (
    String(value).toLowerCase() === "true"
  );
}

function convertSettingsForBackend(settings) {
  return {
    companyName: String(
      settings.companyName ?? ""
    ),

    companyEmail: String(
      settings.companyEmail ?? ""
    ),

    companyPhone: String(
      settings.companyPhone ?? ""
    ),

    companyAddress: String(
      settings.companyAddress ?? ""
    ),

    website: String(
      settings.website ?? ""
    ),

    officeStartTime: String(
      settings.officeStartTime ?? ""
    ),

    officeEndTime: String(
      settings.officeEndTime ?? ""
    ),

    gracePeriod: String(
      settings.gracePeriod ?? ""
    ),

    halfDayThreshold: String(
      settings.halfDayThreshold ?? ""
    ),

    sessionTimeout: String(
      settings.sessionTimeout ?? ""
    ),

    maxLoginAttempts: String(
      settings.maxLoginAttempts ?? ""
    ),

    passwordExpiry: String(
      settings.passwordExpiry ?? ""
    ),

    strongPassword: Boolean(
      settings.strongPassword
    ),

    ipBlocking: Boolean(
      settings.ipBlocking
    ),

    loginActivity: Boolean(
      settings.loginActivity
    ),

    attendanceNotifications: Boolean(
      settings.attendanceNotifications
    ),

    lateAttendanceAlerts: Boolean(
      settings.lateAttendanceAlerts
    ),

    absentEmployeeAlerts: Boolean(
      settings.absentEmployeeAlerts
    ),

    emailNotifications: Boolean(
      settings.emailNotifications
    ),

    defaultReport: String(
      settings.defaultReport ?? ""
    ),

    defaultDateRange: String(
      settings.defaultDateRange ?? ""
    ),

    dateFormat: String(
      settings.dateFormat ?? ""
    ),

    timeFormat: String(
      settings.timeFormat ?? ""
    ),

    timezone: String(
      settings.timezone ?? ""
    ),

    maintenanceMode: Boolean(
      settings.maintenanceMode
    ),
  };
}

export default SuperAdminSettings;