
import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
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
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  Add,
  AdminPanelSettings,
  Block,
  CheckCircle,
  Delete,
  Edit,
  Email,
  Person,
  Search,
  Shield,
} from "@mui/icons-material";

const API_BASE_URL = "http://localhost:8080";

export default function AdminManagement() {
  const theme = useTheme();

  const isMobile = useMediaQuery(
    theme.breakpoints.down("md")
  );

  // ============================================================
  // STATE
  // ============================================================

  const [admins, setAdmins] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [statusUpdatingId, setStatusUpdatingId] =
    useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [roleFilter, setRoleFilter] = useState("ALL");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [dialogOpen, setDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [selectedAdmin, setSelectedAdmin] =
    useState(null);

  const [adminToDelete, setAdminToDelete] =
    useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "ADMIN",
    status: "ACTIVE",
  });

  // ============================================================
  // LOAD ADMINS
  // ============================================================

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/super-admin/admins`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || "Failed to load administrators"
        );
      }

      const data = await response.json();

      const formattedAdmins = data.map((admin) => ({
        id: admin.id,
        fullName: admin.fullName || "",
        email: admin.email || "",
        role: admin.role || "ADMIN",
        status: admin.active
          ? "ACTIVE"
          : "INACTIVE",
      }));

      setAdmins(formattedAdmins);
    } catch (error) {
      console.error(
        "Error loading administrators:",
        error
      );

      showSnackbar(
        error.message ||
          "Unable to load administrators",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SNACKBAR
  // ============================================================

  const showSnackbar = (
    message,
    severity = "success"
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const closeSnackbar = () => {
    setSnackbar((previous) => ({
      ...previous,
      open: false,
    }));
  };

  // ============================================================
  // FILTER
  // ============================================================

  const filteredAdmins = useMemo(() => {
    const search = searchTerm
      .toLowerCase()
      .trim();

    return admins.filter((admin) => {
      const matchesSearch =
        !search ||
        admin.fullName
          .toLowerCase()
          .includes(search) ||
        admin.email
          .toLowerCase()
          .includes(search) ||
        String(admin.id)
          .includes(search);

      const matchesRole =
        roleFilter === "ALL" ||
        admin.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        admin.status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    admins,
    searchTerm,
    roleFilter,
    statusFilter,
  ]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalAdmins = admins.length;

  const activeAdmins = admins.filter(
    (admin) =>
      admin.status === "ACTIVE"
  ).length;

  const inactiveAdmins = admins.filter(
    (admin) =>
      admin.status === "INACTIVE"
  ).length;

  // ============================================================
  // FORM
  // ============================================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddDialog = () => {
    setSelectedAdmin(null);

    setFormData({
      fullName: "",
      email: "",
      password: "",
      role: "ADMIN",
      status: "ACTIVE",
    });

    setDialogOpen(true);
  };

  const openEditDialog = (admin) => {
    setSelectedAdmin(admin);

    setFormData({
      fullName: admin.fullName,
      email: admin.email,
      password: "",
      role: admin.role,
      status: admin.status,
    });

    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) {
      return;
    }

    setDialogOpen(false);
    setSelectedAdmin(null);
  };

  // ============================================================
  // SAVE ADMIN
  // ============================================================

  const handleSaveAdmin = async () => {
    if (!formData.fullName.trim()) {
      showSnackbar(
        "Full name is required",
        "error"
      );
      return;
    }

    if (!formData.email.trim()) {
      showSnackbar(
        "Email is required",
        "error"
      );
      return;
    }

    if (
      !selectedAdmin &&
      !formData.password.trim()
    ) {
      showSnackbar(
        "Password is required",
        "error"
      );
      return;
    }

    try {
      setSaving(true);

      const isEditing =
        Boolean(selectedAdmin);

      const payload = {
        fullName:
          formData.fullName.trim(),

        email:
          formData.email.trim(),

        role: formData.role,

        active:
          formData.status === "ACTIVE",
      };

      /*
       * Password is only sent when:
       *
       * 1. Creating an admin
       * 2. Editing an admin and entering a
       *    new password
       */

      if (
        !isEditing ||
        formData.password.trim()
      ) {
        payload.password =
          formData.password.trim();
      }

      const url = isEditing
        ? `${API_BASE_URL}/api/super-admin/admins/${selectedAdmin.id}`
        : `${API_BASE_URL}/api/super-admin/admins`;

      const response = await fetch(url, {
        method: isEditing
          ? "PUT"
          : "POST",

        credentials: "include",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            "Failed to save administrator"
        );
      }

      const savedAdmin =
        await response.json();

      const formattedAdmin = {
        id: savedAdmin.id,
        fullName:
          savedAdmin.fullName,
        email:
          savedAdmin.email,
        role:
          savedAdmin.role,
        status:
          savedAdmin.active
            ? "ACTIVE"
            : "INACTIVE",
      };

      if (isEditing) {
        setAdmins((previous) =>
          previous.map((admin) =>
            admin.id ===
            selectedAdmin.id
              ? formattedAdmin
              : admin
          )
        );

        showSnackbar(
          "Administrator updated successfully"
        );
      } else {
        setAdmins((previous) => [
          ...previous,
          formattedAdmin,
        ]);

        showSnackbar(
          "Administrator created successfully"
        );
      }

      setDialogOpen(false);
      setSelectedAdmin(null);
    } catch (error) {
      console.error(
        "Error saving administrator:",
        error
      );

      showSnackbar(
        error.message ||
          "Unable to save administrator",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // ACTIVATE / DEACTIVATE
  // ============================================================

  const handleToggleStatus = async (
    admin
  ) => {
    try {
      setStatusUpdatingId(admin.id);

      const newActiveStatus =
        admin.status !== "ACTIVE";

      const response = await fetch(
        `${API_BASE_URL}/api/super-admin/admins/${admin.id}/status?active=${newActiveStatus}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            "Failed to update administrator status"
        );
      }

      const updatedAdmin =
        await response.json();

      setAdmins((previous) =>
        previous.map((item) =>
          item.id === admin.id
            ? {
                ...item,
                status:
                  updatedAdmin.active
                    ? "ACTIVE"
                    : "INACTIVE",
              }
            : item
        )
      );

      showSnackbar(
        updatedAdmin.active
          ? "Administrator activated successfully"
          : "Administrator deactivated successfully"
      );
    } catch (error) {
      console.error(
        "Error updating admin status:",
        error
      );

      showSnackbar(
        error.message ||
          "Unable to update administrator status",
        "error"
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const openDeleteDialog = (admin) => {
    setAdminToDelete(admin);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setAdminToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/api/super-admin/admins/${adminToDelete.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            "Failed to delete administrator"
        );
      }

      setAdmins((previous) =>
        previous.filter(
          (admin) =>
            admin.id !==
            adminToDelete.id
        )
      );

      showSnackbar(
        "Administrator deleted successfully"
      );

      closeDeleteDialog();
    } catch (error) {
      console.error(
        "Error deleting administrator:",
        error
      );

      showSnackbar(
        error.message ||
          "Unable to delete administrator",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // STAT CARD
  // ============================================================

  const StatCard = ({
    title,
    value,
    icon,
    subtitle,
    iconBg,
  }) => (
    <Paper
      elevation={0}
      sx={{
        p: {
          xs: 2,
          sm: 2.3,
        },
        border:
          "1px solid #E5E7EB",
        borderRadius: 3,
        height: "100%",
        bgcolor: "#FFFFFF",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={1}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 13,
              color: "#64748B",
              fontWeight: 600,
              mb: 0.8,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              fontSize: {
                xs: 24,
                sm: 28,
              },
              fontWeight: 800,
              color: "#0F172A",
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>

          <Typography
            sx={{
              fontSize: 11,
              color: "#94A3B8",
              mt: 1,
            }}
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
            bgcolor: iconBg,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );

  // ============================================================
  // ROLE CHIP
  // ============================================================

  const RoleChip = ({ role }) => {
    const isSuperAdmin =
      role === "SUPER_ADMIN";

    return (
      <Chip
        icon={
          isSuperAdmin ? (
            <Shield
              sx={{
                fontSize: 15,
              }}
            />
          ) : (
            <AdminPanelSettings
              sx={{
                fontSize: 15,
              }}
            />
          )
        }
        label={
          isSuperAdmin
            ? "Super Admin"
            : "Admin"
        }
        size="small"
        sx={{
          fontWeight: 700,
          fontSize: 11,
          bgcolor: isSuperAdmin
            ? "#EDE9FE"
            : "#DBEAFE",
          color: isSuperAdmin
            ? "#6D28D9"
            : "#1D4ED8",

          "& .MuiChip-icon": {
            color: "inherit",
          },
        }}
      />
    );
  };

  // ============================================================
  // STATUS CHIP
  // ============================================================

  const StatusChip = ({
    status,
  }) => {
    const active =
      status === "ACTIVE";

    return (
      <Chip
        icon={
          active ? (
            <CheckCircle
              sx={{
                fontSize: 15,
              }}
            />
          ) : (
            <Block
              sx={{
                fontSize: 15,
              }}
            />
          )
        }
        label={
          active
            ? "Active"
            : "Inactive"
        }
        size="small"
        sx={{
          fontWeight: 700,
          fontSize: 11,
          bgcolor: active
            ? "#DCFCE7"
            : "#FEE2E2",
          color: active
            ? "#15803D"
            : "#B91C1C",

          "& .MuiChip-icon": {
            color: "inherit",
          },
        }}
      />
    );
  };

  // ============================================================
  // MOBILE DETAIL
  // ============================================================

  const MobileDetail = ({
    icon,
    label,
    value,
  }) => (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      gap={2}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          color: "#64748B",
          minWidth: 0,
        }}
      >
        {icon}

        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {label}
        </Typography>
      </Stack>

      <Box
        sx={{
          textAlign: "right",
          minWidth: 0,
        }}
      >
        {value}
      </Box>
    </Stack>
  );

  // ============================================================
  // MOBILE ADMIN CARD
  // ============================================================

  const AdminMobileCard = ({
    admin,
  }) => {
    const updating =
      statusUpdatingId === admin.id;

    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          border:
            "1px solid #E5E7EB",
          borderRadius: 3,
          bgcolor: "#FFFFFF",
        }}
      >
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            gap={1}
          >
            <Stack
              direction="row"
              spacing={1.2}
              alignItems="center"
              minWidth={0}
            >
              <Avatar
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor:
                    admin.role ===
                    "SUPER_ADMIN"
                      ? "#6D28D9"
                      : "#2563EB",
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                {admin.fullName
                  .split(" ")
                  .map(
                    (name) =>
                      name[0]
                  )
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </Avatar>

              <Box minWidth={0}>
                <Typography
                  noWrap
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#0F172A",
                  }}
                >
                  {admin.fullName}
                </Typography>

                <Typography
                  noWrap
                  sx={{
                    fontSize: 11,
                    color: "#64748B",
                  }}
                >
                  {admin.email}
                </Typography>
              </Box>
            </Stack>

            <StatusChip
              status={admin.status}
            />
          </Stack>

          <Divider />

          <MobileDetail
            icon={
              <Email
                sx={{
                  fontSize: 17,
                }}
              />
            }
            label="Email"
            value={
              <Typography
                sx={{
                  fontSize: 12,
                  color: "#334155",
                  maxWidth: 190,
                  wordBreak:
                    "break-word",
                }}
              >
                {admin.email}
              </Typography>
            }
          />

          <MobileDetail
            icon={
              <Shield
                sx={{
                  fontSize: 17,
                }}
              />
            }
            label="Role"
            value={
              <RoleChip
                role={admin.role}
              />
            }
          />

          <MobileDetail
            icon={
              <Person
                sx={{
                  fontSize: 17,
                }}
              />
            }
            label="Admin ID"
            value={
              <Typography
                sx={{
                  fontSize: 12,
                  color: "#475569",
                }}
              >
                #{admin.id}
              </Typography>
            }
          />

          <Divider />

          <Stack
            direction="row"
            spacing={1}
          >
            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={
                <Edit />
              }
              onClick={() =>
                openEditDialog(admin)
              }
              disabled={updating}
              sx={{
                textTransform:
                  "none",
                borderRadius: 2,
              }}
            >
              Edit
            </Button>

            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={
                updating ? (
                  <CircularProgress
                    size={15}
                  />
                ) : admin.status ===
                  "ACTIVE" ? (
                  <Block />
                ) : (
                  <CheckCircle />
                )
              }
              onClick={() =>
                handleToggleStatus(
                  admin
                )
              }
              disabled={updating}
              color={
                admin.status ===
                "ACTIVE"
                  ? "warning"
                  : "success"
              }
              sx={{
                textTransform:
                  "none",
                borderRadius: 2,
              }}
            >
              {admin.status ===
              "ACTIVE"
                ? "Disable"
                : "Enable"}
            </Button>

            <IconButton
              color="error"
              onClick={() =>
                openDeleteDialog(
                  admin
                )
              }
              disabled={updating}
              sx={{
                border:
                  "1px solid",
                borderColor:
                  "error.light",
                borderRadius: 2,
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>
    );
  };

  // ============================================================
  // EMPTY STATE
  // ============================================================

  const EmptyState = () => (
    <Box
      sx={{
        py: 8,
        textAlign: "center",
      }}
    >
      <AdminPanelSettings
        sx={{
          fontSize: 48,
          color: "#CBD5E1",
          mb: 1,
        }}
      />

      <Typography
        sx={{
          fontWeight: 700,
          color: "#475569",
        }}
      >
        No administrators found
      </Typography>

      <Typography
        sx={{
          fontSize: 13,
          color: "#94A3B8",
          mt: 0.5,
        }}
      >
        Try changing your search
        or filter.
      </Typography>
    </Box>
  );

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1700,
        mx: "auto",
      }}
    >
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        alignItems={{
          xs: "stretch",
          sm: "center",
        }}
        justifyContent="space-between"
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: {
                xs: 22,
                sm: 25,
                md: 28,
              },
              fontWeight: 800,
              color: "#0F172A",
            }}
          >
            Administrators
          </Typography>

          <Typography
            sx={{
              fontSize: 13,
              color: "#64748B",
              mt: 0.5,
            }}
          >
            Create, update and manage
            StaffSync admin accounts.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openAddDialog}
          sx={{
            minHeight: 44,
            px: 2.2,
            borderRadius: 2,
            bgcolor: "#0D9488",
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "none",

            "&:hover": {
              bgcolor: "#0F766E",
              boxShadow: "none",
            },
          }}
        >
          Add Administrator
        </Button>
      </Stack>

      {/* ======================================================
          MOBILE SEARCH
      ====================================================== */}

      {isMobile && (
        <TextField
          fullWidth
          size="small"
          placeholder="Search admins..."
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(
              event.target.value
            )
          }
          sx={{
            mb: 2,

            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "#FFFFFF",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search
                  sx={{
                    fontSize: 19,
                    color: "#94A3B8",
                  }}
                />
              </InputAdornment>
            ),
          }}
        />
      )}

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          title="Total Administrators"
          value={totalAdmins}
          subtitle="All admin accounts"
          icon={
            <AdminPanelSettings
              sx={{
                color: "#2563EB",
              }}
            />
          }
          iconBg="#DBEAFE"
        />

        <StatCard
          title="Active Administrators"
          value={activeAdmins}
          subtitle="Currently active"
          icon={
            <CheckCircle
              sx={{
                color: "#16A34A",
              }}
            />
          }
          iconBg="#DCFCE7"
        />

        <StatCard
          title="Inactive Administrators"
          value={inactiveAdmins}
          subtitle="Disabled accounts"
          icon={
            <Block
              sx={{
                color: "#DC2626",
              }}
            />
          }
          iconBg="#FEE2E2"
        />
      </Box>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: {
            xs: 1.5,
            sm: 2,
          },
          mb: 2,
          border:
            "1px solid #E5E7EB",
          borderRadius: 3,
          bgcolor: "#FFFFFF",
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1.5}
          alignItems={{
            xs: "stretch",
            sm: "center",
          }}
        >
          <Box
            sx={{
              flex: 1,
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, email or ID"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search
                      sx={{
                        fontSize: 19,
                        color: "#94A3B8",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root":
                  {
                    borderRadius: 2,
                  },
              }}
            />
          </Box>

          <Select
            size="small"
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(
                event.target.value
              )
            }
            sx={{
              minWidth: {
                xs: "100%",
                sm: 160,
              },
              borderRadius: 2,
            }}
          >
            <MenuItem value="ALL">
              All Roles
            </MenuItem>

            <MenuItem value="SUPER_ADMIN">
              Super Admin
            </MenuItem>

            <MenuItem value="ADMIN">
              Admin
            </MenuItem>
          </Select>

          <Select
            size="small"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            sx={{
              minWidth: {
                xs: "100%",
                sm: 150,
              },
              borderRadius: 2,
            }}
          >
            <MenuItem value="ALL">
              All Status
            </MenuItem>

            <MenuItem value="ACTIVE">
              Active
            </MenuItem>

            <MenuItem value="INACTIVE">
              Inactive
            </MenuItem>
          </Select>
        </Stack>
      </Paper>

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading ? (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            border:
              "1px solid #E5E7EB",
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <CircularProgress
            size={34}
            sx={{
              color: "#0D9488",
            }}
          />

          <Typography
            sx={{
              mt: 2,
              fontSize: 13,
              color: "#64748B",
            }}
          >
            Loading administrators...
          </Typography>
        </Paper>
      ) : !isMobile ? (
        /* ======================================================
           DESKTOP TABLE
        ====================================================== */

        <Paper
          elevation={0}
          sx={{
            border:
              "1px solid #E5E7EB",
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "#FFFFFF",
          }}
        >
          <TableContainer
            sx={{
              overflowX: "auto",
            }}
          >
            <Table
              sx={{
                minWidth: 850,
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: "#F8FAFC",
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: "#475569",
                    }}
                  >
                    Administrator
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: "#475569",
                    }}
                  >
                    Contact
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: "#475569",
                    }}
                  >
                    Role
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: "#475569",
                    }}
                  >
                    Status
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: "#475569",
                    }}
                  >
                    ID
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 800,
                      color: "#475569",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredAdmins.length ===
                0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                    >
                      <EmptyState />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmins.map(
                    (admin) => {
                      const updating =
                        statusUpdatingId ===
                        admin.id;

                      return (
                        <TableRow
                          key={admin.id}
                          hover
                          sx={{
                            "&:last-child td":
                              {
                                borderBottom: 0,
                              },
                          }}
                        >
                          {/* ADMIN */}

                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1.2}
                              alignItems="center"
                            >
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor:
                                    admin.role ===
                                    "SUPER_ADMIN"
                                      ? "#6D28D9"
                                      : "#2563EB",
                                  fontSize: 13,
                                  fontWeight: 800,
                                }}
                              >
                                {admin.fullName
                                  .split(
                                    " "
                                  )
                                  .map(
                                    (name) =>
                                      name[0]
                                  )
                                  .join("")
                                  .slice(
                                    0,
                                    2
                                  )
                                  .toUpperCase()}
                              </Avatar>

                              <Box>
                                <Typography
                                  sx={{
                                    fontSize: 13,
                                    fontWeight: 800,
                                    color:
                                      "#0F172A",
                                  }}
                                >
                                  {
                                    admin.fullName
                                  }
                                </Typography>

                                <Typography
                                  sx={{
                                    fontSize: 11,
                                    color:
                                      "#64748B",
                                    mt: 0.2,
                                  }}
                                >
                                  ID #
                                  {
                                    admin.id
                                  }
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>

                          {/* CONTACT */}

                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={0.8}
                              alignItems="center"
                            >
                              <Email
                                sx={{
                                  fontSize: 16,
                                  color:
                                    "#64748B",
                                }}
                              />

                              <Typography
                                sx={{
                                  fontSize: 12,
                                  color:
                                    "#334155",
                                  wordBreak:
                                    "break-word",
                                }}
                              >
                                {
                                  admin.email
                                }
                              </Typography>
                            </Stack>
                          </TableCell>

                          {/* ROLE */}

                          <TableCell>
                            <RoleChip
                              role={
                                admin.role
                              }
                            />
                          </TableCell>

                          {/* STATUS */}

                          <TableCell>
                            <StatusChip
                              status={
                                admin.status
                              }
                            />
                          </TableCell>

                          {/* ID */}

                          <TableCell>
                            <Typography
                              sx={{
                                fontSize: 12,
                                color:
                                  "#475569",
                              }}
                            >
                              #
                              {
                                admin.id
                              }
                            </Typography>
                          </TableCell>

                          {/* ACTIONS */}

                          <TableCell align="right">
                            <Stack
                              direction="row"
                              spacing={0.5}
                              justifyContent="flex-end"
                            >
                              <Tooltip title="Edit">
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={
                                      updating
                                    }
                                    onClick={() =>
                                      openEditDialog(
                                        admin
                                      )
                                    }
                                    sx={{
                                      color:
                                        "#2563EB",
                                    }}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Tooltip
                                title={
                                  admin.status ===
                                  "ACTIVE"
                                    ? "Deactivate"
                                    : "Activate"
                                }
                              >
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={
                                      updating
                                    }
                                    onClick={() =>
                                      handleToggleStatus(
                                        admin
                                      )
                                    }
                                    sx={{
                                      color:
                                        admin.status ===
                                        "ACTIVE"
                                          ? "#D97706"
                                          : "#16A34A",
                                    }}
                                  >
                                    {updating ? (
                                      <CircularProgress
                                        size={18}
                                      />
                                    ) : admin.status ===
                                      "ACTIVE" ? (
                                      <Block fontSize="small" />
                                    ) : (
                                      <CheckCircle fontSize="small" />
                                    )}
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Tooltip title="Delete">
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={
                                      updating
                                    }
                                    onClick={() =>
                                      openDeleteDialog(
                                        admin
                                      )
                                    }
                                    sx={{
                                      color:
                                        "#DC2626",
                                    }}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </span>
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
        </Paper>
      ) : (
        /* ======================================================
           MOBILE CARDS
        ====================================================== */

        <Stack spacing={1.5}>
          {filteredAdmins.length ===
          0 ? (
            <Paper
              elevation={0}
              sx={{
                border:
                  "1px solid #E5E7EB",
                borderRadius: 3,
              }}
            >
              <EmptyState />
            </Paper>
          ) : (
            filteredAdmins.map(
              (admin) => (
                <AdminMobileCard
                  key={admin.id}
                  admin={admin}
                />
              )
            )
          )}
        </Stack>
      )}

      {/* ======================================================
          FOOTER
      ====================================================== */}

      {!loading && (
        <Typography
          sx={{
            mt: 2,
            fontSize: 11,
            color: "#94A3B8",
            textAlign: {
              xs: "center",
              sm: "right",
            },
          }}
        >
          Showing{" "}
          {filteredAdmins.length}{" "}
          of {admins.length}{" "}
          administrators
        </Typography>
      )}

      {/* ======================================================
          ADD / EDIT DIALOG
      ====================================================== */}

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#0F2747",
          }}
        >
          {selectedAdmin
            ? "Edit Administrator"
            : "Add Administrator"}
        </DialogTitle>

        <DialogContent dividers>
          <Stack
            spacing={2}
            sx={{
              pt: 0.5,
            }}
          >
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={
                formData.fullName
              }
              onChange={
                handleInputChange
              }
              required
            />

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={
                formData.email
              }
              onChange={
                handleInputChange
              }
              required
            />

            <TextField
              fullWidth
              label={
                selectedAdmin
                  ? "New Password (optional)"
                  : "Password"
              }
              name="password"
              type="password"
              value={
                formData.password
              }
              onChange={
                handleInputChange
              }
              required={
                !selectedAdmin
              }
              helperText={
                selectedAdmin
                  ? "Leave blank to keep the current password."
                  : "Password is required."
              }
            />

            <TextField
              select
              fullWidth
              label="Role"
              name="role"
              value={
                formData.role
              }
              onChange={
                handleInputChange
              }
            >
              <MenuItem value="ADMIN">
                Admin
              </MenuItem>

              <MenuItem value="SUPER_ADMIN">
                Super Admin
              </MenuItem>
            </TextField>

            <TextField
              select
              fullWidth
              label="Status"
              name="status"
              value={
                formData.status
              }
              onChange={
                handleInputChange
              }
            >
              <MenuItem value="ACTIVE">
                Active
              </MenuItem>

              <MenuItem value="INACTIVE">
                Inactive
              </MenuItem>
            </TextField>

            <Alert
              severity="info"
              sx={{
                borderRadius: 2,
                fontSize: 12,
              }}
            >
              Administrator changes
              are saved directly to
              the StaffSync database.
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
          }}
        >
          <Button
            onClick={closeDialog}
            disabled={saving}
            sx={{
              textTransform:
                "none",
              color: "#64748B",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleSaveAdmin
            }
            disabled={
              saving ||
              !formData.fullName.trim() ||
              !formData.email.trim() ||
              (!selectedAdmin &&
                !formData.password.trim())
            }
            startIcon={
              saving ? (
                <CircularProgress
                  size={17}
                  color="inherit"
                />
              ) : null
            }
            sx={{
              textTransform:
                "none",
              borderRadius: 2,
              bgcolor: "#0D9488",
              boxShadow: "none",

              "&:hover": {
                bgcolor: "#0F766E",
                boxShadow: "none",
              },
            }}
          >
            {saving
              ? "Saving..."
              : selectedAdmin
              ? "Update Admin"
              : "Create Admin"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================
          DELETE DIALOG
      ====================================================== */}

      <Dialog
        open={deleteDialogOpen}
        onClose={
          saving
            ? undefined
            : closeDeleteDialog
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
          }}
        >
          Delete Administrator?
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              fontSize: 14,
              color: "#475569",
            }}
          >
            Are you sure you want to
            delete{" "}
            <strong>
              {
                adminToDelete?.fullName
              }
            </strong>
            ? This action cannot be
            undone.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
          }}
        >
          <Button
            onClick={
              closeDeleteDialog
            }
            disabled={saving}
            sx={{
              textTransform:
                "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            startIcon={
              saving ? (
                <CircularProgress
                  size={17}
                  color="inherit"
                />
              ) : (
                <Delete />
              )
            }
            onClick={
              handleDeleteAdmin
            }
            disabled={saving}
            sx={{
              textTransform:
                "none",
              borderRadius: 2,
              boxShadow: "none",
            }}
          >
            {saving
              ? "Deleting..."
              : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================
          SNACKBAR
      ====================================================== */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={
          closeSnackbar
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          onClose={
            closeSnackbar
          }
          severity={
            snackbar.severity
          }
          variant="filled"
          sx={{
            width: "100%",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
