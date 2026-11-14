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
  TextField,
  Typography,
} from "@mui/material";

import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  ContactSupport,
} from "@mui/icons-material";

import staffSyncLogo from "../assets/staffsync_logo.png";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          // IMPORTANT:
          // Allows browser to receive/store the Spring Security
          // session cookie (JSESSIONID).
          credentials: "include",

          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      const responseText = await response.text();

      let data = {};

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = responseText;
        }
      }

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data.message || "Invalid email or password."
        );
      }

      // ========================================================
      // VALIDATE LOGIN RESPONSE
      // ========================================================

      if (!data.id || !data.role) {
        throw new Error("Invalid login response from server.");
      }

      if (
        data.role !== "SUPER_ADMIN" &&
        data.role !== "ADMIN"
      ) {
        throw new Error("Invalid admin role.");
      }

      // ========================================================
      // SAVE ADMIN INFORMATION
      // ========================================================

      localStorage.setItem("adminId", String(data.id));
      localStorage.setItem(
        "adminName",
        data.fullName || ""
      );
      localStorage.setItem(
        "adminEmail",
        data.email || email.trim()
      );
      localStorage.setItem(
        "adminRole",
        data.role
      );

      // ========================================================
      // ROLE BASED REDIRECTION
      // ========================================================

      if (data.role === "SUPER_ADMIN") {
        navigate("/super-admin/dashboard", {
          replace: true,
        });
      } else if (data.role === "ADMIN") {
        navigate("/admin/dashboard", {
          replace: true,
        });
      }
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // PASSWORD TOGGLE
  // ============================================================

  const handleTogglePassword = () => {
    setShowPassword((previous) => !previous);
  };

  // ============================================================
  // CONTACT BUTTON
  // ============================================================

  const handleContact = () => {
    navigate("/contact");
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        minHeight: "100dvh",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        position: "relative",

        boxSizing: "border-box",

        overflowX: "hidden",
        overflowY: "auto",

        px: {
          xs: 1.5,
          sm: 2,
          md: 3,
        },

        py: {
          xs: 2,
          sm: 2.5,
          md: 3,
        },

        background:
          "linear-gradient(135deg, #081C33 0%, #0F2747 48%, #0D9488 100%)",

        "&::before": {
          content: '""',

          position: "fixed",

          width: {
            xs: 220,
            sm: 300,
            md: 400,
            lg: 480,
          },

          height: {
            xs: 220,
            sm: 300,
            md: 400,
            lg: 480,
          },

          borderRadius: "50%",

          background:
            "rgba(255,255,255,0.045)",

          top: {
            xs: -120,
            sm: -150,
            md: -180,
            lg: -220,
          },

          left: {
            xs: -120,
            sm: -150,
            md: -180,
            lg: -220,
          },

          pointerEvents: "none",
        },

        "&::after": {
          content: '""',

          position: "fixed",

          width: {
            xs: 200,
            sm: 280,
            md: 360,
            lg: 440,
          },

          height: {
            xs: 200,
            sm: 280,
            md: 360,
            lg: 440,
          },

          borderRadius: "50%",

          background:
            "rgba(255,255,255,0.04)",

          right: {
            xs: -110,
            sm: -140,
            md: -180,
            lg: -220,
          },

          bottom: {
            xs: -110,
            sm: -140,
            md: -180,
            lg: -220,
          },

          pointerEvents: "none",
        },
      }}
    >
      {/* ======================================================
          LOGIN CARD
      ====================================================== */}

      <Card
        elevation={0}
        sx={{
          position: "relative",

          zIndex: 2,

          width: "100%",

          maxWidth: {
            xs: "100%",
            sm: 410,
            md: 430,
            lg: 440,
          },

          boxSizing: "border-box",

          borderRadius: {
            xs: 3,
            sm: 3.5,
            md: 4,
          },

          backgroundColor:
            "rgba(255,255,255,0.98)",

          border:
            "1px solid rgba(255,255,255,0.7)",

          boxShadow:
            "0 25px 70px rgba(0,0,0,0.28)",

          overflow: "hidden",

          "@media (max-height: 700px)": {
            borderRadius: 3,
          },

          "@media (max-height: 600px)": {
            maxWidth: 400,
          },
        }}
      >
        <CardContent
          sx={{
            boxSizing: "border-box",

            p: {
              xs: 2.25,
              sm: 3,
              md: 3.5,
            },

            "&:last-child": {
              pb: {
                xs: 2.25,
                sm: 3,
                md: 3.5,
              },
            },

            "@media (max-height: 700px)": {
              p: {
                xs: 1.75,
                sm: 2.25,
                md: 2.75,
              },

              "&:last-child": {
                pb: {
                  xs: 1.75,
                  sm: 2.25,
                  md: 2.75,
                },
              },
            },
          }}
        >
          {/* ==================================================
              BRAND
          ================================================== */}

          <Box
            sx={{
              textAlign: "center",

              mb: {
                xs: 2,
                sm: 2.5,
                md: 2.75,
              },

              "@media (max-height: 700px)": {
                mb: 1.5,
              },
            }}
          >
            <Box
              component="img"
              src={staffSyncLogo}
              alt="StaffSync Logo"
              sx={{
                width: {
                  xs: 64,
                  sm: 72,
                  md: 78,
                },

                height: {
                  xs: 64,
                  sm: 72,
                  md: 78,
                },

                mx: "auto",

                mb: {
                  xs: 0.8,
                  sm: 1,
                  md: 1.1,
                },

                display: "block",

                objectFit: "contain",

                borderRadius: {
                  xs: "15px",
                  sm: "17px",
                  md: "18px",
                },

                boxShadow:
                  "0 7px 22px rgba(15,39,71,0.17)",

                "@media (max-height: 700px)": {
                  width: 58,
                  height: 58,
                  borderRadius: "14px",
                  mb: 0.7,
                },
              }}
            />

            <Typography
              component="h1"
              sx={{
                color: "#0F2747",

                fontWeight: 800,

                fontSize: {
                  xs: "1.65rem",
                  sm: "1.8rem",
                  md: "1.95rem",
                },

                lineHeight: 1.15,

                letterSpacing: "-0.6px",

                "@media (max-height: 700px)": {
                  fontSize: {
                    xs: "1.5rem",
                    sm: "1.65rem",
                  },
                },
              }}
            >
              StaffSync
            </Typography>

            <Typography
              sx={{
                color: "#64748B",

                fontSize: {
                  xs: "0.76rem",
                  sm: "0.8rem",
                  md: "0.83rem",
                },

                fontWeight: 500,

                mt: 0.35,
              }}
            >
              Administration Portal
            </Typography>
          </Box>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 1.25,

                borderRadius: 2,

                fontSize: {
                  xs: "0.75rem",
                  sm: "0.8rem",
                },

                alignItems: "center",

                py: 0.5,

                "& .MuiAlert-icon": {
                  fontSize: {
                    xs: 19,
                    sm: 20,
                  },
                },
              }}
            >
              {error}
            </Alert>
          )}

          {/* ==================================================
              LOGIN FORM
          ================================================== */}

          <Box
            component="form"
            onSubmit={handleLogin}
            noValidate
          >
            {/* EMAIL */}

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
              required
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email
                      sx={{
                        color: "#64748B",

                        fontSize: {
                          xs: 19,
                          sm: 20,
                        },
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,

                  backgroundColor: "#F8FAFC",

                  minHeight: {
                    xs: 50,
                    sm: 52,
                  },

                  transition:
                    "background-color 0.2s ease, box-shadow 0.2s ease",

                  "&:hover": {
                    backgroundColor: "#FFFFFF",
                  },

                  "&.Mui-focused": {
                    backgroundColor: "#FFFFFF",

                    boxShadow:
                      "0 0 0 3px rgba(37,99,235,0.08)",
                  },
                },

                "& .MuiInputLabel-root": {
                  fontSize: {
                    xs: "0.84rem",
                    sm: "0.9rem",
                  },
                },

                "& input": {
                  fontSize: {
                    xs: "0.88rem",
                    sm: "0.92rem",
                  },
                },
              }}
            />

            {/* PASSWORD */}

            <TextField
              fullWidth
              label="Password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
              required
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock
                      sx={{
                        color: "#64748B",

                        fontSize: {
                          xs: 19,
                          sm: 20,
                        },
                      }}
                    />
                  </InputAdornment>
                ),

                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      onClick={
                        handleTogglePassword
                      }
                      edge="end"
                      disabled={loading}
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      sx={{
                        p: {
                          xs: 0.7,
                          sm: 0.85,
                        },
                      }}
                    >
                      {showPassword ? (
                        <VisibilityOff
                          sx={{
                            fontSize: {
                              xs: 20,
                              sm: 21,
                            },
                          }}
                        />
                      ) : (
                        <Visibility
                          sx={{
                            fontSize: {
                              xs: 20,
                              sm: 21,
                            },
                          }}
                        />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mt: {
                  xs: 1,
                  sm: 1.15,
                },

                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,

                  backgroundColor: "#F8FAFC",

                  minHeight: {
                    xs: 50,
                    sm: 52,
                  },

                  transition:
                    "background-color 0.2s ease, box-shadow 0.2s ease",

                  "&:hover": {
                    backgroundColor: "#FFFFFF",
                  },

                  "&.Mui-focused": {
                    backgroundColor: "#FFFFFF",

                    boxShadow:
                      "0 0 0 3px rgba(37,99,235,0.08)",
                  },
                },

                "& .MuiInputLabel-root": {
                  fontSize: {
                    xs: "0.84rem",
                    sm: "0.9rem",
                  },
                },

                "& input": {
                  fontSize: {
                    xs: "0.88rem",
                    sm: "0.92rem",
                  },
                },
              }}
            />

            {/* ==================================================
                LOGIN BUTTON
            ================================================== */}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                mt: {
                  xs: 1.75,
                  sm: 2,
                },

                minHeight: {
                  xs: 47,
                  sm: 49,
                },

                borderRadius: 2,

                fontSize: {
                  xs: "0.9rem",
                  sm: "0.95rem",
                },

                fontWeight: 700,

                textTransform: "none",

                letterSpacing: "0.15px",

                background:
                  "linear-gradient(135deg, #0F2747 0%, #164B73 100%)",

                boxShadow:
                  "0 7px 18px rgba(15,39,71,0.2)",

                transition:
                  "all 0.2s ease",

                "&:hover": {
                  background:
                    "linear-gradient(135deg, #163B63 0%, #0F766E 100%)",

                  boxShadow:
                    "0 9px 22px rgba(15,39,71,0.25)",

                  transform:
                    "translateY(-1px)",
                },

                "&:active": {
                  transform:
                    "translateY(0)",
                },

                "&.Mui-disabled": {
                  background:
                    "#94A3B8",

                  color: "#FFFFFF",
                },
              }}
            >
              {loading ? (
                <CircularProgress
                  size={21}
                  color="inherit"
                />
              ) : (
                "Login"
              )}
            </Button>
          </Box>

          {/* ==================================================
              CONTACT BUTTON
          ================================================== */}

          <Button
            fullWidth
            type="button"
            variant="outlined"
            startIcon={
              <ContactSupport
                sx={{
                  fontSize: {
                    xs: 19,
                    sm: 20,
                  },
                }}
              />
            }
            onClick={handleContact}
            disabled={loading}
            sx={{
              mt: {
                xs: 1,
                sm: 1.15,
              },

              minHeight: {
                xs: 44,
                sm: 46,
              },

              borderRadius: 2,

              borderWidth: "1.5px",

              borderColor: "#CBD5E1",

              color: "#0F2747",

              backgroundColor: "#FFFFFF",

              fontSize: {
                xs: "0.86rem",
                sm: "0.9rem",
              },

              fontWeight: 650,

              textTransform: "none",

              transition:
                "all 0.2s ease",

              "&:hover": {
                borderWidth: "1.5px",

                borderColor: "#0D9488",

                backgroundColor:
                  "rgba(13,148,136,0.05)",

                color: "#0F766E",

                transform:
                  "translateY(-1px)",
              },

              "&:active": {
                transform:
                  "translateY(0)",
              },

              "&.Mui-disabled": {
                borderColor: "#E2E8F0",

                color: "#94A3B8",

                backgroundColor: "#F8FAFC",
              },
            }}
          >
            Contact Support
          </Button>

          {/* ==================================================
              ADMIN INFORMATION
          ================================================== */}

          <Box
            sx={{
              mt: {
                xs: 1.75,
                sm: 2,
                md: 2.25,
              },

              p: {
                xs: 1.2,
                sm: 1.35,
                md: 1.45,
              },

              borderRadius: 1.8,

              background:
                "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",

              border:
                "1px solid #E2E8F0",

              "@media (max-height: 700px)": {
                mt: 1.25,
                p: 1.1,
              },
            }}
          >
            <Typography
              sx={{
                display: "block",

                textAlign: "center",

                color: "#64748B",

                fontSize: {
                  xs: "0.65rem",
                  sm: "0.68rem",
                  md: "0.7rem",
                },

                fontWeight: 600,

                lineHeight: 1.4,
              }}
            >
              Authorized StaffSync administrators only
            </Typography>

            <Typography
              sx={{
                display: "block",

                textAlign: "center",

                color: "#94A3B8",

                mt: 0.25,

                fontSize: {
                  xs: "0.63rem",
                  sm: "0.66rem",
                  md: "0.68rem",
                },

                fontWeight: 500,
              }}
            >
              Super Admin • Admin
            </Typography>
          </Box>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <Typography
            sx={{
              display: "block",

              textAlign: "center",

              color: "#94A3B8",

              mt: {
                xs: 1.35,
                sm: 1.6,
                md: 1.8,
              },

              fontSize: {
                xs: "0.62rem",
                sm: "0.66rem",
                md: "0.68rem",
              },

              lineHeight: 1.3,
            }}
          >
            © {new Date().getFullYear()} StaffSync
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;