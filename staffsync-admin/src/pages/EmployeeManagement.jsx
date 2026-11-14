import { useEffect, useMemo, useState } from "react";

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
  IconButton,
  InputAdornment,
  MenuItem,
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
  Badge,
  CalendarMonth,
  Close,
  Delete,
  Edit,
  Email,
  Group,
  Person,
  Phone,
  Refresh,
  Search,
  Work,
} from "@mui/icons-material";

const API_BASE_URL = "http://localhost:8080";

const initialForm = {
  fullName: "",
  currentAddress: "",
  permanentAddress: "",
  phone: "",
  email: "",
  password: "",
  aadhaarOrPan: "",
  birthDate: "",
  maritalStatus: "",
  spouseName: "",
  spouseEmployer: "",
  spouseWorkPhone: "",
};

export default function EmployeeManagement() {
  const theme = useTheme();

  const isMobile = useMediaQuery(
    theme.breakpoints.down("md")
  );

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState(null);

  const [form, setForm] = useState({
    ...initialForm,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [employeeToDelete, setEmployeeToDelete] =
    useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /* ======================================================
     SNACKBAR
  ====================================================== */

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

  /* ======================================================
     LOAD EMPLOYEES

     GET /api/super-admin/employees
  ====================================================== */

  const loadEmployees = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/super-admin/employees`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText ||
            "Unable to fetch employees."
        );
      }

      const data = await response.json();

      setEmployees(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Employee loading error:",
        error
      );

      showSnackbar(
        error.message ||
          "Unable to load employees from server.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  /* ======================================================
     SEARCH
  ====================================================== */

  const filteredEmployees = useMemo(() => {
    const value = searchTerm
      .trim()
      .toLowerCase();

    if (!value) {
      return employees;
    }

    return employees.filter((employee) => {
      return (
        employee.fullName
          ?.toLowerCase()
          .includes(value) ||
        employee.email
          ?.toLowerCase()
          .includes(value) ||
        employee.phone
          ?.toLowerCase()
          .includes(value) ||
        String(employee.id || "").includes(value) ||
        employee.aadhaarOrPan
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [employees, searchTerm]);

  /* ======================================================
     FORM
  ====================================================== */

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ======================================================
     ADD EMPLOYEE
  ====================================================== */

  const handleAddEmployee = () => {
    setEditingEmployee(null);

    setForm({
      ...initialForm,
    });

    setOpenDialog(true);
  };

  /* ======================================================
     EDIT EMPLOYEE
  ====================================================== */

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);

    setForm({
      fullName: employee.fullName || "",
      currentAddress:
        employee.currentAddress || "",
      permanentAddress:
        employee.permanentAddress || "",
      phone: employee.phone || "",
      email: employee.email || "",
      password: "",
      aadhaarOrPan:
        employee.aadhaarOrPan || "",
      birthDate:
        employee.birthDate || "",
      maritalStatus:
        employee.maritalStatus || "",
      spouseName:
        employee.spouseName || "",
      spouseEmployer:
        employee.spouseEmployer || "",
      spouseWorkPhone:
        employee.spouseWorkPhone || "",
    });

    setOpenDialog(true);
  };

  /* ======================================================
     CLOSE FORM
  ====================================================== */

  const handleCloseDialog = () => {
    if (saving) return;

    setOpenDialog(false);
    setEditingEmployee(null);

    setForm({
      ...initialForm,
    });
  };

  /* ======================================================
     SAVE EMPLOYEE

     CREATE:
     POST /api/super-admin/employees/create

     UPDATE:
     PUT /api/super-admin/employees/{id}
  ====================================================== */

  const handleSaveEmployee = async () => {
    if (!form.fullName.trim()) {
      showSnackbar(
        "Employee name is required.",
        "error"
      );
      return;
    }

    if (!form.email.trim()) {
      showSnackbar(
        "Email is required.",
        "error"
      );
      return;
    }

    if (!form.phone.trim()) {
      showSnackbar(
        "Phone number is required.",
        "error"
      );
      return;
    }

    if (
      !editingEmployee &&
      !form.password.trim()
    ) {
      showSnackbar(
        "Password is required for a new employee.",
        "error"
      );
      return;
    }

    try {
      setSaving(true);

      const isEdit =
        Boolean(editingEmployee);

      const url = isEdit
        ? `${API_BASE_URL}/api/super-admin/employees/${editingEmployee.id}`
        : `${API_BASE_URL}/api/super-admin/employees/create`;

      const method = isEdit
        ? "PUT"
        : "POST";

      const employeePayload = {
        fullName:
          form.fullName.trim(),

        currentAddress:
          form.currentAddress.trim(),

        permanentAddress:
          form.permanentAddress.trim(),

        phone:
          form.phone.trim(),

        email:
          form.email.trim(),

        aadhaarOrPan:
          form.aadhaarOrPan.trim(),

        birthDate:
          form.birthDate || null,

        maritalStatus:
          form.maritalStatus,

        spouseName:
          form.spouseName.trim(),

        spouseEmployer:
          form.spouseEmployer.trim(),

        spouseWorkPhone:
          form.spouseWorkPhone.trim(),
      };

      /*
       * CREATE:
       * password is required.
       *
       * EDIT:
       * password is only sent when
       * a new password is entered.
       */

      if (form.password.trim()) {
        employeePayload.password =
          form.password.trim();
      }

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          employeePayload
        ),
      });

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Unable to save employee."
        );
      }

      showSnackbar(
        isEdit
          ? "Employee updated successfully."
          : "Employee added successfully."
      );

      handleCloseDialog();

      await loadEmployees();
    } catch (error) {
      console.error(
        "Employee save error:",
        error
      );

      showSnackbar(
        error.message ||
          "Unable to save employee.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ======================================================
     DELETE EMPLOYEE

     DELETE /api/super-admin/employees/{id}
  ====================================================== */

  const openDeleteDialog = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (saving) return;

    setDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete?.id) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/api/super-admin/employees/${employeeToDelete.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Unable to delete employee."
        );
      }

      showSnackbar(
        "Employee deleted successfully."
      );

      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);

      await loadEmployees();
    } catch (error) {
      console.error(
        "Employee delete error:",
        error
      );

      showSnackbar(
        error.message ||
          "Unable to delete employee.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ======================================================
     SUMMARY
  ====================================================== */

  const employeesWithEmail =
    employees.filter(
      (employee) =>
        employee.email?.trim()
    ).length;

  const employeesWithPhone =
    employees.filter(
      (employee) =>
        employee.phone?.trim()
    ).length;

  const employeesWithId =
    employees.filter(
      (employee) =>
        employee.id !== null &&
        employee.id !== undefined
    ).length;

  /* ======================================================
     MAIN EMPLOYEE MANAGEMENT UI
  ====================================================== */

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* PAGE HEADER */}

      <Box
        sx={{
          display: "flex",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
          justifyContent:
            "space-between",
          flexDirection: {
            xs: "column",
            md: "row",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: {
                xs: 25,
                sm: 29,
                md: 32,
              },
              fontWeight: 800,
              color: "#1F2937",
            }}
          >
            Employee Management
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              color: "#64748B",
              fontSize: 14,
            }}
          >
            Manage all StaffSync
            employees from the
            Super Admin panel.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            width: {
              xs: "100%",
              md: "auto",
            },
          }}
        >
          <Tooltip title="Refresh">
            <IconButton
              onClick={
                loadEmployees
              }
              disabled={loading}
              sx={{
                backgroundColor:
                  "#fff",
                border:
                  "1px solid #D1D5DB",
                borderRadius: 2,

                "&:hover": {
                  backgroundColor:
                    "#F8FAFC",
                },
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            onClick={
              handleAddEmployee
            }
            startIcon={
              <Group />
            }
            sx={{
              flex: {
                xs: 1,
                md: "unset",
              },
              textTransform:
                "none",
              fontWeight: 700,
              borderRadius: 2,
              backgroundColor:
                "#0D9488",
              px: 2.5,
              py: 1.15,

              "&:hover": {
                backgroundColor:
                  "#0F766E",
              },
            }}
          >
            Add Employee
          </Button>
        </Stack>
      </Box>

      {/* SUMMARY CARDS */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <SummaryCard
          icon={<Group />}
          title="Total Employees"
          value={employees.length}
          iconBackground="#E0F2FE"
          iconColor="#0369A1"
        />

        <SummaryCard
          icon={<Email />}
          title="With Email"
          value={employeesWithEmail}
          iconBackground="#DCFCE7"
          iconColor="#15803D"
        />

        <SummaryCard
          icon={<Phone />}
          title="With Phone"
          value={employeesWithPhone}
          iconBackground="#EDE9FE"
          iconColor="#7C3AED"
        />

        <SummaryCard
          icon={<Badge />}
          title="Employee IDs"
          value={employeesWithId}
          iconBackground="#FEF3C7"
          iconColor="#B45309"
        />
      </Box>

      {/* SEARCH */}

      <Card
        elevation={0}
        sx={{
          border:
            "1px solid #E5E7EB",
          borderRadius: 3,
          mb: 2,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 1.5,
              sm: 2,
            },
          }}
        >
          <TextField
            fullWidth
            size="small"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="Search employee by name, email, phone, ID or Aadhaar/PAN..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search
                    sx={{
                      color:
                        "#64748B",
                    }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root":
                {
                  borderRadius: 2,
                  backgroundColor:
                    "#FAFAFA",
                },
            }}
          />
        </CardContent>
      </Card>

      {/* EMPLOYEE TABLE */}

      <Card
        elevation={0}
        sx={{
          border:
            "1px solid #E5E7EB",
          borderRadius: 3,
          overflow: "hidden",
          width: "100%",
        }}
      >
        <Box
          sx={{
            px: {
              xs: 1.5,
              sm: 2.5,
            },
            py: 2,
          }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              color: "#1F2937",
            }}
          >
            Employee List
          </Typography>

          <Typography
            sx={{
              fontSize: 12,
              color: "#64748B",
              mt: 0.3,
            }}
          >
            {filteredEmployees.length}{" "}
            employee
            {filteredEmployees.length !==
            1
              ? "s"
              : ""}{" "}
            found
          </Typography>
        </Box>

        <Divider />

        {loading ? (
          <LoadingState />
        ) : filteredEmployees.length ===
          0 ? (
          <EmptyState
            searchTerm={
              searchTerm
            }
            onAdd={
              handleAddEmployee
            }
          />
        ) : isMobile ? (
          <MobileEmployeeList
            employees={
              filteredEmployees
            }
            onEdit={
              handleEditEmployee
            }
            onDelete={
              openDeleteDialog
            }
          />
        ) : (
          <DesktopEmployeeTable
            employees={
              filteredEmployees
            }
            onEdit={
              handleEditEmployee
            }
            onDelete={
              openDeleteDialog
            }
          />
        )}
      </Card>

      {/* ==================================================
          ADD / EDIT DIALOG
      ================================================== */}

      <Dialog
        open={openDialog}
        onClose={
          handleCloseDialog
        }
        fullWidth
        maxWidth="md"
        fullScreen={isMobile}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            fontWeight: 800,
          }}
        >
          {editingEmployee
            ? "Edit Employee"
            : "Add Employee"}

          <IconButton
            onClick={
              handleCloseDialog
            }
            disabled={saving}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent
          sx={{
            backgroundColor:
              "#FAFAFA",
            py: 3,
          }}
        >
          {/* PROFILE INITIAL */}

          <Box
            sx={{
              display: "flex",
              flexDirection:
                "column",
              alignItems:
                "center",
              mb: 3,
            }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                backgroundColor:
                  "#0F2747",
                fontSize: 36,
                fontWeight: 800,
                mb: 1.5,
              }}
            >
              {getInitial(
                form.fullName
              )}
            </Avatar>

            <Typography
              sx={{
                fontSize: 12,
                color: "#64748B",
                textAlign: "center",
              }}
            >
              Employee profile image is
              not managed by the current
              Super Admin controller.
            </Typography>
          </Box>

          {/* BASIC INFORMATION */}

          <SectionTitle>
            Basic Information
          </SectionTitle>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
              },
              gap: 2,
            }}
          >
            <TextField
              label="Full Name"
              name="fullName"
              value={
                form.fullName
              }
              onChange={
                handleInputChange
              }
              required
              fullWidth
            />

            <TextField
              label="Phone Number"
              name="phone"
              value={
                form.phone
              }
              onChange={
                handleInputChange
              }
              required
              fullWidth
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={
                form.email
              }
              onChange={
                handleInputChange
              }
              required
              fullWidth
            />

            <TextField
              label={
                editingEmployee
                  ? "Password (leave blank to keep current)"
                  : "Password"
              }
              name="password"
              type="password"
              value={
                form.password
              }
              onChange={
                handleInputChange
              }
              required={
                !editingEmployee
              }
              fullWidth
            />

            <TextField
              label="Aadhaar / PAN"
              name="aadhaarOrPan"
              value={
                form.aadhaarOrPan
              }
              onChange={
                handleInputChange
              }
              fullWidth
            />

            <TextField
              label="Birth Date"
              name="birthDate"
              type="date"
              value={
                form.birthDate
              }
              onChange={
                handleInputChange
              }
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />

            <TextField
              select
              label="Marital Status"
              name="maritalStatus"
              value={
                form.maritalStatus
              }
              onChange={
                handleInputChange
              }
              fullWidth
            >
              <MenuItem value="">
                Not specified
              </MenuItem>

              <MenuItem value="Single">
                Single
              </MenuItem>

              <MenuItem value="Married">
                Married
              </MenuItem>

              <MenuItem value="Divorced">
                Divorced
              </MenuItem>

              <MenuItem value="Widowed">
                Widowed
              </MenuItem>
            </TextField>
          </Box>

          {/* ADDRESS */}

          <SectionTitle>
            Address Information
          </SectionTitle>

          <Stack spacing={2}>
            <TextField
              label="Current Address"
              name="currentAddress"
              value={
                form.currentAddress
              }
              onChange={
                handleInputChange
              }
              multiline
              minRows={2}
              fullWidth
            />

            <TextField
              label="Permanent Address"
              name="permanentAddress"
              value={
                form.permanentAddress
              }
              onChange={
                handleInputChange
              }
              multiline
              minRows={2}
              fullWidth
            />
          </Stack>

          {/* SPOUSE */}

          <SectionTitle>
            Spouse Information
          </SectionTitle>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
              },
              gap: 2,
            }}
          >
            <TextField
              label="Spouse Name"
              name="spouseName"
              value={
                form.spouseName
              }
              onChange={
                handleInputChange
              }
              fullWidth
            />

            <TextField
              label="Spouse Employer"
              name="spouseEmployer"
              value={
                form.spouseEmployer
              }
              onChange={
                handleInputChange
              }
              fullWidth
            />

            <TextField
              label="Spouse Work Phone"
              name="spouseWorkPhone"
              value={
                form.spouseWorkPhone
              }
              onChange={
                handleInputChange
              }
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
          }}
        >
          <Button
            onClick={
              handleCloseDialog
            }
            disabled={saving}
            sx={{
              textTransform:
                "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleSaveEmployee
            }
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <Work />
              )
            }
            sx={{
              textTransform:
                "none",
              fontWeight: 700,
              borderRadius: 2,
              backgroundColor:
                "#0D9488",
              px: 2.5,

              "&:hover": {
                backgroundColor:
                  "#0F766E",
              },
            }}
          >
            {saving
              ? "Saving..."
              : editingEmployee
              ? "Update Employee"
              : "Save Employee"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================================================
          DELETE DIALOG
      ================================================== */}

      <Dialog
        open={deleteDialogOpen}
        onClose={
          closeDeleteDialog
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
          }}
        >
          Delete Employee?
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
                employeeToDelete?.fullName
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
            onClick={
              handleDeleteEmployee
            }
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <Delete />
              )
            }
            sx={{
              textTransform:
                "none",
              fontWeight: 700,
              borderRadius: 2,
            }}
          >
            {saving
              ? "Deleting..."
              : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}

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
          severity={
            snackbar.severity
          }
          variant="filled"
          onClose={
            closeSnackbar
          }
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

/* ==========================================================
   SUMMARY CARD
========================================================== */

function SummaryCard({
  icon,
  title,
  value,
  iconBackground,
  iconColor,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        border:
          "1px solid #E5E7EB",
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardContent
        sx={{
          p: 2,
          "&:last-child": {
            pb: 2,
          },
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              backgroundColor:
                iconBackground,
              color: iconColor,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 12,
                color: "#64748B",
                fontWeight: 600,
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                fontSize: 25,
                lineHeight: 1.2,
                fontWeight: 800,
                color: "#1F2937",
              }}
            >
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* ==========================================================
   DESKTOP TABLE
========================================================== */

function DesktopEmployeeTable({
  employees,
  onEdit,
  onDelete,
}) {
  return (
    <TableContainer
      sx={{
        width: "100%",
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
              backgroundColor:
                "#F8FAFC",
            }}
          >
            <TableCell
              sx={{
                fontWeight: 800,
              }}
            >
              Employee
            </TableCell>

            <TableCell
              sx={{
                fontWeight: 800,
              }}
            >
              Contact
            </TableCell>

            <TableCell
              sx={{
                fontWeight: 800,
              }}
            >
              Employee ID
            </TableCell>

            <TableCell
              sx={{
                fontWeight: 800,
              }}
            >
              Marital Status
            </TableCell>

            <TableCell
              align="right"
              sx={{
                fontWeight: 800,
              }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {employees.map(
            (employee) => (
              <TableRow
                key={employee.id}
                hover
              >
                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                  >
                    <EmployeeAvatar
                      employee={
                        employee
                      }
                    />

                    <Box
                      sx={{
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 700,
                        }}
                        noWrap
                      >
                        {employee.fullName ||
                          "Unnamed Employee"}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 12,
                          color:
                            "#64748B",
                        }}
                        noWrap
                      >
                        {employee.email ||
                          "No email"}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack spacing={0.5}>
                    <Stack
                      direction="row"
                      spacing={0.7}
                      alignItems="center"
                    >
                      <Phone
                        sx={{
                          fontSize: 15,
                          color:
                            "#64748B",
                        }}
                      />

                      <Typography
                        sx={{
                          fontSize: 13,
                        }}
                      >
                        {employee.phone ||
                          "—"}
                      </Typography>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={0.7}
                      alignItems="center"
                    >
                      <Email
                        sx={{
                          fontSize: 15,
                          color:
                            "#64748B",
                        }}
                      />

                      <Typography
                        sx={{
                          fontSize: 13,
                          maxWidth: 230,
                          overflow:
                            "hidden",
                          textOverflow:
                            "ellipsis",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {employee.email ||
                          "—"}
                      </Typography>
                    </Stack>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Chip
                    label={`EMP-${employee.id}`}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      backgroundColor:
                        "#EFF6FF",
                      color:
                        "#2563EB",
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={
                      employee.maritalStatus ||
                      "Not specified"
                    }
                    size="small"
                    variant="outlined"
                  />
                </TableCell>

                <TableCell align="right">
                  <Stack
                    direction="row"
                    spacing={0.5}
                    justifyContent="flex-end"
                  >
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() =>
                          onEdit(
                            employee
                          )
                        }
                        sx={{
                          color:
                            "#2563EB",
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() =>
                          onDelete(
                            employee
                          )
                        }
                        sx={{
                          color:
                            "#DC2626",
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/* ==========================================================
   MOBILE LIST
========================================================== */

function MobileEmployeeList({
  employees,
  onEdit,
  onDelete,
}) {
  return (
    <Box sx={{ p: 1.5 }}>
      <Stack spacing={1.5}>
        {employees.map(
          (employee) => (
            <Card
              key={employee.id}
              elevation={0}
              sx={{
                border:
                  "1px solid #E5E7EB",
                borderRadius: 2.5,
                backgroundColor:
                  "#FAFAFA",
              }}
            >
              <CardContent
                sx={{
                  p: 1.8,
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                >
                  <EmployeeAvatar
                    employee={
                      employee
                    }
                    size={50}
                  />

                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 800,
                      }}
                      noWrap
                    >
                      {employee.fullName ||
                        "Unnamed Employee"}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 12,
                        color:
                          "#64748B",
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {employee.email ||
                        "No email"}
                    </Typography>
                  </Box>

                  <Chip
                    label={`#${employee.id}`}
                    size="small"
                    sx={{
                      backgroundColor:
                        "#EFF6FF",
                      color:
                        "#2563EB",
                      fontWeight: 700,
                    }}
                  />
                </Stack>

                <Divider
                  sx={{ my: 1.5 }}
                />

                <Stack spacing={1}>
                  <InfoRow
                    icon={<Phone />}
                    label="Phone"
                    value={
                      employee.phone ||
                      "Not provided"
                    }
                  />

                  <InfoRow
                    icon={
                      <CalendarMonth />
                    }
                    label="Birth Date"
                    value={
                      employee.birthDate ||
                      "Not provided"
                    }
                  />

                  <InfoRow
                    icon={<Person />}
                    label="Status"
                    value={
                      employee.maritalStatus ||
                      "Not specified"
                    }
                  />

                  <InfoRow
                    icon={<Badge />}
                    label="Employee ID"
                    value={
                      employee.id
                        ? `EMP-${employee.id}`
                        : "Not assigned"
                    }
                  />
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 1.8 }}
                >
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={
                      <Edit />
                    }
                    onClick={() =>
                      onEdit(
                        employee
                      )
                    }
                    sx={{
                      textTransform:
                        "none",
                      borderRadius: 2,
                      fontWeight: 700,
                    }}
                  >
                    Edit
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={
                      <Delete />
                    }
                    onClick={() =>
                      onDelete(
                        employee
                      )
                    }
                    sx={{
                      textTransform:
                        "none",
                      borderRadius: 2,
                      fontWeight: 700,
                    }}
                  >
                    Delete
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )
        )}
      </Stack>
    </Box>
  );
}

/* ==========================================================
   AVATAR
========================================================== */

function EmployeeAvatar({
  employee,
  size = 44,
}) {
  const initial =
    employee?.fullName
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "E";

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        backgroundColor:
          "#0F2747",
        fontWeight: 800,
        flexShrink: 0,
      }}
    >
      {initial}
    </Avatar>
  );
}

/* ==========================================================
   INFO ROW
========================================================== */

function InfoRow({
  icon,
  label,
  value,
}) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          color: "#64748B",
          display: "flex",
          flexShrink: 0,
          "& .MuiSvgIcon-root": {
            fontSize: 17,
          },
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          fontSize: 12,
          color: "#64748B",
          minWidth: 80,
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          color: "#1F2937",
          overflow: "hidden",
          textOverflow:
            "ellipsis",
          whiteSpace:
            "nowrap",
          minWidth: 0,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

/* ==========================================================
   SECTION TITLE
========================================================== */

function SectionTitle({
  children,
}) {
  return (
    <Typography
      sx={{
        fontWeight: 800,
        color: "#0F2747",
        mt: 3,
        mb: 1.5,
      }}
    >
      {children}
    </Typography>
  );
}

/* ==========================================================
   LOADING
========================================================== */

function LoadingState() {
  return (
    <Box
      sx={{
        minHeight: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack
        alignItems="center"
        spacing={1.5}
      >
        <CircularProgress
          size={34}
          sx={{
            color: "#0D9488",
          }}
        />

        <Typography
          sx={{
            fontSize: 14,
            color: "#64748B",
          }}
        >
          Loading employees...
        </Typography>
      </Stack>
    </Box>
  );
}

/* ==========================================================
   EMPTY
========================================================== */

function EmptyState({
  searchTerm,
  onAdd,
}) {
  return (
    <Box
      sx={{
        minHeight: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Stack
        alignItems="center"
        spacing={1.2}
      >
        <Group
          sx={{
            fontSize: 55,
            color: "#CBD5E1",
          }}
        />

        <Typography
          sx={{
            fontWeight: 700,
            color: "#475569",
          }}
        >
          {searchTerm
            ? "No employees found"
            : "No employees yet"}
        </Typography>

        <Typography
          sx={{
            fontSize: 13,
            color: "#94A3B8",
            textAlign: "center",
          }}
        >
          {searchTerm
            ? "Try another search term."
            : "Add your first employee to get started."}
        </Typography>

        {!searchTerm && (
          <Button
            variant="contained"
            onClick={onAdd}
            startIcon={
              <Group />
            }
            sx={{
              mt: 1,
              textTransform:
                "none",
              borderRadius: 2,
              backgroundColor:
                "#0D9488",
              fontWeight: 700,

              "&:hover": {
                backgroundColor:
                  "#0F766E",
              },
            }}
          >
            Add Employee
          </Button>
        )}
      </Stack>
    </Box>
  );
}

/* ==========================================================
   INITIAL
========================================================== */

function getInitial(name) {
  if (!name) return "E";

  return name
    .trim()
    .charAt(0)
    .toUpperCase();
}