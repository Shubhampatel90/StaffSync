
import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  MenuItem,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import SettingsIcon from "@mui/icons-material/Settings";
import Person from "@mui/icons-material/Person";
import Schedule from "@mui/icons-material/Schedule";
import Notifications from "@mui/icons-material/Notifications";
import Security from "@mui/icons-material/Security";
import Save from "@mui/icons-material/Save";
import RestartAlt from "@mui/icons-material/RestartAlt";
import AdminPanelSettings from "@mui/icons-material/AdminPanelSettings";
import FactCheck from "@mui/icons-material/FactCheck";
import Storage from "@mui/icons-material/Storage";

const STORAGE_KEY = "staffsync_admin_settings";

const COLORS = {
  navy: "#0F2747",
  teal: "#0D9488",
  dark: "#1F2937",
  muted: "#64748B",
  border: "#E2E8F0",
  background: "#F8FAFC",
  white: "#FFFFFF",
};

const DEFAULT_SETTINGS = {
  // Attendance and scheduling
  officeStartTime: "09:00",
  officeEndTime: "18:00",
  lateGraceMinutes: 15,
  halfDayHours: 4,
  fullDayHours: 8,
  autoMarkAbsent: true,
  allowPunchOutsideHours: false,

  // Notifications
  attendanceNotifications: true,
  lateArrivalNotifications: true,
  absentNotifications: true,
  employeeUpdateNotifications: true,
  emailNotifications: false,
  failedLoginAlerts: true,

  // Security
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  passwordExpiryDays: 90,
  requireStrongPassword: true,

  // Audit and system
  auditLogging: true,
  maintenanceMode: false,

  // Reporting and regional preferences
  timezone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24-hour",
};

const ADMIN_NOTIFICATION_KEYS = [
  "attendanceNotifications",
  "lateArrivalNotifications",
  "absentNotifications",
  "employeeUpdateNotifications",
  "emailNotifications",
];

const cardSx = {
  border: `1px solid ${COLORS.border}`,
  borderRadius: 3,
  boxShadow: "0 3px 14px rgba(15,39,71,0.04)",
  overflow: "hidden",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: COLORS.white,
  },
};

function readStoredSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return {};

    const parsed = JSON.parse(saved);

    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch (error) {
    console.error("Could not load settings:", error);
    return {};
  }
}

function SectionHeading({ icon, title, subtitle }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: COLORS.teal,
          backgroundColor: "#E6FFFB",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: 17, color: COLORS.navy }}>
          {title}
        </Typography>

        <Typography sx={{ color: COLORS.muted, fontSize: 13, mt: 0.3 }}>
          {subtitle}
        </Typography>
      </Box>
    </Stack>
  );
}

function SettingSwitch({
  title,
  description,
  checked,
  onChange,
  disabled = false,
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
      sx={{ py: 1.5 }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: COLORS.dark }}>
          {title}
        </Typography>

        <Typography sx={{ fontSize: 12, color: COLORS.muted, mt: 0.4 }}>
          {description}
        </Typography>
      </Box>

      <Switch
        checked={Boolean(checked)}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        inputProps={{ "aria-label": title }}
        sx={{
          "& .MuiSwitch-switchBase.Mui-checked": {
            color: COLORS.teal,
          },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            backgroundColor: COLORS.teal,
          },
        }}
      />
    </Stack>
  );
}

function SettingsGrid({ children }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
        },
        gap: 2.5,
      }}
    >
      {children}
    </Box>
  );
}

function SettingsField(props) {
  return <TextField fullWidth sx={fieldSx} {...props} />;
}

export default function Settings() {
  const role = (
    localStorage.getItem("adminRole") || "ADMIN"
  ).trim().toUpperCase();

  const isSuperAdmin = role === "SUPER_ADMIN";

  const adminName =
    localStorage.getItem("adminName") || "Administrator";

  const adminEmail =
    localStorage.getItem("adminEmail") || "admin@staffsync.com";

  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const saved = readStoredSettings();

    setSettings({
      ...DEFAULT_SETTINGS,
      ...saved,
    });
  }, []);

  const updateSetting = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const showMessage = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const validateSettings = () => {
    if (!isSuperAdmin) return true;

    if (!settings.officeStartTime || !settings.officeEndTime) {
      showMessage("Please enter both office start and end times.", "error");
      return false;
    }

    if (settings.officeStartTime >= settings.officeEndTime) {
      showMessage(
        "Office end time must be later than office start time. Overnight shifts need separate schedule support.",
        "error"
      );
      return false;
    }

    if (
      !Number.isFinite(Number(settings.lateGraceMinutes)) ||
      settings.lateGraceMinutes < 0 ||
      settings.lateGraceMinutes > 180
    ) {
      showMessage("Grace period must be between 0 and 180 minutes.", "error");
      return false;
    }

    if (
      !Number.isFinite(Number(settings.halfDayHours)) ||
      settings.halfDayHours <= 0 ||
      settings.halfDayHours > 24
    ) {
      showMessage("Half-day hours must be greater than 0 and at most 24.", "error");
      return false;
    }

    if (
      !Number.isFinite(Number(settings.fullDayHours)) ||
      settings.fullDayHours <= 0 ||
      settings.fullDayHours > 24
    ) {
      showMessage("Full-day hours must be greater than 0 and at most 24.", "error");
      return false;
    }

    if (Number(settings.halfDayHours) >= Number(settings.fullDayHours)) {
      showMessage(
        "Full-day hours must be greater than half-day hours.",
        "error"
      );
      return false;
    }

    if (
      ![15, 30, 60, 120, 480].includes(Number(settings.sessionTimeout))
    ) {
      showMessage("Please select a valid session timeout.", "error");
      return false;
    }

    if (
      !Number.isInteger(Number(settings.maxLoginAttempts)) ||
      settings.maxLoginAttempts < 3 ||
      settings.maxLoginAttempts > 10
    ) {
      showMessage("Maximum login attempts must be between 3 and 10.", "error");
      return false;
    }

    if (
      !Number.isInteger(Number(settings.passwordExpiryDays)) ||
      settings.passwordExpiryDays < 30 ||
      settings.passwordExpiryDays > 365
    ) {
      showMessage("Password expiry must be between 30 and 365 days.", "error");
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateSettings()) return;

    try {
      const existing = readStoredSettings();

      let nextSettings;

      if (isSuperAdmin) {
        nextSettings = {
          ...DEFAULT_SETTINGS,
          ...existing,
          ...settings,
          lateGraceMinutes: Number(settings.lateGraceMinutes),
          halfDayHours: Number(settings.halfDayHours),
          fullDayHours: Number(settings.fullDayHours),
          sessionTimeout: Number(settings.sessionTimeout),
          maxLoginAttempts: Number(settings.maxLoginAttempts),
          passwordExpiryDays: Number(settings.passwordExpiryDays),
        };
      } else {
        // Admin can update only personal notification preferences.
        // Existing global settings are preserved.
        nextSettings = {
          ...DEFAULT_SETTINGS,
          ...existing,
        };

        ADMIN_NOTIFICATION_KEYS.forEach((key) => {
          nextSettings[key] = Boolean(settings[key]);
        });
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings));
      setSettings(nextSettings);

      showMessage(
        isSuperAdmin
          ? "Settings saved in this browser. Backend enforcement is still required for global policies."
          : "Your notification preferences have been saved."
      );
    } catch (error) {
      console.error("Could not save settings:", error);
      showMessage("Unable to save settings in this browser.", "error");
    }
  };

  const handleReset = () => {
    if (!isSuperAdmin) {
      showMessage(
        "Only Super Admin can reset organization settings.",
        "warning"
      );
      return;
    }

    try {
      const existing = readStoredSettings();

      // Keep the operation scoped to StaffSync settings.
      const nextSettings = {
        ...existing,
        ...DEFAULT_SETTINGS,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings));
      setSettings({ ...DEFAULT_SETTINGS });

      showMessage("Settings restored to their default values.");
    } catch (error) {
      console.error("Could not reset settings:", error);
      showMessage("Unable to reset settings.", "error");
    }
  };

  const initials = adminName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        backgroundColor: COLORS.background,
        p: { xs: 2, sm: 3, md: 4 },
        boxSizing: "border-box",
      }}
    >
      {/* Page heading */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <SettingsIcon sx={{ color: COLORS.teal, fontSize: 29 }} />

            <Typography
              variant="h5"
              sx={{ color: COLORS.navy, fontWeight: 800 }}
            >
              Settings
            </Typography>
          </Stack>

          <Typography sx={{ mt: 0.8, color: COLORS.muted, fontSize: 14 }}>
            Manage StaffSync preferences, attendance policies and security.
          </Typography>
        </Box>

        <Chip
          icon={<AdminPanelSettings />}
          label={isSuperAdmin ? "Super Admin Access" : "Admin Access"}
          sx={{
            backgroundColor: isSuperAdmin ? "#CCFBF1" : "#DBEAFE",
            color: isSuperAdmin ? "#115E59" : "#1D4ED8",
            fontWeight: 700,
            borderRadius: 2,
            height: 36,
          }}
        />
      </Stack>

      {!isSuperAdmin && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          You have Admin-level access. Organization-wide attendance rules,
          security policies, audit controls and system maintenance are
          restricted to Super Admin.
        </Alert>
      )}

      {/* Profile */}
      <Card sx={{ ...cardSx, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <SectionHeading
            icon={<Person />}
            title="Admin Profile"
            subtitle="Account details for your current login."
          />

          <Divider sx={{ my: 2.5 }} />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2.5}
          >
            <Avatar
              sx={{
                width: 68,
                height: 68,
                backgroundColor: COLORS.navy,
                fontWeight: 800,
                fontSize: 23,
              }}
            >
              {initials || "A"}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{ fontSize: 19, fontWeight: 800, color: COLORS.navy }}
              >
                {adminName}
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  color: COLORS.muted,
                  fontSize: 14,
                  overflowWrap: "anywhere",
                }}
              >
                {adminEmail}
              </Typography>

              <Chip
                label={role}
                size="small"
                sx={{
                  mt: 1,
                  backgroundColor: isSuperAdmin ? "#CCFBF1" : "#DBEAFE",
                  fontWeight: 700,
                }}
              />
            </Box>
          </Stack>

          <Typography sx={{ mt: 2.5, fontSize: 12, color: COLORS.muted }}>
            Account name, email and role come from the current login. Manage
            account access and role assignments through the authorized account
            management workflow.
          </Typography>
        </CardContent>
      </Card>

      {/* Organization-wide attendance: Super Admin only */}
      {isSuperAdmin && (
        <Card sx={{ ...cardSx, mb: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <SectionHeading
              icon={<Schedule />}
              title="Attendance & Scheduling"
              subtitle="Configure organization-wide attendance policy defaults."
            />

            <Divider sx={{ my: 2.5 }} />

            <SettingsGrid>
              <SettingsField
                label="Office Start Time"
                type="time"
                value={settings.officeStartTime}
                onChange={(e) =>
                  updateSetting("officeStartTime", e.target.value)
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <SettingsField
                label="Office End Time"
                type="time"
                value={settings.officeEndTime}
                onChange={(e) =>
                  updateSetting("officeEndTime", e.target.value)
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <SettingsField
                label="Late Grace Period (minutes)"
                type="number"
                value={settings.lateGraceMinutes}
                onChange={(e) =>
                  updateSetting(
                    "lateGraceMinutes",
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                slotProps={{ htmlInput: { min: 0, max: 180 } }}
                helperText="Maximum 180 minutes."
              />

              <SettingsField
                label="Half-Day Threshold (hours)"
                type="number"
                value={settings.halfDayHours}
                onChange={(e) =>
                  updateSetting(
                    "halfDayHours",
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                slotProps={{
                  htmlInput: { min: 0.5, max: 24, step: 0.5 },
                }}
              />

              <SettingsField
                label="Full-Day Threshold (hours)"
                type="number"
                value={settings.fullDayHours}
                onChange={(e) =>
                  updateSetting(
                    "fullDayHours",
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                slotProps={{
                  htmlInput: { min: 0.5, max: 24, step: 0.5 },
                }}
              />
            </SettingsGrid>

            <Divider sx={{ my: 2 }} />

            <SettingSwitch
              title="Automatically Mark Absent"
              description="Enable the organization policy to mark employees absent when they have no valid punch-in."
              checked={settings.autoMarkAbsent}
              onChange={(value) => updateSetting("autoMarkAbsent", value)}
            />

            <Divider />

            <SettingSwitch
              title="Allow Punching Outside Office Hours"
              description="Allow employees to record punches outside the configured office schedule."
              checked={settings.allowPunchOutsideHours}
              onChange={(value) =>
                updateSetting("allowPunchOutsideHours", value)
              }
            />

            <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
              These settings are currently browser-stored defaults. Automatic
              absence marking and punch validation must be implemented in the
              Spring Boot backend and run through a server-side schedule to
              affect actual attendance records.
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Notifications: both roles */}
      <Card sx={{ ...cardSx, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <SectionHeading
            icon={<Notifications />}
            title="Notification Preferences"
            subtitle="Choose which StaffSync activity alerts you want to receive."
          />

          <Divider sx={{ my: 2.5 }} />

          <SettingSwitch
            title="Attendance Notifications"
            description="Receive alerts about attendance activity."
            checked={settings.attendanceNotifications}
            onChange={(v) => updateSetting("attendanceNotifications", v)}
          />

          <Divider />

          <SettingSwitch
            title="Late Arrival Notifications"
            description="Receive alerts when employees arrive late."
            checked={settings.lateArrivalNotifications}
            onChange={(v) => updateSetting("lateArrivalNotifications", v)}
          />

          <Divider />

          <SettingSwitch
            title="Absent Employee Notifications"
            description="Receive alerts about employees marked absent."
            checked={settings.absentNotifications}
            onChange={(v) => updateSetting("absentNotifications", v)}
          />

          <Divider />

          <SettingSwitch
            title="Employee Update Notifications"
            description="Receive alerts when employee records are updated."
            checked={settings.employeeUpdateNotifications}
            onChange={(v) => updateSetting("employeeUpdateNotifications", v)}
          />

          <Divider />

          <SettingSwitch
            title="Email Notifications"
            description="Enable your preference for receiving email alerts."
            checked={settings.emailNotifications}
            onChange={(v) => updateSetting("emailNotifications", v)}
          />

          {isSuperAdmin && (
            <>
              <Divider />

              <SettingSwitch
                title="Failed Login Alerts"
                description="Enable alerts for repeated failed login attempts across the organization."
                checked={settings.failedLoginAlerts}
                onChange={(v) => updateSetting("failedLoginAlerts", v)}
              />
            </>
          )}

          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            Saving a notification preference does not send messages by itself.
            Email or in-app delivery requires backend notification services.
          </Alert>
        </CardContent>
      </Card>

      {/* Security: Super Admin only */}
      {isSuperAdmin && (
        <Card sx={{ ...cardSx, mb: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <SectionHeading
              icon={<Security />}
              title="Security & Session Policies"
              subtitle="Configure intended organization-wide security defaults."
            />

            <Divider sx={{ my: 2.5 }} />

            <SettingsGrid>
              <SettingsField
                select
                label="Session Timeout"
                value={settings.sessionTimeout}
                onChange={(e) =>
                  updateSetting("sessionTimeout", Number(e.target.value))
                }
                helperText="Requires backend session enforcement."
              >
                <MenuItem value={15}>15 minutes</MenuItem>
                <MenuItem value={30}>30 minutes</MenuItem>
                <MenuItem value={60}>1 hour</MenuItem>
                <MenuItem value={120}>2 hours</MenuItem>
                <MenuItem value={480}>8 hours</MenuItem>
              </SettingsField>

              <SettingsField
                label="Maximum Login Attempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) =>
                  updateSetting(
                    "maxLoginAttempts",
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                slotProps={{ htmlInput: { min: 3, max: 10, step: 1 } }}
                helperText="Allowed range: 3–10 attempts."
              />

              <SettingsField
                label="Password Expiry (days)"
                type="number"
                value={settings.passwordExpiryDays}
                onChange={(e) =>
                  updateSetting(
                    "passwordExpiryDays",
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                slotProps={{ htmlInput: { min: 30, max: 365, step: 1 } }}
                helperText="Allowed range: 30–365 days."
              />
            </SettingsGrid>

            <Divider sx={{ my: 2 }} />

            <SettingSwitch
              title="Require Strong Passwords"
              description="Policy preference for enforcing strong passwords on the server."
              checked={settings.requireStrongPassword}
              onChange={(v) => updateSetting("requireStrongPassword", v)}
            />

            <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
              Session expiry, login attempt limits and password policies must be
              enforced by Spring Security and the backend. These browser
              settings do not secure an account on their own.
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Audit controls: Super Admin only */}
      {isSuperAdmin && (
        <Card sx={{ ...cardSx, mb: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <SectionHeading
              icon={<FactCheck />}
              title="Audit & Compliance"
              subtitle="Organization-level audit policy preferences."
            />

            <Divider sx={{ my: 2.5 }} />

            <SettingSwitch
              title="Audit Logging"
              description="Policy preference for recording important administrative actions, attendance corrections and settings changes."
              checked={settings.auditLogging}
              onChange={(v) => updateSetting("auditLogging", v)}
            />

            <Alert severity="info" sx={{ mt: 1, borderRadius: 2 }}>
              For a production audit trail, write audit records to a
              backend-managed database with the actor, action, affected record,
              timestamp and relevant before-and-after values. Do not rely on
              browser storage for audit evidence.
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Regional preferences: Super Admin only */}
      {isSuperAdmin && (
        <Card sx={{ ...cardSx, mb: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <SectionHeading
              icon={<Storage />}
              title="Regional & System Preferences"
              subtitle="Set default date, time and system maintenance preferences."
            />

            <Divider sx={{ my: 2.5 }} />

            <SettingsGrid>
              <SettingsField
                select
                label="Organization Timezone"
                value={settings.timezone}
                onChange={(e) => updateSetting("timezone", e.target.value)}
              >
                <MenuItem value="Asia/Kolkata">
                  India Standard Time (Asia/Kolkata)
                </MenuItem>
                <MenuItem value="UTC">UTC</MenuItem>
                <MenuItem value="Asia/Dubai">Gulf Standard Time</MenuItem>
                <MenuItem value="Europe/London">United Kingdom</MenuItem>
                <MenuItem value="America/New_York">US Eastern Time</MenuItem>
              </SettingsField>

              <SettingsField
                select
                label="Date Format"
                value={settings.dateFormat}
                onChange={(e) => updateSetting("dateFormat", e.target.value)}
              >
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
              </SettingsField>

              <SettingsField
                select
                label="Time Format"
                value={settings.timeFormat}
                onChange={(e) => updateSetting("timeFormat", e.target.value)}
              >
                <MenuItem value="24-hour">24-hour</MenuItem>
                <MenuItem value="12-hour">12-hour (AM/PM)</MenuItem>
              </SettingsField>
            </SettingsGrid>

            <Divider sx={{ my: 2 }} />

            <SettingSwitch
              title="Maintenance Mode"
              description="Intended system-wide maintenance control. Implement a backend-enforced maintenance gate before enabling this in production."
              checked={settings.maintenanceMode}
              onChange={(v) => updateSetting("maintenanceMode", v)}
            />

            {settings.maintenanceMode && (
              <Alert severity="warning" sx={{ mt: 1, borderRadius: 2 }}>
                Maintenance mode is selected but is not enforced by this
                settings page. Do not treat the application as being in
                maintenance mode until the backend implements that behavior.
              </Alert>
            )}

            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
              Timezone and display-format changes affect other pages only when
              those pages read and apply these preferences. Backup scheduling,
              backup restoration and system health monitoring should be
              implemented as separate backend-managed features.
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Save actions */}
      <Stack
        direction={{ xs: "column-reverse", sm: "row" }}
        justifyContent="flex-end"
        spacing={1.5}
        sx={{ pb: 2 }}
      >
        {isSuperAdmin && (
          <Button
            variant="outlined"
            startIcon={<RestartAlt />}
            onClick={handleReset}
            sx={{
              minHeight: 44,
              px: 2.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              borderColor: COLORS.border,
              color: COLORS.dark,
            }}
          >
            Reset Defaults
          </Button>
        )}

        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          sx={{
            minHeight: 44,
            px: 3,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            backgroundColor: COLORS.navy,
            "&:hover": { backgroundColor: COLORS.teal },
          }}
        >
          Save Settings
        </Button>
      </Stack>

      <Snackbar
        open={notification.open}
        autoHideDuration={4500}
        onClose={() =>
          setNotification((previous) => ({
            ...previous,
            open: false,
          }))
        }
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={notification.severity}
          variant="filled"
          onClose={() =>
            setNotification((previous) => ({
              ...previous,
              open: false,
            }))
          }
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
