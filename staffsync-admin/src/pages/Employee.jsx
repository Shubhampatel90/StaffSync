import { useEffect, useState } from "react";

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

  Grid,

  IconButton,

  InputAdornment,

  MenuItem,

  Snackbar,

  Stack,

  TextField,

  Tooltip,

  Typography,

  Table,

  TableBody,

  TableCell,

  TableContainer,

  TableHead,

  TableRow,

} from "@mui/material";

import {

  Add,

  Close,

  Delete,

  Edit,

  Email,

  Phone,

  LockReset,

  People,

  Search,

  Visibility,

  VisibilityOff,

} from "@mui/icons-material";

const API_BASE_URL = "http://localhost:8080";

// Send the authenticated session cookie with every backend request.
const apiFetch = (url, options = {}) =>
  fetch(url, { ...options, credentials: "include" });

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

const EMPTY_FORM = {

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

function Employee() {

  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);

  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [passwordDialogOpen, setPasswordDialogOpen] =

    useState(false);

  const [editingEmployee, setEditingEmployee] =

    useState(null);

  const [selectedEmployee, setSelectedEmployee] =

    useState(null);

  const [formData, setFormData] = useState(

    EMPTY_FORM

  );

  const [newPassword, setNewPassword] =

    useState("");

  const [confirmPassword, setConfirmPassword] =

    useState("");

  const [showPassword, setShowPassword] =

    useState(false);

  const [showNewPassword, setShowNewPassword] =

    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =

    useState(false);

  const [profileImage, setProfileImage] =

    useState(null);

  const [imagePreview, setImagePreview] =

    useState("");

  const [saving, setSaving] = useState(false);

  const [changingPassword, setChangingPassword] =

    useState(false);

  const [snackbar, setSnackbar] = useState({

    open: false,

    message: "",

    severity: "success",

  });

  // ============================================================

  // FETCH EMPLOYEES

  // ============================================================

  const fetchEmployees = async () => {

    try {

      setLoading(true);

      const response = await apiFetch(

        `${API_BASE_URL}/api/admin/employees`

      );

      if (!response.ok) {

        const errorText = await response.text();

        throw new Error(

          `Failed to fetch employees. HTTP ${response.status}: ${errorText || response.statusText}`

        );

      }

      const data = await response.json();

      setEmployees(

        Array.isArray(data) ? data : []

      );

    } catch (error) {

      console.error(

        "Employee fetch error:",

        error

      );

      showSnackbar(

        error instanceof Error ? error.message : "Unable to load employees.",

        "error"

      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchEmployees();

  }, []);

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

  const handleSnackbarClose = () => {

    setSnackbar((previous) => ({

      ...previous,

      open: false,

    }));

  };

  // ============================================================

  // SEARCH

  // ============================================================

  const filteredEmployees = employees.filter(

    (employee) => {

      const searchValue =

        search.toLowerCase().trim();

      if (!searchValue) {

        return true;

      }

      return (

        String(employee.id || "")

          .toLowerCase()

          .includes(searchValue) ||

        String(employee.fullName || "")

          .toLowerCase()

          .includes(searchValue) ||

        String(employee.email || "")

          .toLowerCase()

          .includes(searchValue) ||

        String(employee.phone || "")

          .toLowerCase()

          .includes(searchValue)

      );

    }

  );

  // ============================================================

  // FORM CHANGE

  // ============================================================

  const handleChange = (event) => {

    const { name, value } = event.target;

    setFormData((previous) => ({

      ...previous,

      [name]: value,

    }));

  };

  // ============================================================

  // IMAGE

  // ============================================================

  const handleImageChange = (event) => {

    const file = event.target.files?.[0];

    if (!file) {

      return;

    }

    setProfileImage(file);

    const previewUrl =

      URL.createObjectURL(file);

    setImagePreview(previewUrl);

  };

  // ============================================================

  // PROFILE IMAGE URL

  // ============================================================

  
const API_BASE_URL = "http://localhost:8080";

const getProfileImage = (employee) => {
  if (!employee?.id) {
    return "";
  }

  return `${API_BASE_URL}/api/admin/employees/${employee.id}/image`;
};

  // ============================================================

  // ADD EMPLOYEE

  // ============================================================

  const handleAddEmployee = () => {

    setEditingEmployee(null);

    setFormData({

      ...EMPTY_FORM,

    });

    setProfileImage(null);

    setImagePreview("");

    setShowPassword(false);

    setDialogOpen(true);

  };

  // ============================================================

  // EDIT EMPLOYEE

  // ============================================================

  const handleEditEmployee = (employee) => {

    setEditingEmployee(employee);

    setFormData({

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

    setProfileImage(null);

    setImagePreview(

      getProfileImage(employee)

    );

    setShowPassword(false);

    setDialogOpen(true);

  };

  // ============================================================

  // CLOSE EMPLOYEE DIALOG

  // ============================================================

  const handleCloseDialog = () => {

    if (saving) {

      return;

    }

    setDialogOpen(false);

    setEditingEmployee(null);

    setFormData({

      ...EMPTY_FORM,

    });

    setProfileImage(null);

    setImagePreview("");

  };

  // ============================================================

  // SAVE EMPLOYEE

  // ============================================================

  const handleSubmit = async () => {

    if (!formData.fullName.trim()) {

      showSnackbar(

        "Please enter employee name.",

        "error"

      );

      return;

    }

    if (!formData.email.trim()) {

      showSnackbar(

        "Please enter employee email.",

        "error"

      );

      return;

    }

    if (

      !editingEmployee &&

      !formData.password.trim()

    ) {

      showSnackbar(

        "Please enter employee password.",

        "error"

      );

      return;

    }

    try {

      setSaving(true);

      const payload = {

        fullName: formData.fullName,

        currentAddress:

          formData.currentAddress,

        permanentAddress:

          formData.permanentAddress,

        phone: formData.phone,

        email: formData.email,

        aadhaarOrPan:

          formData.aadhaarOrPan,

        birthDate:

          formData.birthDate || null,

        maritalStatus:

          formData.maritalStatus,

        spouseName:

          formData.spouseName,

        spouseEmployer:

          formData.spouseEmployer,

        spouseWorkPhone:

          formData.spouseWorkPhone,

      };

      /*

       * Password is included only when:

       *

       * 1. Creating a new employee

       * 2. Admin entered a new password while editing

       */

      if (formData.password.trim()) {

        payload.password =

          formData.password;

      }

      const url = editingEmployee

        ? `${API_BASE_URL}/api/admin/employees/${editingEmployee.id}`

        : `${API_BASE_URL}/api/admin/employees`;

      const method = editingEmployee

        ? "PUT"

        : "POST";

      const response = await apiFetch(url, {

        method,

        headers: {

          "Content-Type":

            "application/json",

        },

        body: JSON.stringify(payload),

      });

      if (!response.ok) {

        const errorText =

          await response.text();

        throw new Error(

          errorText ||

            "Unable to save employee."

        );

      }

      const savedEmployee =

        await response.json();

      // ========================================================

      // PROFILE IMAGE

      // ========================================================

      if (

        profileImage &&

        savedEmployee?.id

      ) {

        const imageData =

          new FormData();

        imageData.append(

          "image",

          profileImage

        );

        const imageResponse =

          await apiFetch(

            `${API_BASE_URL}/api/admin/employees/${savedEmployee.id}/image`,

            {

              method: "PUT",

              body: imageData,

            }

          );

        if (!imageResponse.ok) {

          console.warn(

            "Employee saved, but image upload failed."

          );

        }

      }

      showSnackbar(

        editingEmployee

          ? "Employee updated successfully."

          : "Employee added successfully.",

        "success"

      );

      handleCloseDialog();

      await fetchEmployees();

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

  // ============================================================

  // OPEN PASSWORD CHANGE

  // ============================================================

  const handleOpenPasswordDialog = (

    employee

  ) => {

    setSelectedEmployee(employee);

    setNewPassword("");

    setConfirmPassword("");

    setShowNewPassword(false);

    setShowConfirmPassword(false);

    setPasswordDialogOpen(true);

  };

  // ============================================================

  // CLOSE PASSWORD CHANGE

  // ============================================================

  const handleClosePasswordDialog = () => {

    if (changingPassword) {

      return;

    }

    setPasswordDialogOpen(false);

    setSelectedEmployee(null);

    setNewPassword("");

    setConfirmPassword("");

  };

  // ============================================================

  // CHANGE EMPLOYEE PASSWORD

  // ============================================================

  const handleChangePassword = async () => {

    if (!newPassword.trim()) {

      showSnackbar(

        "Please enter a new password.",

        "error"

      );

      return;

    }

    if (newPassword.length < 6) {

      showSnackbar(

        "Password must be at least 6 characters.",

        "error"

      );

      return;

    }

    if (

      newPassword !== confirmPassword

    ) {

      showSnackbar(

        "Passwords do not match.",

        "error"

      );

      return;

    }

    if (!selectedEmployee?.id) {

      showSnackbar(

        "Employee not selected.",

        "error"

      );

      return;

    }

    try {

      setChangingPassword(true);

      /*

       * We use the existing employee PUT endpoint.

       *

       * Only the password is supplied here.

       *

       * Your Employee.updateFrom() method handles

       * the password update when it is non-empty.

       */

      const response = await apiFetch(

        `${API_BASE_URL}/api/admin/employees/${selectedEmployee.id}`,

        {

          method: "PUT",

          headers: {

            "Content-Type":

              "application/json",

          },

          body: JSON.stringify({

            password: newPassword,

          }),

        }

      );

      if (!response.ok) {

        const errorText =

          await response.text();

        throw new Error(

          errorText ||

            "Unable to change password."

        );

      }

      showSnackbar(

        `Password changed successfully for ${selectedEmployee.fullName}.`,

        "success"

      );

      handleClosePasswordDialog();

      await fetchEmployees();

    } catch (error) {

      console.error(

        "Password change error:",

        error

      );

      showSnackbar(

        error.message ||

          "Unable to change password.",

        "error"

      );

    } finally {

      setChangingPassword(false);

    }

  };

  // ============================================================

  // DELETE EMPLOYEE

  // ============================================================

  const handleDeleteEmployee = async (

    employee

  ) => {

    const confirmed =

      window.confirm(

        `Are you sure you want to delete ${employee.fullName}?`

      );

    if (!confirmed) {

      return;

    }

    try {

      const response = await apiFetch(

        `${API_BASE_URL}/api/admin/employees/${employee.id}`,

        {

          method: "DELETE",

        }

      );

      if (!response.ok) {

        throw new Error(

          "Unable to delete employee."

        );

      }

      showSnackbar(

        "Employee deleted successfully.",

        "success"

      );

      await fetchEmployees();

    } catch (error) {

      console.error(

        "Employee delete error:",

        error

      );

      showSnackbar(

        "Unable to delete employee.",

        "error"

      );

    }

  };

  // ============================================================

  // VIEW EMPLOYEE

  // ============================================================

  const handleViewEmployee = (

    employee

  ) => {

    setSelectedEmployee(employee);

    setViewDialogOpen(true);

  };

  return (

    <Box

      sx={{

        width: "100%",

        minWidth: 0,

        minHeight: {

          xs: "calc(100vh - 64px)",

          md: "calc(100vh - 72px)",

        },

        backgroundColor:

          COLORS.background,

        p: {

          xs: 2,

          sm: 2.5,

          md: 3,

          lg: 4,

          xl: 5,

        },

      }}

    >

      {/* ======================================================

          HEADER

      ====================================================== */}

      <Box

        sx={{

          display: "flex",

          alignItems: {

            xs: "flex-start",

            sm: "center",

          },

          justifyContent:

            "space-between",

          flexDirection: {

            xs: "column",

            sm: "row",

          },

          gap: 2,

          mb: 3,

        }}

      >

        <Box>

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

            Employees

          </Typography>

          <Typography

            sx={{

              mt: 0.5,

              fontSize: 14,

              color: COLORS.muted,

            }}

          >

            Manage employee information,

            profiles and passwords.

          </Typography>

        </Box>

        <Button

          variant="contained"

          startIcon={<Add />}

          onClick={handleAddEmployee}

          sx={{

            minHeight: 42,

            px: 2.2,

            borderRadius: 2,

            textTransform: "none",

            fontWeight: 700,

            backgroundColor:

              COLORS.blue,

            boxShadow: "none",

            "&:hover": {

              backgroundColor:

                COLORS.navy,

              boxShadow: "none",

            },

          }}

        >

          Add Employee

        </Button>

      </Box>

      {/* ======================================================

          MAIN CARD

      ====================================================== */}

      <Card

        elevation={0}

        sx={{

          borderRadius: 3,

          border: `1px solid ${COLORS.border}`,

          backgroundColor:

            COLORS.white,

          overflow: "hidden",

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

          {/* ==================================================

              SEARCH

          ================================================== */}

          <Box

            sx={{

              display: "flex",

              alignItems: {

                xs: "stretch",

                md: "center",

              },

              justifyContent:

                "space-between",

              flexDirection: {

                xs: "column",

                md: "row",

              },

              gap: 2,

              mb: 2.5,

            }}

          >

            <TextField

              fullWidth

              size="small"

              placeholder="Search by name, email, phone or ID..."

              value={search}

              

              sx={{

                maxWidth: {

                  xs: "100%",

                  md: 430,

                },

                "& .MuiOutlinedInput-root":

                  {

                    borderRadius: 2,

                    backgroundColor:

                      "#FFFFFF",

                  },

              }}

              slotProps={{ input: {

                startAdornment: (

                  <InputAdornment position="start">

                    <Search

                      sx={{

                        color:

                          COLORS.muted,

                      }}

                    />

                  </InputAdornment>

                ),

              }}}

            />

            <Stack

              direction="row"

              spacing={1}

              alignItems="center"

            >

              <People

                sx={{

                  color:

                    COLORS.teal,

                }}

              />

              <Typography

                sx={{

                  fontSize: 14,

                  fontWeight: 700,

                  color: COLORS.text,

                }}

              >

                {

                  filteredEmployees.length

                }{" "}

                Employees

              </Typography>

            </Stack>

          </Box>

          <Divider

            sx={{

              mb: 2.5,

            }}

          />

          {/* ==================================================

              LOADING

          ================================================== */}

          {loading ? (

            <Box

              sx={{

                minHeight: 300,

                display: "flex",

                alignItems:

                  "center",

                justifyContent:

                  "center",

              }}

            >

              <CircularProgress

                size={34}

                sx={{

                  color:

                    COLORS.blue,

                }}

              />

            </Box>

          ) : filteredEmployees.length ===

            0 ? (

            <Box

              sx={{

                minHeight: 300,

                display: "flex",

                flexDirection:

                  "column",

                alignItems:

                  "center",

                justifyContent:

                  "center",

                textAlign: "center",

                px: 2,

              }}

            >

              <Avatar

                sx={{

                  width: 64,

                  height: 64,

                  mb: 2,

                  backgroundColor:

                    "#E8F4FF",

                  color:

                    COLORS.blue,

                }}

              >

                <People />

              </Avatar>

              <Typography

                sx={{

                  fontSize: 18,

                  fontWeight: 800,

                  color:

                    COLORS.navy,

                }}

              >

                No employees found

              </Typography>

              <Typography

                sx={{

                  mt: 0.7,

                  fontSize: 14,

                  color:

                    COLORS.muted,

                }}

              >

                {search

                  ? "Try changing your search."

                  : "Add your first employee to get started."}

              </Typography>

              {!search && (

                <Button

                  variant="contained"

                  startIcon={<Add />}

                  onClick={

                    handleAddEmployee

                  }

                  sx={{

                    mt: 2,

                    textTransform:

                      "none",

                    borderRadius: 2,

                    backgroundColor:

                      COLORS.blue,

                    boxShadow: "none",

                  }}

                >

                  Add Employee

                </Button>

              )}

            </Box>

          ) : (

            <TableContainer
              sx={{
                width: "100%",
                overflowX: "auto",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 2,
              }}
            >
              <Table
                sx={{
                  minWidth: 980,
                  tableLayout: "auto",
                  "& .MuiTableCell-root": {
                    borderBottom: `1px solid ${COLORS.border}`,
                    py: 1.6,
                  },
                }}
              >
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#F8FAFC" }}>
                    <TableCell sx={{ fontWeight: 800, color: COLORS.text }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: COLORS.text }}>Employee ID</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: COLORS.text }}>Contact</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: COLORS.text }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id} hover sx={{ backgroundColor: COLORS.white, "&:last-child td": { borderBottom: 0 } }}>
                      <TableCell sx={{ minWidth: 300 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar onClick={() => handleViewEmployee(employee)} src={getProfileImage(employee)} sx={{ width: 54, height: 54, bgcolor: COLORS.navy, color: COLORS.white, fontWeight: 800, flexShrink: 0 }}>
                            {employee.fullName?.charAt(0)?.toUpperCase() || "E"}
                          </Avatar>
                          
                          <Box sx={{ minWidth: 0 }}>
                            <Typography onClick={() => handleViewEmployee(employee)} sx={{ fontSize: 15, fontWeight: 800, color: COLORS.navy, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
                              {employee.fullName || "Unnamed Employee"}
                            </Typography>
                            <Typography sx={{ mt: 0.3, fontSize: 13, color: COLORS.muted }}>
                              {employee.email || "No email provided"}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={`EMP-${employee.id}`} size="small" sx={{ bgcolor: "#EFF6FF", color: COLORS.blue, fontWeight: 800, borderRadius: 2 }} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 250 }}>
                        <Stack spacing={0.7}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Phone sx={{ fontSize: 17, color: COLORS.muted }} />
                            <Typography sx={{ fontSize: 14, color: COLORS.text }}>{employee.phone || "No phone provided"}</Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Email sx={{ fontSize: 17, color: COLORS.muted }} />
                            <Typography sx={{ fontSize: 14, color: COLORS.text }}>{employee.email || "No email provided"}</Typography>
                          </Stack>
                        </Stack>
                      </TableCell>
                      
                      
                      <TableCell align="center" sx={{ minWidth: 150 }}>
                        <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                          <Tooltip title="Edit employee"><IconButton onClick={() => handleEditEmployee(employee)} size="small" sx={{ color: COLORS.blue }}><Edit fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Reset password"><IconButton onClick={() => handleOpenPasswordDialog(employee)} size="small" sx={{ color: COLORS.muted }}><LockReset fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Delete employee"><IconButton onClick={() => handleDeleteEmployee(employee)} size="small" sx={{ color: "#DC2626" }}><Delete fontSize="small" /></IconButton></Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

          )}

        </CardContent>

      </Card>

      {/* ======================================================

          ADD / EDIT EMPLOYEE

      ====================================================== */}

      <Dialog

        open={dialogOpen}

        onClose={

          handleCloseDialog

        }

        fullWidth

        maxWidth="md"

        PaperProps={{

          sx: {

            borderRadius: 3,

          },

        }}

      >

        <DialogTitle

          sx={{

            px: {

              xs: 2.5,

              sm: 3,

            },

            py: 2,

            fontWeight: 800,

            color: COLORS.navy,

          }}

        >

          {editingEmployee

            ? "Edit Employee"

            : "Add Employee"}

        </DialogTitle>

        <IconButton

          onClick={

            handleCloseDialog

          }

          disabled={saving}

          sx={{

            position: "absolute",

            right: 12,

            top: 12,

            color: COLORS.muted,

          }}

        >

          <Close />

        </IconButton>

        <Divider />

        <DialogContent

          sx={{

            px: {

              xs: 2.5,

              sm: 3,

            },

            py: 3,

          }}

        >

          {/* ==================================================

              PROFILE IMAGE

          ================================================== */}

          <Box

            sx={{

              display: "flex",

              alignItems: "center",

              gap: 2,

              mb: 3,

            }}

          >

            <Avatar

              src={imagePreview}

              sx={{

                width: 76,

                height: 76,

                backgroundColor:

                  "#E8F4FF",

                color: COLORS.blue,

                fontSize: 28,

              }}

            >

              {!imagePreview &&

                formData.fullName

                  ?.charAt(0)

                  ?.toUpperCase()}

            </Avatar>

            <Box>

              <Button

                component="label"

                variant="outlined"

                sx={{

                  textTransform:

                    "none",

                  borderRadius: 2,

                  fontWeight: 700,

                  borderColor:

                    COLORS.border,

                  color: COLORS.navy,

                }}

              >

                Choose Profile Image

                <input

                  type="file"

                  hidden

                  accept="image/*"

                  onChange={

                    handleImageChange

                  }

                />

              </Button>

              <Typography

                sx={{

                  mt: 0.7,

                  fontSize: 12,

                  color:

                    COLORS.muted,

                }}

              >

                JPG, PNG or other image

                format

              </Typography>

            </Box>

          </Box>

          {/* ==================================================

              PERSONAL INFORMATION

          ================================================== */}

          <Typography

            sx={{

              mb: 2,

              fontSize: 15,

              fontWeight: 800,

              color: COLORS.navy,

            }}

          >

            Personal Information

          </Typography>

          <Grid

            container

            spacing={2}

          >

            <Grid item xs={12} sm={6}>

              <TextField

                fullWidth

                size="small"

                required

                label="Full Name"

                name="fullName"

                value={

                  formData.fullName

                }

                onChange={

                  handleChange

                }

              />

            </Grid>

            <Grid item xs={12} sm={6}>

              <TextField

                fullWidth

                size="small"

                label="Phone"

                name="phone"

                value={

                  formData.phone

                }

                onChange={

                  handleChange

                }

              />

            </Grid>

            <Grid item xs={12} sm={6}>

              <TextField

                fullWidth

                size="small"

                required

                type="email"

                label="Email"

                name="email"

                value={

                  formData.email

                }

                onChange={

                  handleChange

                }

              />

            </Grid>

            {!editingEmployee && (

              <Grid

                item

                xs={12}

                sm={6}

              >

                <TextField

                  fullWidth

                  size="small"

                  required

                  label="Password"

                  name="password"

                  type={

                    showPassword

                      ? "text"

                      : "password"

                  }

                  value={

                    formData.password

                  }

                  onChange={

                    handleChange

                  }

                  slotProps={{ input: {

                    endAdornment: (

                      <InputAdornment position="end">

                        <IconButton

                          onClick={() =>

                            setShowPassword(

                              (previous) =>

                                !previous

                            )

                          }

                          edge="end"

                        >

                          {showPassword ? (

                            <VisibilityOff />

                          ) : (

                            <Visibility />

                          )}

                        </IconButton>

                      </InputAdornment>

                    ),

                  }}}

                />

              </Grid>

            )}

            <Grid

              item

              xs={12}

              sm={6}

            >

              <TextField

                fullWidth

                size="small"

                type="date"

                label="Birth Date"

                name="birthDate"

                value={

                  formData.birthDate

                }

                onChange={

                  handleChange

                }

                InputLabelProps={{

                  shrink: true,

                }}

              />

            </Grid>

            <Grid

              item

              xs={12}

              sm={6}

            >

              <TextField

                fullWidth

                size="small"

                label="Aadhaar / PAN"

                name="aadhaarOrPan"

                value={

                  formData.aadhaarOrPan

                }

                onChange={

                  handleChange

                }

              />

            </Grid>

            <Grid item xs={12}>

              <TextField

                fullWidth

                size="small"

                label="Current Address"

                name="currentAddress"

                value={

                  formData.currentAddress

                }

                onChange={

                  handleChange

                }

                multiline

                minRows={2}

              />

            </Grid>

            <Grid item xs={12}>

              <TextField

                fullWidth

                size="small"

                label="Permanent Address"

                name="permanentAddress"

                value={

                  formData.permanentAddress

                }

                onChange={

                  handleChange

                }

                multiline

                minRows={2}

              />

            </Grid>

          </Grid>

          {/* ==================================================

              FAMILY INFORMATION

          ================================================== */}

          <Typography

            sx={{

              mt: 3,

              mb: 2,

              fontSize: 15,

              fontWeight: 800,

              color: COLORS.navy,

            }}

          >

            Family Information

          </Typography>

          <Grid

            container

            spacing={2}

          >

            <Grid

              item

              xs={12}

              sm={4}

            >

              <TextField

                fullWidth

                size="small"

                select

                label="Marital Status"

                name="maritalStatus"

                value={

                  formData.maritalStatus

                }

                onChange={

                  handleChange

                }

              >

                <MenuItem value="">

                  Select

                </MenuItem>

                <MenuItem value="SINGLE">

                  Single

                </MenuItem>

                <MenuItem value="MARRIED">

                  Married

                </MenuItem>

                <MenuItem value="DIVORCED">

                  Divorced

                </MenuItem>

                <MenuItem value="WIDOWED">

                  Widowed

                </MenuItem>

              </TextField>

            </Grid>

            <Grid

              item

              xs={12}

              sm={4}

            >

              <TextField

                fullWidth

                size="small"

                label="Spouse Name"

                name="spouseName"

                value={

                  formData.spouseName

                }

                onChange={

                  handleChange

                }

              />

            </Grid>

            <Grid

              item

              xs={12}

              sm={4}

            >

              <TextField

                fullWidth

                size="small"

                label="Spouse Employer"

                name="spouseEmployer"

                value={

                  formData.spouseEmployer

                }

                onChange={

                  handleChange

                }

              />

            </Grid>

            <Grid item xs={12}>

              <TextField

                fullWidth

                size="small"

                label="Spouse Work Phone"

                name="spouseWorkPhone"

                value={

                  formData.spouseWorkPhone

                }

                onChange={

                  handleChange

                }

              />

            </Grid>

          </Grid>

          {/* ==================================================

              EDIT PASSWORD

          ================================================== */}

          {editingEmployee && (

            <Box

              sx={{

                mt: 3,

                p: 2,

                borderRadius: 2,

                backgroundColor:

                  "#F8FAFC",

                border: `1px solid ${COLORS.border}`,

              }}

            >

              <Box

                sx={{

                  display: "flex",

                  alignItems:

                    "center",

                  justifyContent:

                    "space-between",

                  gap: 2,

                  flexWrap: "wrap",

                }}

              >

                <Box>

                  <Typography

                    sx={{

                      fontSize: 14,

                      fontWeight: 800,

                      color:

                        COLORS.navy,

                    }}

                  >

                    Password

                  </Typography>

                  <Typography

                    sx={{

                      mt: 0.4,

                      fontSize: 12,

                      color:

                        COLORS.muted,

                    }}

                  >

                    Use the button below

                    if you want to change

                    this employee's

                    password.

                  </Typography>

                </Box>

                <Button

                  variant="outlined"

                  startIcon={

                    <LockReset />

                  }

                  onClick={() =>

                    handleOpenPasswordDialog(

                      editingEmployee

                    )

                  }

                  sx={{

                    textTransform:

                      "none",

                    borderRadius: 2,

                    fontWeight: 700,

                    color:

                      COLORS.blue,

                    borderColor:

                      COLORS.blue,

                  }}

                >

                  Change Password

                </Button>

              </Box>

            </Box>

          )}

        </DialogContent>

        <Divider />

        <DialogActions

          sx={{

            px: {

              xs: 2.5,

              sm: 3,

            },

            py: 2,

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

              color:

                COLORS.muted,

              fontWeight: 700,

            }}

          >

            Cancel

          </Button>

          <Button

            variant="contained"

            onClick={handleSubmit}

            disabled={saving}

            sx={{

              minWidth: 130,

              textTransform:

                "none",

              fontWeight: 700,

              borderRadius: 2,

              backgroundColor:

                COLORS.blue,

              boxShadow: "none",

              "&:hover": {

                backgroundColor:

                  COLORS.navy,

                boxShadow: "none",

              },

            }}

          >

            {saving ? (

              <CircularProgress

                size={22}

                sx={{

                  color:

                    "#FFFFFF",

                }}

              />

            ) : editingEmployee ? (

              "Update Employee"

            ) : (

              "Add Employee"

            )}

          </Button>

        </DialogActions>

      </Dialog>

      {/* ======================================================

          CHANGE PASSWORD DIALOG

      ====================================================== */}

      <Dialog

        open={passwordDialogOpen}

        onClose={

          handleClosePasswordDialog

        }

        fullWidth

        maxWidth="xs"

        PaperProps={{

          sx: {

            borderRadius: 3,

          },

        }}

      >

        <DialogTitle

          sx={{

            fontWeight: 800,

            color: COLORS.navy,

          }}

        >

          Change Employee Password

        </DialogTitle>

        <IconButton

          onClick={

            handleClosePasswordDialog

          }

          disabled={

            changingPassword

          }

          sx={{

            position: "absolute",

            right: 12,

            top: 12,

            color: COLORS.muted,

          }}

        >

          <Close />

        </IconButton>

        <Divider />

        <DialogContent

          sx={{

            p: 3,

          }}

        >

          <Box

            sx={{

              display: "flex",

              alignItems:

                "center",

              gap: 1.5,

              mb: 2.5,

            }}

          >

            <Avatar

              src={

                selectedEmployee

                  ? getProfileImage(

                      selectedEmployee

                    )

                  : ""

              }

              sx={{

                width: 48,

                height: 48,

                backgroundColor:

                  "#E8F4FF",

                color:

                  COLORS.blue,

              }}

            >

              {selectedEmployee?.fullName

                ?.charAt(0)

                ?.toUpperCase()}

            </Avatar>

            <Box>

              <Typography

                sx={{

                  fontSize: 15,

                  fontWeight: 800,

                  color:

                    COLORS.navy,

                }}

              >

                {

                  selectedEmployee?.fullName

                }

              </Typography>

              <Typography

                sx={{

                  fontSize: 12,

                  color:

                    COLORS.muted,

                }}

              >

                {

                  selectedEmployee?.email

                }

              </Typography>

            </Box>

          </Box>

          <TextField

            fullWidth

            size="small"

            label="New Password"

            type={

              showNewPassword

                ? "text"

                : "password"

            }

            value={newPassword}

            onChange={(event) =>

              setNewPassword(

                event.target.value

              )

            }

            helperText="Minimum 6 characters"

            sx={{

              mb: 2,

            }}

            slotProps={{ input: {

              endAdornment: (

                <InputAdornment position="end">

                  <IconButton

                    onClick={() =>

                      setShowNewPassword(

                        (previous) =>

                          !previous

                      )

                    }

                    edge="end"

                  >

                    {showNewPassword ? (

                      <VisibilityOff />

                    ) : (

                      <Visibility />

                    )}

                  </IconButton>

                </InputAdornment>

              ),

            }}}

          />

          <TextField

            fullWidth

            size="small"

            label="Confirm New Password"

            type={

              showConfirmPassword

                ? "text"

                : "password"

            }

            value={confirmPassword}

            onChange={(event) =>

              setConfirmPassword(

                event.target.value

              )

            }

            slotProps={{ input: {

              endAdornment: (

                <InputAdornment position="end">

                  <IconButton

                    onClick={() =>

                      setShowConfirmPassword(

                        (previous) =>

                          !previous

                      )

                    }

                    edge="end"

                  >

                    {showConfirmPassword ? (

                      <VisibilityOff />

                    ) : (

                      <Visibility />

                    )}

                  </IconButton>

                </InputAdornment>

              ),

            }}}

          />

        </DialogContent>

        <Divider />

        <DialogActions

          sx={{

            p: 2,

          }}

        >

          <Button

            onClick={

              handleClosePasswordDialog

            }

            disabled={

              changingPassword

            }

            sx={{

              textTransform:

                "none",

              color:

                COLORS.muted,

              fontWeight: 700,

            }}

          >

            Cancel

          </Button>

          <Button

            variant="contained"

            onClick={

              handleChangePassword

            }

            disabled={

              changingPassword

            }

            startIcon={

              !changingPassword && (

                <LockReset />

              )

            }

            sx={{

              textTransform:

                "none",

              borderRadius: 2,

              fontWeight: 700,

              backgroundColor:

                COLORS.blue,

              boxShadow: "none",

              "&:hover": {

                backgroundColor:

                  COLORS.navy,

                boxShadow: "none",

              },

            }}

          >

            {changingPassword ? (

              <CircularProgress

                size={21}

                sx={{

                  color:

                    "#FFFFFF",

                }}

              />

            ) : (

              "Change Password"

            )}

          </Button>

        </DialogActions>

      </Dialog>

      {/* ======================================================

          VIEW EMPLOYEE

      ====================================================== */}

      <Dialog

        open={viewDialogOpen}

        onClose={() =>

          setViewDialogOpen(false)

        }

        fullWidth

        maxWidth="sm"

        PaperProps={{

          sx: {

            borderRadius: 3,

          },

        }}

      >

        <DialogTitle

          sx={{

            fontWeight: 800,

            color:

              COLORS.navy,

          }}

        >

          Employee Details

        </DialogTitle>

        <IconButton

          onClick={() =>

            setViewDialogOpen(

              false

            )

          }

          sx={{

            position: "absolute",

            right: 12,

            top: 12,

            color: COLORS.muted,

          }}

        >

          <Close />

        </IconButton>

        <Divider />

        {selectedEmployee && (

          <DialogContent

            sx={{

              p: 3,

            }}

          >

            <Box

              sx={{

                display: "flex",

                alignItems:

                  "center",

                gap: 2,

                mb: 3,

              }}

            >

              <Avatar

                src={getProfileImage(

                  selectedEmployee

                )}

                sx={{

                  width: 76,

                  height: 76,

                  backgroundColor:

                    "#E8F4FF",

                  color:

                    COLORS.blue,

                  fontSize: 28,

                }}

              >

                {selectedEmployee.fullName

                  ?.charAt(0)

                  ?.toUpperCase()}

              </Avatar>

              <Box>

                <Typography

                  sx={{

                    fontSize: 20,

                    fontWeight: 800,

                    color:

                      COLORS.navy,

                  }}

                >

                  {

                    selectedEmployee.fullName

                  }

                </Typography>

                <Typography

                  sx={{

                    mt: 0.4,

                    fontSize: 13,

                    color:

                      COLORS.muted,

                  }}

                >

                  Employee ID: #

                  {

                    selectedEmployee.id

                  }

                </Typography>

              </Box>

            </Box>

            <Stack spacing={2}>

              <DetailRow

                label="Email"

                value={

                  selectedEmployee.email

                }

              />

              <DetailRow

                label="Phone"

                value={

                  selectedEmployee.phone

                }

              />

              <DetailRow

                label="Birth Date"

                value={

                  selectedEmployee.birthDate

                }

              />

              <DetailRow

                label="Aadhaar / PAN"

                value={

                  selectedEmployee.aadhaarOrPan

                }

              />

              <DetailRow

                label="Marital Status"

                value={

                  selectedEmployee.maritalStatus

                }

              />

              <DetailRow

                label="Spouse Name"

                value={

                  selectedEmployee.spouseName

                }

              />

              <DetailRow

                label="Spouse Employer"

                value={

                  selectedEmployee.spouseEmployer

                }

              />

              <DetailRow

                label="Spouse Work Phone"

                value={

                  selectedEmployee.spouseWorkPhone

                }

              />

              <DetailRow

                label="Current Address"

                value={

                  selectedEmployee.currentAddress

                }

              />

              <DetailRow

                label="Permanent Address"

                value={

                  selectedEmployee.permanentAddress

                }

              />

            </Stack>

          </DialogContent>

        )}

      </Dialog>

      {/* ======================================================

          SNACKBAR

      ====================================================== */}

      <Snackbar

        open={snackbar.open}

        autoHideDuration={3000}

        onClose={

          handleSnackbarClose

        }

        anchorOrigin={{

          vertical: "bottom",

          horizontal: "right",

        }}

      >

        <Alert

          onClose={

            handleSnackbarClose

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

// ============================================================

// EMPLOYEE CARD

// ============================================================

function EmployeeCard({

  employee,

  getProfileImage,

  onView,

  onEdit,

  onPassword,

  onDelete,

}) {

  return (

    <Card

      elevation={0}

      sx={{

        height: "100%",

        borderRadius: 2.5,

        border: `1px solid ${COLORS.border}`,

        backgroundColor:

          COLORS.white,

        transition:

          "all 0.2s ease",

        "&:hover": {

          transform:

            "translateY(-2px)",

          boxShadow:

            "0 8px 24px rgba(15,39,71,0.08)",

        },

      }}

    >

      <CardContent

        sx={{

          p: 2.2,

        }}

      >

        <Box

          sx={{

            display: "flex",

            alignItems:

              "center",

            gap: 1.5,

          }}

        >

          <Avatar

            src={getProfileImage(

              employee

            )}

            sx={{

              width: 54,

              height: 54,

              backgroundColor:

                "#E8F4FF",

              color:

                COLORS.blue,

              fontWeight: 800,

            }}

          >

            {employee.fullName

              ?.charAt(0)

              ?.toUpperCase()}

          </Avatar>

          <Box

            sx={{

              minWidth: 0,

              flex: 1,

            }}

          >

            <Typography

              noWrap

              sx={{

                fontSize: 15,

                fontWeight: 800,

                color:

                  COLORS.navy,

              }}

            >

              {employee.fullName ||

                "Unnamed Employee"}

            </Typography>

            <Typography

              noWrap

              sx={{

                mt: 0.3,

                fontSize: 12,

                color:

                  COLORS.muted,

              }}

            >

              ID: #{employee.id}

            </Typography>

          </Box>

        </Box>

        <Divider

          sx={{

            my: 2,

          }}

        />

        <Stack spacing={1}>

          <Typography

            noWrap

            sx={{

              fontSize: 13,

              color:

                COLORS.text,

            }}

          >

            <strong>

              Email:

            </strong>{" "}

            {employee.email ||

              "-"}

          </Typography>

          <Typography

            noWrap

            sx={{

              fontSize: 13,

              color:

                COLORS.text,

            }}

          >

            <strong>

              Phone:

            </strong>{" "}

            {employee.phone ||

              "-"}

          </Typography>

        </Stack>

        <Box

          sx={{

            display: "flex",

            alignItems:

              "center",

            justifyContent:

              "space-between",

            mt: 2,

          }}

        >

          <Chip

            label="Active"

            size="small"

            sx={{

              height: 26,

              backgroundColor:

                "#DCFCE7",

              color:

                "#166534",

              fontWeight: 700,

              borderRadius: 1.5,

            }}

          />

          <Box>

            <Tooltip title="View">

              <IconButton

                size="small"

                onClick={onView}

                sx={{

                  color:

                    COLORS.blue,

                }}

              >

                <Visibility fontSize="small" />

              </IconButton>

            </Tooltip>

            <Tooltip title="Edit">

              <IconButton

                size="small"

                onClick={onEdit}

                sx={{

                  color:

                    COLORS.teal,

                }}

              >

                <Edit fontSize="small" />

              </IconButton>

            </Tooltip>

            <Tooltip title="Change Password">

              <IconButton

                size="small"

                onClick={

                  onPassword

                }

                sx={{

                  color:

                    "#7C3AED",

                }}

              >

                <LockReset fontSize="small" />

              </IconButton>

            </Tooltip>

            <Tooltip title="Delete">

              <IconButton

                size="small"

                onClick={onDelete}

                sx={{

                  color:

                    "#DC2626",

                }}

              >

                <Delete fontSize="small" />

              </IconButton>

            </Tooltip>

          </Box>

        </Box>

      </CardContent>

    </Card>

  );

}

// ============================================================

// DETAIL ROW

// ============================================================

function DetailRow({

  label,

  value,

}) {

  return (

    <Box>

      <Typography

        sx={{

          fontSize: 12,

          color:

            COLORS.muted,

          mb: 0.3,

        }}

      >

        {label}

      </Typography>

      <Typography

        sx={{

          fontSize: 14,

          fontWeight: 600,

          color:

            COLORS.text,

          wordBreak:

            "break-word",

        }}

      >

        {value || "-"}

      </Typography>

    </Box>

  );

}

export default Employee;
