import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import 'package:staffsync_app/screens/admin/employee_model.dart';
import 'package:staffsync_app/services/employee_api_service.dart';

class AddEmployeeScreen extends StatefulWidget {
  const AddEmployeeScreen({super.key});

  @override
  State<AddEmployeeScreen> createState() => _AddEmployeeScreenState();
}

class _AddEmployeeScreenState extends State<AddEmployeeScreen> {
  // ============================================================
  // FORM / SERVICES
  // ============================================================

  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  final EmployeeApiService _apiService = EmployeeApiService();

  final ImagePicker _imagePicker = ImagePicker();

  // ============================================================
  // CONTROLLERS
  // ============================================================

  final TextEditingController _fullNameController =
  TextEditingController();

  final TextEditingController _currentAddressController =
  TextEditingController();

  final TextEditingController _permanentAddressController =
  TextEditingController();

  final TextEditingController _phoneController =
  TextEditingController();

  final TextEditingController _emailController =
  TextEditingController();

  // NEW: PASSWORD
  final TextEditingController _passwordController =
  TextEditingController();

  final TextEditingController _aadhaarOrPanController =
  TextEditingController();

  final TextEditingController _spouseNameController =
  TextEditingController();

  final TextEditingController _spouseEmployerController =
  TextEditingController();

  final TextEditingController _spouseWorkPhoneController =
  TextEditingController();

  // ============================================================
  // VARIABLES
  // ============================================================

  DateTime? _birthDate;

  String _maritalStatus = "Single";

  File? _profileImage;

  bool _isSaving = false;

  bool _obscurePassword = true;

  // ============================================================
  // DISPOSE
  // ============================================================

  @override
  void dispose() {
    _fullNameController.dispose();
    _currentAddressController.dispose();
    _permanentAddressController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _aadhaarOrPanController.dispose();
    _spouseNameController.dispose();
    _spouseEmployerController.dispose();
    _spouseWorkPhoneController.dispose();

    super.dispose();
  }

  // ============================================================
  // SELECT PROFILE IMAGE
  // ============================================================

  Future<void> _selectProfileImage() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 80,
        maxWidth: 800,
        maxHeight: 800,
      );

      if (image == null) {
        return;
      }

      if (!mounted) return;

      setState(() {
        _profileImage = File(image.path);
      });
    } catch (e) {
      if (!mounted) return;

      _showError(
        "Failed to select profile image:\n$e",
      );
    }
  }

  // ============================================================
  // SELECT BIRTH DATE
  // ============================================================

  Future<void> _selectBirthDate() async {
    final DateTime now = DateTime.now();

    final DateTime initialDate = _birthDate ??
        DateTime(
          now.year - 25,
          now.month,
          now.day,
        );

    final DateTime? selectedDate = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(1950),
      lastDate: now,
      helpText: "Select Birth Date",
    );

    if (selectedDate == null) {
      return;
    }

    if (!mounted) return;

    setState(() {
      _birthDate = selectedDate;
    });
  }

  // ============================================================
  // FORMAT BIRTH DATE
  // ============================================================

  String _formatBirthDate() {
    if (_birthDate == null) {
      return "Select birth date";
    }

    return "${_birthDate!.day.toString().padLeft(2, '0')}/"
        "${_birthDate!.month.toString().padLeft(2, '0')}/"
        "${_birthDate!.year}";
  }

  // ============================================================
  // SAVE EMPLOYEE
  // ============================================================

  Future<void> _saveEmployee() async {
    if (_isSaving) {
      return;
    }

    // ----------------------------------------------------------
    // VALIDATE FORM
    // ----------------------------------------------------------

    if (!_formKey.currentState!.validate()) {
      return;
    }

    // ----------------------------------------------------------
    // VALIDATE BIRTH DATE
    // ----------------------------------------------------------

    if (_birthDate == null) {
      _showError("Please select birth date.");
      return;
    }

    // ----------------------------------------------------------
    // MARRIED VALIDATION
    // ----------------------------------------------------------

    if (_maritalStatus == "Married") {
      if (_spouseNameController.text.trim().isEmpty) {
        _showError("Please enter spouse name.");
        return;
      }
    }

    // ----------------------------------------------------------
    // START SAVING
    // ----------------------------------------------------------

    setState(() {
      _isSaving = true;
    });

    try {
      // ========================================================
      // CREATE EMPLOYEE MODEL
      // ========================================================

      final Employee employee = Employee(
        fullName: _fullNameController.text.trim(),

        currentAddress:
        _currentAddressController.text.trim(),

        permanentAddress:
        _permanentAddressController.text.trim(),

        phone:
        _phoneController.text.trim(),

        email:
        _emailController.text.trim(),

        // NEW PASSWORD
        password:
        _passwordController.text,

        aadhaarOrPan:
        _aadhaarOrPanController.text.trim(),

        birthDate:
        _birthDate,

        maritalStatus:
        _maritalStatus,

        spouseName:
        _spouseNameController.text.trim(),

        spouseEmployer:
        _spouseEmployerController.text.trim(),

        spouseWorkPhone:
        _spouseWorkPhoneController.text.trim(),
      );

      // ========================================================
      // SEND EMPLOYEE + PASSWORD + IMAGE
      // ========================================================

      await _apiService.addEmployee(
        employee,
        _profileImage,
      );

      if (!mounted) return;

      // ========================================================
      // SUCCESS
      // ========================================================

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            "Employee added successfully",
          ),
          backgroundColor: Colors.green,
        ),
      );

      // Return true to EmployeeManagementScreen
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;

      setState(() {
        _isSaving = false;
      });

      _showError(
        "Failed to add employee:\n$e",
      );
    }
  }

  // ============================================================
  // COMMON TEXT FIELD
  // ============================================================

  Widget _textField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    int maxLines = 1,
    bool required = false,
    bool obscureText = false,
    Widget? suffixIcon,
    String? Function(String?)? validator,
  }) {
    final TextInputType effectiveKeyboardType =
    maxLines > 1
        ? TextInputType.multiline
        : keyboardType;

    return TextFormField(
      controller: controller,

      keyboardType: effectiveKeyboardType,

      maxLines: obscureText ? 1 : maxLines,

      obscureText: obscureText,

      textInputAction:
      maxLines > 1
          ? TextInputAction.newline
          : TextInputAction.next,

      decoration: InputDecoration(
        labelText:
        required
            ? "$label *"
            : label,

        border: OutlineInputBorder(
          borderRadius:
          BorderRadius.circular(10),
        ),

        enabledBorder: OutlineInputBorder(
          borderRadius:
          BorderRadius.circular(10),

          borderSide: BorderSide(
            color:
            Colors.grey.shade400,
          ),
        ),

        focusedBorder: OutlineInputBorder(
          borderRadius:
          BorderRadius.circular(10),

          borderSide:
          const BorderSide(
            color:
            Color(0xFF0C2340),
            width: 2,
          ),
        ),

        prefixIcon:
        Icon(icon),

        suffixIcon:
        suffixIcon,
      ),

      validator:
      validator ??
          (required
              ? (value) {
            if (value == null ||
                value.trim().isEmpty) {
              return "$label is required";
            }

            return null;
          }
              : null),
    );
  }

  // ============================================================
  // PROFILE IMAGE
  // ============================================================

  Widget _profileImageSection() {
    return Center(
      child: Column(
        children: [
          GestureDetector(
            onTap:
            _isSaving
                ? null
                : _selectProfileImage,

            child: Container(
              width: 125,
              height: 125,

              decoration: BoxDecoration(
                shape:
                BoxShape.circle,

                color:
                Colors.grey.shade100,

                border: Border.all(
                  color:
                  Colors.grey.shade300,
                  width: 2,
                ),
              ),

              child: ClipOval(
                child:
                _profileImage != null
                    ? Image.file(
                  _profileImage!,
                  width: 125,
                  height: 125,
                  fit: BoxFit.cover,
                )
                    : Icon(
                  Icons.person,
                  size: 65,
                  color:
                  Colors.grey.shade500,
                ),
              ),
            ),
          ),

          const SizedBox(
            height: 12,
          ),

          OutlinedButton.icon(
            onPressed:
            _isSaving
                ? null
                : _selectProfileImage,

            icon: const Icon(
              Icons.camera_alt_outlined,
            ),

            label: const Text(
              "Select Profile Photo",
            ),
          ),

          if (_profileImage != null) ...[
            const SizedBox(height: 5),

            const Text(
              "Photo selected",
              style: TextStyle(
                color: Colors.green,
                fontWeight:
                FontWeight.w600,
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ============================================================
  // SECTION TITLE
  // ============================================================

  Widget _sectionTitle(
      String title) {
    return Text(
      title,

      style: const TextStyle(
        fontSize: 20,
        fontWeight:
        FontWeight.bold,
        color:
        Color(0xFF0C2340),
      ),
    );
  }

  // ============================================================
  // ERROR DIALOG
  // ============================================================

  void _showError(
      String message) {
    showDialog(
      context: context,

      builder:
          (dialogContext) {
        return AlertDialog(
          title: const Row(
            children: [
              Icon(
                Icons.error_outline,
                color: Colors.red,
              ),

              SizedBox(width: 8),

              Text("Error"),
            ],
          ),

          content:
          Text(message),

          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(
                  dialogContext,
                );
              },

              child:
              const Text("OK"),
            ),
          ],
        );
      },
    );
  }

  // ============================================================
  // BUILD
  // ============================================================

  @override
  Widget build(
      BuildContext context) {
    return Scaffold(
      backgroundColor:
      const Color(0xFFF8F9FC),

      // ========================================================
      // APP BAR
      // ========================================================

      appBar: AppBar(
        title: const Text(
          "Add Employee",
        ),

        backgroundColor:
        const Color(0xFFF8F9FC),

        foregroundColor:
        Colors.black,

        elevation: 0,
      ),

      // ========================================================
      // BODY
      // ========================================================

      body: SafeArea(
        child: Form(
          key: _formKey,

          child:
          SingleChildScrollView(
            padding:
            const EdgeInsets.all(20),

            child: Column(
              crossAxisAlignment:
              CrossAxisAlignment
                  .stretch,

              children: [

                // ==================================================
                // PROFILE PHOTO
                // ==================================================

                _profileImageSection(),

                const SizedBox(
                    height: 30),

                // ==================================================
                // PERSONAL INFORMATION
                // ==================================================

                _sectionTitle(
                  "Personal Information",
                ),

                const SizedBox(
                    height: 20),

                // FULL NAME
                _textField(
                  controller:
                  _fullNameController,

                  label:
                  "Full Name",

                  icon:
                  Icons.person_outline,

                  required: true,
                ),

                const SizedBox(
                    height: 16),

                // EMAIL
                _textField(
                  controller:
                  _emailController,

                  label:
                  "Email",

                  icon:
                  Icons.email_outlined,

                  keyboardType:
                  TextInputType
                      .emailAddress,

                  required: true,

                  validator: (value) {
                    if (value == null ||
                        value
                            .trim()
                            .isEmpty) {
                      return "Email is required";
                    }

                    final emailRegex =
                    RegExp(
                      r'^[^@\s]+@[^@\s]+\.[^@\s]+$',
                    );

                    if (!emailRegex
                        .hasMatch(
                      value.trim(),
                    )) {
                      return "Enter a valid email";
                    }

                    return null;
                  },
                ),

                const SizedBox(
                    height: 16),

                // ==================================================
                // PASSWORD
                // ==================================================

                _textField(
                  controller:
                  _passwordController,

                  label:
                  "Password",

                  icon:
                  Icons.lock_outline,

                  keyboardType:
                  TextInputType
                      .visiblePassword,

                  obscureText:
                  _obscurePassword,

                  required: true,

                  suffixIcon:
                  IconButton(
                    icon: Icon(
                      _obscurePassword
                          ? Icons
                          .visibility_outlined
                          : Icons
                          .visibility_off_outlined,
                    ),

                    onPressed: () {
                      setState(() {
                        _obscurePassword =
                        !_obscurePassword;
                      });
                    },
                  ),

                  validator: (value) {
                    if (value == null ||
                        value.isEmpty) {
                      return "Password is required";
                    }

                    if (value.length < 6) {
                      return "Password must be at least 6 characters";
                    }

                    return null;
                  },
                ),

                const SizedBox(
                    height: 8),

                const Text(
                  "Password will be used by the employee to log in.",
                  style: TextStyle(
                    color: Colors.grey,
                    fontSize: 13,
                  ),
                ),

                const SizedBox(
                    height: 16),

                // PHONE
                _textField(
                  controller:
                  _phoneController,

                  label:
                  "Phone",

                  icon:
                  Icons.phone_outlined,

                  keyboardType:
                  TextInputType.phone,

                  required: true,

                  validator: (value) {
                    if (value == null ||
                        value
                            .trim()
                            .isEmpty) {
                      return "Phone is required";
                    }

                    final phone =
                    value.trim();

                    if (!RegExp(
                      r'^[0-9]{10}$',
                    ).hasMatch(phone)) {
                      return "Enter a valid 10-digit phone";
                    }

                    return null;
                  },
                ),

                const SizedBox(
                    height: 16),

                // AADHAAR / PAN
                _textField(
                  controller:
                  _aadhaarOrPanController,

                  label:
                  "Aadhaar / PAN",

                  icon:
                  Icons.badge_outlined,

                  required: true,
                ),

                const SizedBox(
                    height: 16),

                // ==================================================
                // BIRTH DATE
                // ==================================================

                FormField<DateTime>(
                  validator: (value) {
                    if (_birthDate ==
                        null) {
                      return "Birth date is required";
                    }

                    return null;
                  },

                  builder:
                      (field) {
                    return InkWell(
                      onTap:
                      _isSaving
                          ? null
                          : () async {
                        await _selectBirthDate();

                        field.didChange(
                          _birthDate,
                        );
                      },

                      borderRadius:
                      BorderRadius
                          .circular(
                        10,
                      ),

                      child:
                      InputDecorator(
                        decoration:
                        InputDecoration(
                          labelText:
                          "Birth Date *",

                          border:
                          OutlineInputBorder(
                            borderRadius:
                            BorderRadius
                                .circular(
                              10,
                            ),
                          ),

                          prefixIcon:
                          const Icon(
                            Icons
                                .calendar_today_outlined,
                          ),

                          errorText:
                          field
                              .errorText,
                        ),

                        child: Text(
                          _formatBirthDate(),

                          style:
                          TextStyle(
                            color:
                            _birthDate ==
                                null
                                ? Colors
                                .grey
                                : Colors
                                .black,
                          ),
                        ),
                      ),
                    );
                  },
                ),

                const SizedBox(
                    height: 16),

                // ==================================================
                // MARITAL STATUS
                // ==================================================

                DropdownButtonFormField<
                    String>(
                  initialValue:
                  _maritalStatus,

                  decoration:
                  InputDecoration(
                    labelText:
                    "Marital Status",

                    border:
                    OutlineInputBorder(
                      borderRadius:
                      BorderRadius
                          .circular(
                        10,
                      ),
                    ),

                    prefixIcon:
                    const Icon(
                      Icons
                          .family_restroom,
                    ),
                  ),

                  items: const [
                    DropdownMenuItem(
                      value:
                      "Single",
                      child:
                      Text("Single"),
                    ),

                    DropdownMenuItem(
                      value:
                      "Married",
                      child:
                      Text("Married"),
                    ),

                    DropdownMenuItem(
                      value:
                      "Divorced",
                      child:
                      Text("Divorced"),
                    ),

                    DropdownMenuItem(
                      value:
                      "Widowed",
                      child:
                      Text("Widowed"),
                    ),
                  ],

                  onChanged:
                  _isSaving
                      ? null
                      : (value) {
                    if (value ==
                        null) {
                      return;
                    }

                    setState(
                          () {
                        _maritalStatus =
                            value;
                      },
                    );
                  },
                ),

                const SizedBox(
                    height: 30),

                // ==================================================
                // ADDRESS INFORMATION
                // ==================================================

                _sectionTitle(
                  "Address Information",
                ),

                const SizedBox(
                    height: 20),

                // CURRENT ADDRESS
                _textField(
                  controller:
                  _currentAddressController,

                  label:
                  "Current Address",

                  icon:
                  Icons.home_outlined,

                  maxLines: 3,

                  required: true,
                ),

                const SizedBox(
                    height: 16),

                // PERMANENT ADDRESS
                _textField(
                  controller:
                  _permanentAddressController,

                  label:
                  "Permanent Address",

                  icon:
                  Icons
                      .location_on_outlined,

                  maxLines: 3,

                  required: true,
                ),

                const SizedBox(
                    height: 30),

                // ==================================================
                // SPOUSE INFORMATION
                // ==================================================

                _sectionTitle(
                  "Spouse Information",
                ),

                const SizedBox(
                    height: 8),

                Text(
                  _maritalStatus ==
                      "Married"
                      ? "Spouse name is required for married employees."
                      : "Optional information",

                  style: TextStyle(
                    color:
                    Colors.grey
                        .shade600,

                    fontSize: 13,
                  ),
                ),

                const SizedBox(
                    height: 20),

                // SPOUSE NAME
                _textField(
                  controller:
                  _spouseNameController,

                  label:
                  "Spouse Name",

                  icon:
                  Icons
                      .person_outline,

                  required:
                  _maritalStatus ==
                      "Married",
                ),

                const SizedBox(
                    height: 16),

                // SPOUSE EMPLOYER
                _textField(
                  controller:
                  _spouseEmployerController,

                  label:
                  "Spouse Employer",

                  icon:
                  Icons
                      .business_outlined,
                ),

                const SizedBox(
                    height: 16),

                // SPOUSE WORK PHONE
                _textField(
                  controller:
                  _spouseWorkPhoneController,

                  label:
                  "Spouse Work Phone",

                  icon:
                  Icons
                      .phone_in_talk_outlined,

                  keyboardType:
                  TextInputType.phone,
                ),

                const SizedBox(
                    height: 35),

                // ==================================================
                // ADD EMPLOYEE BUTTON
                // ==================================================

                SizedBox(
                  height: 54,

                  child:
                  ElevatedButton.icon(
                    onPressed:
                    _isSaving
                        ? null
                        : _saveEmployee,

                    style:
                    ElevatedButton
                        .styleFrom(
                      backgroundColor:
                      const Color(
                        0xFF0C2340,
                      ),

                      foregroundColor:
                      Colors.white,

                      disabledBackgroundColor:
                      Colors.grey
                          .shade400,

                      shape:
                      RoundedRectangleBorder(
                        borderRadius:
                        BorderRadius
                            .circular(
                          10,
                        ),
                      ),
                    ),

                    icon:
                    _isSaving
                        ? const SizedBox(
                      width: 20,
                      height: 20,

                      child:
                      CircularProgressIndicator(
                        strokeWidth:
                        2,

                        color:
                        Colors
                            .white,
                      ),
                    )
                        : const Icon(
                      Icons
                          .person_add_outlined,
                    ),

                    label: Text(
                      _isSaving
                          ? "Adding Employee..."
                          : "Add Employee",

                      style:
                      const TextStyle(
                        fontSize: 16,
                        fontWeight:
                        FontWeight
                            .bold,
                      ),
                    ),
                  ),
                ),

                const SizedBox(
                    height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}