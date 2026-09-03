class Employee {
  final int? id;

  final String fullName;
  final String currentAddress;
  final String permanentAddress;
  final String phone;

  final String email;
  final String password;

  final String aadhaarOrPan;
  final DateTime? birthDate;
  final String maritalStatus;

  final String spouseName;
  final String spouseEmployer;
  final String spouseWorkPhone;

  Employee({
    this.id,

    required this.fullName,
    required this.currentAddress,
    required this.permanentAddress,
    required this.phone,

    required this.email,
    required this.password,

    required this.aadhaarOrPan,
    this.birthDate,
    required this.maritalStatus,

    required this.spouseName,
    required this.spouseEmployer,
    required this.spouseWorkPhone,
  });

  // ============================================================
  // FROM JSON
  // ============================================================

  factory Employee.fromJson(Map<String, dynamic> json) {
    return Employee(
      id: json['id'],

      fullName: json['fullName'] ?? '',

      currentAddress: json['currentAddress'] ?? '',

      permanentAddress: json['permanentAddress'] ?? '',

      phone: json['phone'] ?? '',

      email: json['email'] ?? '',

      // Do not expect password from GET response.
      password: json['password'] ?? '',

      aadhaarOrPan: json['aadhaarOrPan'] ?? '',

      birthDate: json['birthDate'] != null
          ? DateTime.tryParse(json['birthDate'].toString())
          : null,

      maritalStatus: json['maritalStatus'] ?? '',

      spouseName: json['spouseName'] ?? '',

      spouseEmployer: json['spouseEmployer'] ?? '',

      spouseWorkPhone: json['spouseWorkPhone'] ?? '',
    );
  }

  // ============================================================
  // TO JSON
  // ============================================================

  Map<String, dynamic> toJson() {
    return {
      'id': id,

      'fullName': fullName,

      'currentAddress': currentAddress,

      'permanentAddress': permanentAddress,

      'phone': phone,

      'email': email,

      'password': password,

      'aadhaarOrPan': aadhaarOrPan,

      'birthDate': birthDate?.toIso8601String().split('T').first,

      'maritalStatus': maritalStatus,

      'spouseName': spouseName,

      'spouseEmployer': spouseEmployer,

      'spouseWorkPhone': spouseWorkPhone,
    };
  }

  // ============================================================
  // PROFILE IMAGE URL
  // ============================================================

  String get profileImageUrl {
    if (id == null) {
      return '';
    }

    return "http://192.168.1.8:8080"
        "/api/employee/$id/image";
  }

  // ============================================================
  // COPY WITH
  // ============================================================

  Employee copyWith({
    int? id,
    String? fullName,
    String? currentAddress,
    String? permanentAddress,
    String? phone,
    String? email,
    String? password,
    String? aadhaarOrPan,
    DateTime? birthDate,
    String? maritalStatus,
    String? spouseName,
    String? spouseEmployer,
    String? spouseWorkPhone,
  }) {
    return Employee(
      id: id ?? this.id,

      fullName: fullName ?? this.fullName,

      currentAddress: currentAddress ?? this.currentAddress,

      permanentAddress: permanentAddress ?? this.permanentAddress,

      phone: phone ?? this.phone,

      email: email ?? this.email,

      password: password ?? this.password,

      aadhaarOrPan: aadhaarOrPan ?? this.aadhaarOrPan,

      birthDate: birthDate ?? this.birthDate,

      maritalStatus: maritalStatus ?? this.maritalStatus,

      spouseName: spouseName ?? this.spouseName,

      spouseEmployer: spouseEmployer ?? this.spouseEmployer,

      spouseWorkPhone: spouseWorkPhone ?? this.spouseWorkPhone,
    );
  }
}
