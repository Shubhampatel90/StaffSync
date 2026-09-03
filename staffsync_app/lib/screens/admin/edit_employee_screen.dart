import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import 'package:staffsync_app/screens/admin/employee_model.dart';
import 'package:staffsync_app/services/employee_api_service.dart';

class EditEmployeeScreen extends StatefulWidget {
  final Employee employee;

  const EditEmployeeScreen({
    super.key,
    required this.employee,
  });

  @override
  State<EditEmployeeScreen> createState() => _EditEmployeeScreenState();
}

class _EditEmployeeScreenState extends State<EditEmployeeScreen> {
  // ============================================================
  // SERVICES
  // ============================================================

  final EmployeeApiService _apiService = EmployeeApiService();

  final ImagePicker _imagePicker = ImagePicker();

  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  // ============================================================
  // CONTROLLERS
  // ============================================================

  late final TextEditingController _nameController;
  late final TextEditingController _emailController;
  late final TextEditingController _phoneController;
  late final TextEditingController _passwordController;
  late final TextEditingController _aadhaarController;
  late final TextEditingController _currentAddressController;
  late final TextEditingController _permanentAddressController;
  late final TextEditingController _spouseNameController;
  late final TextEditingController _spouseEmployerController;
  late final TextEditingController _spouseWorkPhoneController;

  // ============================================================
  // VARIABLES
  // ============================================================

  DateTime? _birthDate;

  String _maritalStatus = "Single";

  bool _isSaving = false;

  bool _obscurePassword = true;

  File? _profileImage;

  // ============================================================
  // INIT
  // ============================================================

  @override
  void initState() {
    super.initState();

    _nameController = TextEditingController(
      text: widget.employee.fullName,
    );

    _emailController = TextEditingController(
      text: widget.employee.email,
    );

    _phoneController = TextEditingController(
      text: widget.employee.phone,
    );

    _passwordController = TextEditingController(
      text: widget.employee.password ?? '',
    );

    _aadhaarController = TextEditingController(
      text: widget.employee.aadhaarOrPan,
    );

    _currentAddressController = TextEditingController(
      text: widget.employee.currentAddress,
    );

    _permanentAddressController = TextEditingController(
      text: widget.employee.permanentAddress,
    );

    _spouseNameController = TextEditingController(
      text: widget.employee.spouseName,
    );

    _spouseEmployerController = TextEditingController(
      text: widget.employee.spouseEmployer,
    );

    _spouseWorkPhoneController = TextEditingController(
      text: widget.employee.spouseWorkPhone,
    );

    _birthDate = widget.employee.birthDate;

    _maritalStatus = widget.employee.maritalStatus.isNotEmpty
        ? widget.employee.maritalStatus
        : "Single";

    const validStatuses = [
      "Single",
      "Married",
      "Divorced",
      "Widowed",
    ];

    if (!validStatuses.contains(_maritalStatus)) {
      _maritalStatus = "Single";
    }
  }

  // ============================================================
  // DISPOSE
  // ============================================================

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _aadhaarController.dispose();
    _currentAddressController.dispose();
    _permanentAddressController.dispose();
    _spouseNameController.dispose();
    _spouseEmployerController.dispose();
    _spouseWorkPhoneController.dispose();

    super.dispose();
  }

  // ============================================================
  // SELECT PROFILE IMAGE
  // ============================================================

  Future<void> _selectProfileImage() async {
    if (_isSaving) {
      return;
    }

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

      if (!mounted) {
        return;
      }

      setState(() {
        _profileImage = File(image.path);
      });
    } catch (e) {
      if (!mounted) {
        return;
      }

      _showMessage(
        "Failed to select profile photo:\n$e",
      );
    }
  }

  // ============================================================
  // SELECT BIRTH DATE
  // ============================================================

  Future<void> _selectBirthDate() async {
    final DateTime now = DateTime.now();

    DateTime initialDate =
        _birthDate ?? DateTime(now.year - 25);

    if (initialDate.isAfter(now)) {
      initialDate = now;
    }

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

    if (!mounted) {
      return;
    }

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
  // COMMON TEXT FIELD
  // ============================================================

  Widget _textField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    int maxLines = 1,
    bool required = false,
    String? Function(String?)? validator,
    bool obscureText = false,
    Widget? suffixIcon,
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
      enabled: !_isSaving,

      textInputAction:
      maxLines > 1
          ? TextInputAction.newline
          : TextInputAction.next,

      decoration: InputDecoration(
        labelText: required ? "$label *" : label,

        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
        ),

        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(
            color: Colors.grey.shade400,
          ),
        ),

        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(
            color: Color(0xFF0C2340),
            width: 2,
          ),
        ),

        prefixIcon: Icon(icon),

        suffixIcon: suffixIcon,
      ),

      validator: validator ??
          (required
              ? (String? value) {
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
  // PASSWORD VALIDATION
  // ============================================================

  String? _validatePassword(String? value) {
    if (value == null ||
        value.trim().isEmpty) {
      return "Password is required";
    }

    if (value.trim().length < 6) {
      return "Password must contain at least 6 characters";
    }

    return null;
  }

  // ============================================================
  // PROFILE IMAGE
  // ============================================================

  Widget build_profileImage() {
    final String name =
    _nameController.text.trim();

    final String firstLetter =
    name.isNotEmpty
        ? name[0].toUpperCase()
        : "?";

    // ----------------------------------------------------------
    // NEW IMAGE SELECTED
    // ----------------------------------------------------------

    if (_profileImage != null) {
      return CircleAvatar(
        radius: 60,
        backgroundColor: Colors.blue.shade100,

        child: ClipOval(
          child: Image.file(
            _profileImage!,
            width: 120,
            height: 120,
            fit: BoxFit.cover,
          ),
        ),
      );
    }

    // ----------------------------------------------------------
    // EXISTING SERVER IMAGE
    // ----------------------------------------------------------

    final String imageUrl =
        widget.employee.profileImageUrl;

    if (imageUrl.isEmpty) {
      return _defaultProfileImage(
        firstLetter,
      );
    }

    return CircleAvatar(
      radius: 60,
      backgroundColor: Colors.blue.shade100,

      child: ClipOval(
        child: Image.network(
          imageUrl,
          width: 120,
          height: 120,
          fit: BoxFit.cover,

          loadingBuilder: (
              BuildContext context,
              Widget child,
              ImageChunkEvent? loadingProgress,
              ) {
            if (loadingProgress == null) {
              return child;
            }

            return const SizedBox(
              width: 120,
              height: 120,
              child: Center(
                child: SizedBox(
                  width: 25,
                  height: 25,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                  ),
                ),
              ),
            );
          },

          errorBuilder: (
              BuildContext context,
              Object error,
              StackTrace? stackTrace,
              ) {
            return _defaultProfileImage(
              firstLetter,
            );
          },
        ),
      ),
    );
  }

  // ============================================================
  // DEFAULT PROFILE IMAGE
  // ============================================================

  Widget _defaultProfileImage(
      String firstLetter,
      ) {
    return CircleAvatar(
      radius: 60,
      backgroundColor: Colors.blue.shade100,

      child: Text(
        firstLetter,

        style: TextStyle(
          fontSize: 42,
          fontWeight: FontWeight.bold,
          color: Colors.blue.shade700,
        ),
      ),
    );
  }

  // ============================================================
  // UPDATE EMPLOYEE
  // ============================================================

  Future<void> _updateEmployee() async {
    if (_isSaving) {
      return;
    }

    // ----------------------------------------------------------
    // CHECK EMPLOYEE ID
    // ----------------------------------------------------------

    final int? employeeId =
        widget.employee.id;

    if (employeeId == null) {
      _showMessage(
        "Employee ID is missing.",
      );
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
      _showMessage(
        "Please select birth date.",
      );
      return;
    }

    // ----------------------------------------------------------
    // VALIDATE SPOUSE
    // ----------------------------------------------------------

    if (_maritalStatus == "Married" &&
        _spouseNameController.text
            .trim()
            .isEmpty) {
      _showMessage(
        "Please enter spouse name.",
      );
      return;
    }

    // ----------------------------------------------------------
    // START SAVING
    // ----------------------------------------------------------

    setState(() {
      _isSaving = true;
    });

    try {
      // ========================================================
      // CREATE UPDATED EMPLOYEE
      // ========================================================

      final Employee updatedEmployee =
      Employee(
        id: employeeId,

        fullName:
        _nameController.text.trim(),

        currentAddress:
        _currentAddressController
            .text
            .trim(),

        permanentAddress:
        _permanentAddressController
            .text
            .trim(),

        phone:
        _phoneController.text.trim(),

        email:
        _emailController.text.trim(),

        password:
        _passwordController.text.trim(),

        aadhaarOrPan:
        _aadhaarController.text.trim(),

        birthDate:
        _birthDate,

        maritalStatus:
        _maritalStatus,

        spouseName:
        _spouseNameController
            .text
            .trim(),

        spouseEmployer:
        _spouseEmployerController
            .text
            .trim(),

        spouseWorkPhone:
        _spouseWorkPhoneController
            .text
            .trim(),
      );

      // ========================================================
      // UPDATE EMPLOYEE
      //
      // IMPORTANT:
      // EmployeeApiService currently expects:
      //
      // updateEmployee(int id, Employee employee)
      //
      // ========================================================

      final bool success =
      await _apiService.updateEmployee(
        updatedEmployee,
        _profileImage,
      );

      if (!mounted) {
        return;
      }

      if (!success) {
        throw Exception(
          "Employee update failed.",
        );
      }

      // ========================================================
      // SUCCESS
      // ========================================================

      ScaffoldMessenger.of(context)
          .showSnackBar(
        const SnackBar(
          content: Text(
            "Employee updated successfully",
          ),
          backgroundColor: Colors.green,
        ),
      );

      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) {
        return;
      }

      _showMessage(
        "Failed to update employee:\n$e",
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSaving = false;
        });
      }
    }
  }

  // ============================================================
  // MESSAGE
  // ============================================================

  void _showMessage(String message) {
    showDialog(
      context: context,

      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: const Row(
            children: [
              Icon(
                Icons.info_outline,
                color: Color(0xFF0C2340),
              ),

              SizedBox(width: 8),

              Text("Message"),
            ],
          ),

          content: Text(message),

          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(
                  dialogContext,
                );
              },

              child: const Text("OK"),
            ),
          ],
        );
      },
    );
  }

  // ============================================================
  // SECTION TITLE
  // ============================================================

  Widget _sectionTitle(
      String title,
      ) {
    return Text(
      title,

      style: const TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: Color(0xFF0C2340),
      ),
    );
  }

  // ============================================================
  // BUILD
  // ============================================================

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor:
      const Color(0xFFF8F9FC),

      // ========================================================
      // APP BAR
      // ========================================================

      appBar: AppBar(
        title: const Text(
          "Edit Employee",
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
        child: SingleChildScrollView(
          padding:
          const EdgeInsets.all(20),

          child: Form(
            key: _formKey,

            child: Column(
              crossAxisAlignment:
              CrossAxisAlignment
                  .stretch,

              children: [
                // ==================================================
                // EMPLOYEE ID
                // ==================================================

                if (widget.employee.id != null) ...[
                  InputDecorator(
                    decoration:
                    const InputDecoration(
                      labelText:
                      "Employee ID",

                      border:
                      OutlineInputBorder(),

                      prefixIcon:
                      Icon(
                        Icons.fingerprint,
                      ),
                    ),

                    child: Text(
                      widget.employee.id
                          .toString(),

                      style:
                      const TextStyle(
                        fontWeight:
                        FontWeight.w600,
                      ),
                    ),
                  ),

                  const SizedBox(
                    height: 24,
                  ),
                ],

                // ==================================================
                // PROFILE IMAGE
                // ==================================================

                Center(
                  child:
                  build_profileImage(),
                ),

                const SizedBox(
                  height: 14,
                ),

                Center(
                  child:
                  OutlinedButton.icon(
                    onPressed:
                    _isSaving
                        ? null
                        : _selectProfileImage,

                    icon:
                    const Icon(
                      Icons
                          .camera_alt_outlined,
                    ),

                    label: Text(
                      _profileImage ==
                          null
                          ? "Change Profile Photo"
                          : "Change Selected Photo",
                    ),
                  ),
                ),

                if (_profileImage != null) ...[
                  const SizedBox(
                    height: 5,
                  ),

                  const Center(
                    child: Text(
                      "New photo selected",
                      style:
                      TextStyle(
                        color:
                        Colors.green,
                        fontWeight:
                        FontWeight.w600,
                      ),
                    ),
                  ),
                ],

                const SizedBox(
                  height: 30,
                ),

                // ==================================================
                // PERSONAL INFORMATION
                // ==================================================

                _sectionTitle(
                  "Personal Information",
                ),

                const SizedBox(
                  height: 20,
                ),

                // FULL NAME

                _textField(
                  controller:
                  _nameController,

                  label:
                  "Full Name",

                  icon:
                  Icons.person_outline,

                  required: true,
                ),

                const SizedBox(
                  height: 16,
                ),

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

                  validator:
                      (String? value) {
                    if (value == null ||
                        value.trim().isEmpty) {
                      return "Email is required";
                    }

                    final RegExp emailRegex =
                    RegExp(
                      r'^[^@\s]+@[^@\s]+\.[^@\s]+$',
                    );

                    if (!emailRegex.hasMatch(
                      value.trim(),
                    )) {
                      return "Enter a valid email";
                    }

                    return null;
                  },
                ),

                const SizedBox(
                  height: 16,
                ),

                // PASSWORD

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

                  required: true,

                  obscureText:
                  _obscurePassword,

                  validator:
                  _validatePassword,

                  suffixIcon:
                  IconButton(
                    onPressed:
                    _isSaving
                        ? null
                        : () {
                      setState(() {
                        _obscurePassword =
                        !_obscurePassword;
                      });
                    },

                    icon: Icon(
                      _obscurePassword
                          ? Icons
                          .visibility_outlined
                          : Icons
                          .visibility_off_outlined,
                    ),
                  ),
                ),

                const SizedBox(
                  height: 8,
                ),

                Text(
                  "Use at least 6 characters.",

                  style: TextStyle(
                    color:
                    Colors.grey.shade600,
                    fontSize: 12,
                  ),
                ),

                const SizedBox(
                  height: 16,
                ),

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

                  validator:
                      (String? value) {
                    if (value == null ||
                        value.trim().isEmpty) {
                      return "Phone is required";
                    }

                    if (!RegExp(
                      r'^[0-9]{10}$',
                    ).hasMatch(
                      value.trim(),
                    )) {
                      return "Enter a valid 10-digit phone";
                    }

                    return null;
                  },
                ),

                const SizedBox(
                  height: 16,
                ),

                // AADHAAR / PAN

                _textField(
                  controller:
                  _aadhaarController,

                  label:
                  "Aadhaar / PAN",

                  icon:
                  Icons.badge_outlined,

                  required: true,
                ),

                const SizedBox(
                  height: 16,
                ),

                // ==================================================
                // BIRTH DATE
                // ==================================================

                FormField<DateTime>(
                  validator:
                      (DateTime? value) {
                    if (_birthDate == null) {
                      return "Birth date is required";
                    }

                    return null;
                  },

                  builder:
                      (FormFieldState<DateTime> field) {
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
                          .circular(10),

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
                          field.errorText,
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
                  height: 16,
                ),

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
                      Icons.family_restroom,
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
                      : (String? value) {
                    if (value == null) {
                      return;
                    }

                    setState(() {
                      _maritalStatus =
                          value;
                    });
                  },
                ),

                const SizedBox(
                  height: 30,
                ),

                // ==================================================
                // ADDRESS
                // ==================================================

                _sectionTitle(
                  "Address Information",
                ),

                const SizedBox(
                  height: 20,
                ),

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
                  height: 16,
                ),

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
                  height: 30,
                ),

                // ==================================================
                // SPOUSE
                // ==================================================

                _sectionTitle(
                  "Spouse Information",
                ),

                const SizedBox(
                  height: 8,
                ),

                Text(
                  _maritalStatus ==
                      "Married"
                      ? "Spouse name is required for married employees."
                      : "Optional information",

                  style: TextStyle(
                    color:
                    Colors.grey.shade600,
                    fontSize: 13,
                  ),
                ),

                const SizedBox(
                  height: 20,
                ),

                _textField(
                  controller:
                  _spouseNameController,

                  label:
                  "Spouse Name",

                  icon:
                  Icons.person_outline,

                  required:
                  _maritalStatus ==
                      "Married",
                ),

                const SizedBox(
                  height: 16,
                ),

                _textField(
                  controller:
                  _spouseEmployerController,

                  label:
                  "Spouse Employer",

                  icon:
                  Icons.business_outlined,
                ),

                const SizedBox(
                  height: 16,
                ),

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
                  height: 35,
                ),

                // ==================================================
                // UPDATE BUTTON
                // ==================================================

                SizedBox(
                  height: 54,

                  child:
                  ElevatedButton.icon(
                    onPressed:
                    _isSaving
                        ? null
                        : _updateEmployee,

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
                      Colors.grey.shade400,

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
                          .save_outlined,
                    ),

                    label: Text(
                      _isSaving
                          ? "Updating..."
                          : "Update Employee",

                      style:
                      const TextStyle(
                        fontSize: 16,
                        fontWeight:
                        FontWeight.bold,
                      ),
                    ),
                  ),
                ),

                const SizedBox(
                  height: 20,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}