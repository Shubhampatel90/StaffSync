import 'package:flutter/material.dart';

import '../services/api_service.dart';
import 'login_screen.dart';

class ProfileScreen extends StatefulWidget {
  final int employeeId;

  const ProfileScreen({
    super.key,
    required this.employeeId,
  });

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  // ============================================================
  // COLORS
  // ============================================================

  static const Color navy = Color(0xFF1E3A8A);
  static const Color blue = Color(0xFF2563EB);
  static const Color background = Color(0xFFF5F7FB);
  static const Color darkText = Color(0xFF1F2937);

  // ============================================================
  // EMPLOYEE DATA
  // ============================================================

  Map<String, dynamic>? employee;

  bool isLoading = true;
  String? errorMessage;

  // ============================================================
  // API BASE URL
  // ============================================================

  final String baseUrl = 'http://192.168.1.8:8080';

  // ============================================================
  // INIT
  // ============================================================

  @override
  void initState() {
    super.initState();

    loadEmployeeProfile();
  }

  // ============================================================
  // LOAD EMPLOYEE PROFILE
  // ============================================================

  Future<void> loadEmployeeProfile() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final result =
      await ApiService.getEmployeeProfile(widget.employeeId);

      if (!mounted) return;

      setState(() {
        employee = result;
        isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;

      setState(() {
        isLoading = false;
        errorMessage = e.toString();
      });
    }
  }

  // ============================================================
  // GET EMPLOYEE VALUE
  // ============================================================

  String getValue(String key) {
    final value = employee?[key];

    if (value == null ||
        value.toString().trim().isEmpty) {
      return 'Not available';
    }

    return value.toString();
  }

  // ============================================================
  // PROFILE IMAGE URL
  // ============================================================

  String get profileImageUrl {
    return '$baseUrl/api/employee/${widget.employeeId}/image';
  }

  // ============================================================
  // GET INITIALS
  // ============================================================

  String get initials {
    final name = getValue('fullName');

    if (name == 'Not available') {
      return 'E';
    }

    final parts = name
        .trim()
        .split(RegExp(r'\s+'));

    if (parts.length == 1) {
      return parts[0][0].toUpperCase();
    }

    return '${parts.first[0]}${parts.last[0]}'
        .toUpperCase();
  }

  // ============================================================
  // BUILD
  // ============================================================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: background,

      appBar: AppBar(
        title: const Text(
          'My Profile',
          style: TextStyle(
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: Colors.white,
        foregroundColor: darkText,
        elevation: 0,
      ),

      body: _buildBody(),
    );
  }

  // ============================================================
  // BODY
  // ============================================================

  Widget _buildBody() {
    if (isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          color: blue,
        ),
      );
    }

    if (errorMessage != null) {
      return _buildError();
    }

    if (employee == null) {
      return _buildError(
        message: 'Employee profile not found.',
      );
    }

    return RefreshIndicator(
      onRefresh: loadEmployeeProfile,
      color: blue,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _buildProfileHeader(),

            const SizedBox(height: 25),

            _buildBasicInformation(),

            const SizedBox(height: 15),

            _buildAddressInformation(),

            const SizedBox(height: 15),

            _buildPersonalInformation(),

            const SizedBox(height: 25),

            _buildLogoutButton(),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  // ============================================================
  // PROFILE HEADER
  // ============================================================

  Widget _buildProfileHeader() {
    return Column(
      children: [
        Stack(
          children: [
            CircleAvatar(
              radius: 55,
              backgroundColor: navy,

              child: ClipOval(
                child: Image.network(
                  profileImageUrl,

                  width: 110,
                  height: 110,

                  fit: BoxFit.cover,

                  errorBuilder:
                      (context, error, stackTrace) {
                    return Container(
                      width: 110,
                      height: 110,
                      color: navy,
                      alignment: Alignment.center,

                      child: Text(
                        initials,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            Positioned(
              bottom: 2,
              right: 2,
              child: Container(
                height: 30,
                width: 30,

                decoration: BoxDecoration(
                  color: Colors.green,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: background,
                    width: 3,
                  ),
                ),

                child: const Icon(
                  Icons.check,
                  color: Colors.white,
                  size: 17,
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: 15),

        Text(
          getValue('fullName'),
          textAlign: TextAlign.center,

          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: darkText,
          ),
        ),

        const SizedBox(height: 5),

        const Text(
          'Employee',
          style: TextStyle(
            color: Colors.grey,
            fontSize: 14,
          ),
        ),

        const SizedBox(height: 8),

        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: 12,
            vertical: 6,
          ),

          decoration: BoxDecoration(
            color: const Color(0xFFEFF6FF),
            borderRadius: BorderRadius.circular(20),
          ),

          child: Text(
            'Employee ID: ${widget.employeeId}',
            style: const TextStyle(
              color: blue,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }

  // ============================================================
  // BASIC INFORMATION
  // ============================================================

  Widget _buildBasicInformation() {
    return _buildSection(
      title: 'Basic Information',
      icon: Icons.person_outline,
      children: [
        profileItem(
          Icons.person_outline,
          'Full Name',
          getValue('fullName'),
        ),

        profileItem(
          Icons.email_outlined,
          'Email',
          getValue('email'),
        ),

        profileItem(
          Icons.phone_outlined,
          'Phone',
          getValue('phone'),
        ),

        profileItem(
          Icons.badge_outlined,
          'Employee ID',
          widget.employeeId.toString(),
        ),

        profileItem(
          Icons.credit_card_outlined,
          'Aadhaar / PAN',
          getValue('aadhaarOrPan'),
        ),
      ],
    );
  }

  // ============================================================
  // ADDRESS INFORMATION
  // ============================================================

  Widget _buildAddressInformation() {
    return _buildSection(
      title: 'Address',
      icon: Icons.location_on_outlined,
      children: [
        profileItem(
          Icons.home_outlined,
          'Current Address',
          getValue('currentAddress'),
        ),

        profileItem(
          Icons.location_city_outlined,
          'Permanent Address',
          getValue('permanentAddress'),
        ),
      ],
    );
  }

  // ============================================================
  // PERSONAL INFORMATION
  // ============================================================

  Widget _buildPersonalInformation() {
    return _buildSection(
      title: 'Personal Information',
      icon: Icons.info_outline,
      children: [
        profileItem(
          Icons.cake_outlined,
          'Birth Date',
          getValue('birthDate'),
        ),

        profileItem(
          Icons.favorite_border,
          'Marital Status',
          getValue('maritalStatus'),
        ),

        profileItem(
          Icons.person_outline,
          'Spouse Name',
          getValue('spouseName'),
        ),

        profileItem(
          Icons.business_outlined,
          'Spouse Employer',
          getValue('spouseEmployer'),
        ),

        profileItem(
          Icons.phone_outlined,
          'Spouse Work Phone',
          getValue('spouseWorkPhone'),
        ),
      ],
    );
  }

  // ============================================================
  // SECTION
  // ============================================================

  Widget _buildSection({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Container(
      width: double.infinity,

      padding: const EdgeInsets.all(16),

      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),

        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(
              alpha: 0.03,
            ),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),

      child: Column(
        crossAxisAlignment:
        CrossAxisAlignment.start,

        children: [
          Row(
            children: [
              Container(
                height: 38,
                width: 38,

                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius:
                  BorderRadius.circular(10),
                ),

                child: Icon(
                  icon,
                  color: blue,
                  size: 20,
                ),
              ),

              const SizedBox(width: 12),

              Text(
                title,
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                  color: darkText,
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          ...children,
        ],
      ),
    );
  }

  // ============================================================
  // PROFILE ITEM
  // ============================================================

  Widget profileItem(
      IconData icon,
      String title,
      String value,
      ) {
    return Container(
      width: double.infinity,

      margin: const EdgeInsets.only(
        bottom: 10,
      ),

      padding: const EdgeInsets.all(14),

      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(13),
      ),

      child: Row(
        crossAxisAlignment:
        CrossAxisAlignment.start,

        children: [
          Icon(
            icon,
            color: navy,
            size: 21,
          ),

          const SizedBox(width: 13),

          Expanded(
            child: Column(
              crossAxisAlignment:
              CrossAxisAlignment.start,

              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.grey,
                    fontSize: 11,
                  ),
                ),

                const SizedBox(height: 4),

                Text(
                  value,
                  style: const TextStyle(
                    color: darkText,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================
  // LOGOUT
  // ============================================================

  Widget _buildLogoutButton() {
    return SizedBox(
      width: double.infinity,
      height: 52,

      child: ElevatedButton.icon(
        onPressed: () {
          _showLogoutDialog(context);
        },

        icon: const Icon(
          Icons.logout,
        ),

        label: const Text(
          'Logout',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),

        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.red,
          foregroundColor: Colors.white,
          elevation: 0,

          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
      ),
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  Widget _buildError({
    String message =
    'Unable to load employee profile.',
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(30),

        child: Column(
          mainAxisAlignment:
          MainAxisAlignment.center,

          children: [
            const Icon(
              Icons.error_outline,
              color: Colors.red,
              size: 60,
            ),

            const SizedBox(height: 15),

            Text(
              message,
              textAlign: TextAlign.center,

              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),

            const SizedBox(height: 20),

            ElevatedButton.icon(
              onPressed: loadEmployeeProfile,

              icon: const Icon(
                Icons.refresh,
              ),

              label: const Text(
                'Retry',
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ================================================================
// LOGOUT DIALOG
// ================================================================

void _showLogoutDialog(BuildContext context) {
  showModalBottomSheet(
    context: context,

    backgroundColor: Colors.white,

    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(
        top: Radius.circular(25),
      ),
    ),

    builder: (sheetContext) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(
          24,
          20,
          24,
          30,
        ),

        child: Column(
          mainAxisSize: MainAxisSize.min,

          children: [
            // Handle
            Container(
              width: 45,
              height: 5,

              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius:
                BorderRadius.circular(10),
              ),
            ),

            const SizedBox(height: 25),

            // Logout Icon
            Container(
              width: 65,
              height: 65,

              decoration: BoxDecoration(
                color: Colors.red.shade50,
                shape: BoxShape.circle,
              ),

              child: Icon(
                Icons.logout_rounded,
                color: Colors.red.shade600,
                size: 32,
              ),
            ),

            const SizedBox(height: 18),

            const Text(
              'Logout from StaffSync?',
              style: TextStyle(
                fontSize: 21,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 8),

            const Text(
              'Are you sure you want to logout from your account?',
              textAlign: TextAlign.center,

              style: TextStyle(
                color: Colors.grey,
                fontSize: 14,
              ),
            ),

            const SizedBox(height: 25),

            // Logout Button
            SizedBox(
              width: double.infinity,
              height: 52,

              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(sheetContext);

                  Navigator.pushAndRemoveUntil(
                    context,

                    MaterialPageRoute(
                      builder: (context) =>
                      const LoginScreen(),
                    ),

                        (route) => false,
                  );
                },

                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                  elevation: 0,

                  shape: RoundedRectangleBorder(
                    borderRadius:
                    BorderRadius.circular(14),
                  ),
                ),

                child: const Text(
                  'Yes, Logout',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 10),

            // Cancel
            SizedBox(
              width: double.infinity,
              height: 52,

              child: TextButton(
                onPressed: () {
                  Navigator.pop(sheetContext);
                },

                child: const Text(
                  'Cancel',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ),
      );
    },
  );
}