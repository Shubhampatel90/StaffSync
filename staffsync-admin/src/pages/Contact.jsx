import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  Email,
  Phone,
  Send,
  SupportAgent,
} from "@mui/icons-material";

import staffSyncLogo from "../assets/staffsync_logo.png";

function Contact() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // HANDLE INPUT
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // SUBMIT CONTACT FORM
  // ============================================================

 const handleSubmit = async (event) => {
  event.preventDefault();

  console.log("=================================");
  console.log("CONTACT FORM SUBMIT CLICKED");
  console.log("FORM DATA:", formData);
  console.log("=================================");

  setSuccess("");
  setError("");

  if (
    !formData.name.trim() ||
    !formData.email.trim() ||
    !formData.subject ||
    !formData.message.trim()
  ) {
    setError("Please fill in all required fields.");
    return;
  }

  setLoading(true);

  try {
    console.log("SENDING REQUEST TO BACKEND...");

    const response = await fetch(
      "http://localhost:8080/api/contact",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    console.log("BACKEND RESPONSE STATUS:", response.status);

    const result = await response.text();

    console.log("BACKEND RESPONSE:", result);

    if (!response.ok) {
      throw new Error(result);
    }

    setSuccess(
      "Your message has been submitted successfully. Our support team will contact you shortly."
    );

    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  } catch (error) {
    console.error("CONTACT FORM ERROR:", error);

    setError(
      error.message ||
        "Unable to submit your message. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  // ============================================================
  // COMMON FIELD STYLE
  // ============================================================

  const fieldStyle = {
    "& .MuiOutlinedInput-root": {
      minHeight: 44,
      borderRadius: 2,
      backgroundColor: "#F8FAFC",

      "&:hover": {
        backgroundColor: "#FFFFFF",
      },

      "&.Mui-focused": {
        backgroundColor: "#FFFFFF",

        boxShadow:
          "0 0 0 3px rgba(37,99,235,0.08)",
      },
    },

    "& .MuiInputBase-input": {
      fontSize: "0.85rem",
    },

    "& .MuiInputLabel-root": {
      fontSize: "0.85rem",
    },
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        height: "100dvh",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        position: "fixed",
        inset: 0,

        boxSizing: "border-box",

        overflow: "hidden",

        px: {
          xs: 1,
          sm: 2,
        },

        py: {
          xs: 1,
          sm: 1.5,
        },

        background:
          "linear-gradient(135deg, #081C33 0%, #0F2747 48%, #0D9488 100%)",

        // ======================================================
        // DECORATIVE CIRCLE 1
        // ======================================================

        "&::before": {
          content: '""',

          position: "fixed",

          width: {
            xs: 180,
            sm: 280,
            md: 400,
          },

          height: {
            xs: 180,
            sm: 280,
            md: 400,
          },

          borderRadius: "50%",

          background:
            "rgba(255,255,255,0.045)",

          top: {
            xs: -100,
            sm: -140,
            md: -180,
          },

          left: {
            xs: -100,
            sm: -140,
            md: -180,
          },

          pointerEvents: "none",
        },

        // ======================================================
        // DECORATIVE CIRCLE 2
        // ======================================================

        "&::after": {
          content: '""',

          position: "fixed",

          width: {
            xs: 170,
            sm: 260,
            md: 360,
          },

          height: {
            xs: 170,
            sm: 260,
            md: 360,
          },

          borderRadius: "50%",

          background:
            "rgba(255,255,255,0.04)",

          right: {
            xs: -90,
            sm: -130,
            md: -180,
          },

          bottom: {
            xs: -90,
            sm: -130,
            md: -180,
          },

          pointerEvents: "none",
        },
      }}
    >
      {/* ======================================================
          CONTACT CARD
      ====================================================== */}

      <Card
        elevation={0}
        sx={{
          position: "relative",

          zIndex: 2,

          width: "100%",

          maxWidth: {
            xs: 430,
            sm: 560,
            md: 600,
          },

          maxHeight: "calc(100dvh - 20px)",

          boxSizing: "border-box",

          borderRadius: {
            xs: 2.5,
            sm: 3,
            md: 3.5,
          },

          backgroundColor:
            "rgba(255,255,255,0.98)",

          border:
            "1px solid rgba(255,255,255,0.7)",

          boxShadow:
            "0 20px 60px rgba(0,0,0,0.28)",

          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 1.5,
              sm: 2.25,
              md: 2.75,
            },

            "&:last-child": {
              pb: {
                xs: 1.5,
                sm: 2.25,
                md: 2.75,
              },
            },
          }}
        >
          {/* ==================================================
              TOP BAR
          ================================================== */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",

              mb: {
                xs: 1,
                sm: 1.25,
              },
            }}
          >
            <IconButton
              onClick={() => navigate("/login")}
              disabled={loading}
              aria-label="Back to login"
              sx={{
                width: 36,
                height: 36,

                color: "#0F2747",

                backgroundColor: "#F1F5F9",

                "&:hover": {
                  backgroundColor: "#E2E8F0",
                },
              }}
            >
              <ArrowBack sx={{ fontSize: 20 }} />
            </IconButton>

            <Typography
              sx={{
                color: "#64748B",

                fontSize: {
                  xs: "0.68rem",
                  sm: "0.72rem",
                },

                fontWeight: 600,
              }}
            >
              StaffSync Support
            </Typography>
          </Box>

          {/* ==================================================
              BRAND
          ================================================== */}

          <Box
            sx={{
              textAlign: "center",

              mb: {
                xs: 1.25,
                sm: 1.5,
              },
            }}
          >
            <Box
              component="img"
              src={staffSyncLogo}
              alt="StaffSync Logo"
              sx={{
                width: {
                  xs: 48,
                  sm: 54,
                },

                height: {
                  xs: 48,
                  sm: 54,
                },

                mx: "auto",

                mb: 0.5,

                display: "block",

                objectFit: "contain",

                borderRadius: "12px",

                boxShadow:
                  "0 5px 16px rgba(15,39,71,0.15)",
              }}
            />

            <Typography
              component="h1"
              sx={{
                color: "#0F2747",

                fontWeight: 800,

                fontSize: {
                  xs: "1.25rem",
                  sm: "1.45rem",
                },

                lineHeight: 1.15,

                letterSpacing: "-0.4px",
              }}
            >
              Contact Support
            </Typography>

            <Typography
              sx={{
                color: "#64748B",

                fontSize: {
                  xs: "0.68rem",
                  sm: "0.72rem",
                },

                mt: 0.25,

                lineHeight: 1.35,

                maxWidth: 430,

                mx: "auto",
              }}
            >
              Have a question or facing an issue?
              Send us a message and our support team
              will assist you.
            </Typography>
          </Box>

          {/* ==================================================
              SUCCESS MESSAGE
          ================================================== */}

          {success && (
            <Alert
              severity="success"
              sx={{
                mb: 1,

                py: 0.25,

                borderRadius: 1.5,

                fontSize: "0.7rem",
              }}
            >
              {success}
            </Alert>
          )}

          {/* ==================================================
              ERROR MESSAGE
          ================================================== */}

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 1,

                py: 0.25,

                borderRadius: 1.5,

                fontSize: "0.7rem",
              }}
            >
              {error}
            </Alert>
          )}

          {/* ==================================================
              CONTACT FORM
          ================================================== */}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* ==================================================
                NAME + EMAIL
            ================================================== */}

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },

                gap: {
                  xs: 0.25,
                  sm: 1,
                },
              }}
            >
              {/* NAME */}

              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                autoComplete="name"
                required
                disabled={loading}
                margin="dense"
                size="small"
                sx={fieldStyle}
              />

              {/* EMAIL */}

              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                required
                disabled={loading}
                margin="dense"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email
                        sx={{
                          color: "#64748B",
                          fontSize: 18,
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={fieldStyle}
              />
            </Box>

            {/* ==================================================
                PHONE
            ================================================== */}

            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              autoComplete="tel"
              disabled={loading}
              margin="dense"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone
                      sx={{
                        color: "#64748B",
                        fontSize: 18,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                ...fieldStyle,

                mt: 0.5,
              }}
            />

            {/* ==================================================
                SUBJECT
            ================================================== */}

            <TextField
              fullWidth
              select
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              disabled={loading}
              margin="dense"
              size="small"
              sx={{
                ...fieldStyle,

                mt: 0.5,
              }}
            >
              <MenuItem value="">
                Select an issue
              </MenuItem>

              <MenuItem value="Login Issue">
                Login Issue
              </MenuItem>

              <MenuItem value="Account Issue">
                Account Issue
              </MenuItem>

              <MenuItem value="Attendance Issue">
                Attendance Issue
              </MenuItem>

              <MenuItem value="Technical Issue">
                Technical Issue
              </MenuItem>

              <MenuItem value="Other">
                Other
              </MenuItem>
            </TextField>

            {/* ==================================================
                MESSAGE
            ================================================== */}

            <TextField
              fullWidth
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Describe your issue or query..."
              required
              disabled={loading}
              multiline
              rows={3}
              margin="dense"
              size="small"
              sx={{
                ...fieldStyle,

                mt: 0.5,

                "& .MuiOutlinedInput-root": {
                  ...fieldStyle[
                    "& .MuiOutlinedInput-root"
                  ],

                  minHeight: 76,

                  alignItems: "flex-start",
                },
              }}
            />

            {/* ==================================================
                SUBMIT BUTTON
            ================================================== */}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress
                    size={17}
                    color="inherit"
                  />
                ) : (
                  <Send
                    sx={{
                      fontSize: 18,
                    }}
                  />
                )
              }
              sx={{
                mt: 1.25,

                minHeight: 44,

                borderRadius: 2,

                textTransform: "none",

                fontSize: {
                  xs: "0.82rem",
                  sm: "0.88rem",
                },

                fontWeight: 700,

                background:
                  "linear-gradient(135deg, #0F2747 0%, #164B73 100%)",

                boxShadow:
                  "0 6px 16px rgba(15,39,71,0.2)",

                "&:hover": {
                  background:
                    "linear-gradient(135deg, #163B63 0%, #0F766E 100%)",

                  boxShadow:
                    "0 8px 20px rgba(15,39,71,0.27)",

                  transform:
                    "translateY(-1px)",
                },

                "&:active": {
                  transform:
                    "translateY(0)",
                },
              }}
            >
              {loading
                ? "Sending..."
                : "Send Message"}
            </Button>
          </Box>

          {/* ==================================================
              SUPPORT INFORMATION
          ================================================== */}

          <Box
            sx={{
              mt: 1.25,

              p: {
                xs: 1,
                sm: 1.25,
              },

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              gap: 1,

              borderRadius: 1.5,

              background:
                "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",

              border:
                "1px solid #E2E8F0",
            }}
          >
            <SupportAgent
              sx={{
                color: "#0D9488",

                fontSize: {
                  xs: 20,
                  sm: 21,
                },
              }}
            />

            <Box>
              <Typography
                sx={{
                  color: "#334155",

                  fontSize: {
                    xs: "0.65rem",
                    sm: "0.68rem",
                  },

                  fontWeight: 600,

                  textAlign: "center",
                }}
              >
                StaffSync Support Team
              </Typography>

              <Typography
                sx={{
                  color: "#94A3B8",

                  fontSize: {
                    xs: "0.58rem",
                    sm: "0.62rem",
                  },

                  mt: 0.1,

                  textAlign: "center",
                }}
              >
                We will respond to your request as soon
                as possible.
              </Typography>
            </Box>
          </Box>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <Typography
            sx={{
              textAlign: "center",

              color: "#94A3B8",

              mt: 1,

              fontSize: {
                xs: "0.56rem",
                sm: "0.6rem",
              },
            }}
          >
            © {new Date().getFullYear()} StaffSync
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Contact;