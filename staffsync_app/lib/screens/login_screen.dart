import 'package:flutter/material.dart';

import 'package:staffsync_app/screens/home_screen.dart';
import '../services/api_service.dart';
import 'admin/admin_home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // ============================================================
  // CONTROLLERS
  // ============================================================

  final TextEditingController emailController = TextEditingController();

  final TextEditingController passwordController = TextEditingController();

  // ============================================================
  // STATE
  // ============================================================

  bool obscurePassword = true;
  bool isLoading = false;

  // ============================================================
  // LOGIN
  // ============================================================

  Future<void> login() async {
    final email = emailController.text.trim();
    final password = passwordController.text.trim();

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter email and password'),
          backgroundColor: Colors.red,
        ),
      );

      return;
    }

    // ----------------------------------------------------------
    // START LOADING
    // ----------------------------------------------------------

    setState(() {
      isLoading = true;
    });

    try {
      // ========================================================
      // CALL LOGIN API
      // ========================================================

      final Map<String, dynamic> result = await ApiService.login(
        email,
        password,
      );

      if (!mounted) return;

      // ========================================================
      // GET ROLE
      // ========================================================

      final String role = result['role']?.toString().toUpperCase() ?? 'INVALID';

      // ========================================================
      // ADMIN LOGIN
      // ========================================================

      if (role == 'ADMIN') {
        setState(() {
          isLoading = false;
        });

        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const AdminHomeScreen()),
        );

        return;
      }

      // ========================================================
      // EMPLOYEE LOGIN
      // ========================================================

      if (role == 'EMPLOYEE') {
        final dynamic employeeIdValue = result['employeeId'];

        // ------------------------------------------------------
        // CHECK EMPLOYEE ID
        // ------------------------------------------------------

        if (employeeIdValue == null) {
          setState(() {
            isLoading = false;
          });

          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Employee ID was not returned by server'),
              backgroundColor: Colors.red,
            ),
          );

          return;
        }

        // ------------------------------------------------------
        // CONVERT EMPLOYEE ID TO INT
        // ------------------------------------------------------

        final int? employeeId = int.tryParse(employeeIdValue.toString());

        if (employeeId == null) {
          setState(() {
            isLoading = false;
          });

          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Invalid employee ID received from server'),
              backgroundColor: Colors.red,
            ),
          );

          return;
        }

        // ------------------------------------------------------
        // STOP LOADING
        // ------------------------------------------------------

        setState(() {
          isLoading = false;
        });

        // ------------------------------------------------------
        // OPEN HOME PAGE
        // ------------------------------------------------------

        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => HomePage(employeeId: employeeId)),
        );

        return;
      }

      // ========================================================
      // INVALID LOGIN
      // ========================================================

      if (role == 'INVALID') {
        setState(() {
          isLoading = false;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Invalid email or password'),
            backgroundColor: Colors.red,
          ),
        );

        return;
      }

      // ========================================================
      // UNKNOWN RESPONSE
      // ========================================================

      setState(() {
        isLoading = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Unexpected login response: $result'),
          backgroundColor: Colors.orange,
        ),
      );
    } catch (e) {
      if (!mounted) return;

      setState(() {
        isLoading = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Unable to connect to server: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  // ============================================================
  // DISPOSE
  // ============================================================

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  // ============================================================
  // BUILD
  // ============================================================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(25),

          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,

            children: [
              const SizedBox(height: 50),

              // ==================================================
              // STAFFSYNC LOGO
              // ==================================================
              Center(
                child: Container(
                  height: 100,
                  width: 100,

                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(25),

                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.08),
                        blurRadius: 15,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),

                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(25),

                    child: Image.asset(
                      'assets/images/staffsync_logo.png',

                      width: 80,
                      height: 80,

                      fit: BoxFit.contain,

                      errorBuilder: (context, error, stackTrace) {
                        return const Icon(
                          Icons.business,
                          color: Color(0xFF0F2747),
                          size: 50,
                        );
                      },
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 25),

              // ==================================================
              // APP NAME
              // ==================================================
              const Center(
                child: Text(
                  'Welcome to StaffSync',

                  style: TextStyle(
                    fontSize: 27,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0F2747),
                  ),
                ),
              ),

              const SizedBox(height: 8),

              const Center(
                child: Text(
                  'Login to manage your attendance',

                  style: TextStyle(color: Colors.grey, fontSize: 14),
                ),
              ),

              const SizedBox(height: 45),

              // ==================================================
              // EMAIL LABEL
              // ==================================================
              const Text(
                'Email',

                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: Color(0xFF1F2937),
                ),
              ),

              const SizedBox(height: 8),

              // ==================================================
              // EMAIL FIELD
              // ==================================================
              TextField(
                controller: emailController,

                keyboardType: TextInputType.emailAddress,

                enabled: !isLoading,

                decoration: InputDecoration(
                  hintText: 'Enter your email',

                  hintStyle: const TextStyle(color: Colors.grey, fontSize: 14),

                  prefixIcon: const Icon(
                    Icons.email_outlined,
                    color: Color(0xFF0F2747),
                  ),

                  filled: true,
                  fillColor: Colors.white,

                  contentPadding: const EdgeInsets.symmetric(
                    vertical: 17,
                    horizontal: 15,
                  ),

                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(15),

                    borderSide: BorderSide(color: Colors.grey.shade200),
                  ),

                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(15),

                    borderSide: const BorderSide(
                      color: Color(0xFF0D9488),
                      width: 1.5,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // ==================================================
              // PASSWORD LABEL
              // ==================================================
              const Text(
                'Password',

                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: Color(0xFF1F2937),
                ),
              ),

              const SizedBox(height: 8),

              // ==================================================
              // PASSWORD FIELD
              // ==================================================
              TextField(
                controller: passwordController,

                obscureText: obscurePassword,

                enabled: !isLoading,

                decoration: InputDecoration(
                  hintText: 'Enter your password',

                  hintStyle: const TextStyle(color: Colors.grey, fontSize: 14),

                  prefixIcon: const Icon(
                    Icons.lock_outline,
                    color: Color(0xFF0F2747),
                  ),

                  suffixIcon: IconButton(
                    onPressed: isLoading
                        ? null
                        : () {
                            setState(() {
                              obscurePassword = !obscurePassword;
                            });
                          },

                    icon: Icon(
                      obscurePassword
                          ? Icons.visibility_outlined
                          : Icons.visibility_off_outlined,

                      color: Colors.grey,
                    ),
                  ),

                  filled: true,
                  fillColor: Colors.white,

                  contentPadding: const EdgeInsets.symmetric(
                    vertical: 17,
                    horizontal: 15,
                  ),

                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(15),

                    borderSide: BorderSide(color: Colors.grey.shade200),
                  ),

                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(15),

                    borderSide: const BorderSide(
                      color: Color(0xFF0D9488),
                      width: 1.5,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 12),

              // ==================================================
              // FORGOT PASSWORD
              // ==================================================
              Align(
                alignment: Alignment.centerRight,

                child: TextButton(
                  onPressed: isLoading
                      ? null
                      : () {
                          // Add forgot password
                          // functionality here.
                        },

                  child: const Text(
                    'Forgot Password?',

                    style: TextStyle(
                      color: Color(0xFF2563EB),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 18),

              // ==================================================
              // LOGIN BUTTON
              // ==================================================
              SizedBox(
                width: double.infinity,
                height: 55,

                child: ElevatedButton(
                  onPressed: isLoading ? null : login,

                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F2747),

                    foregroundColor: Colors.white,

                    disabledBackgroundColor: Colors.grey.shade400,

                    elevation: 3,

                    shadowColor: Colors.black26,

                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                  ),

                  child: isLoading
                      ? const SizedBox(
                          height: 24,
                          width: 24,

                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            color: Colors.white,
                          ),
                        )
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,

                          children: [
                            Text(
                              'Login',

                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),

                            SizedBox(width: 10),

                            Icon(Icons.arrow_forward_rounded, size: 20),
                          ],
                        ),
                ),
              ),

              const SizedBox(height: 40),

              // ==================================================
              // FOOTER
              // ==================================================
              Center(
                child: Column(
                  children: [
                    const Text(
                      'StaffSync',

                      style: TextStyle(
                        color: Color(0xFF0F2747),
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),

                    const SizedBox(height: 5),

                    Text(
                      'Employee Attendance Management',

                      style: TextStyle(
                        color: Colors.grey.shade500,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
