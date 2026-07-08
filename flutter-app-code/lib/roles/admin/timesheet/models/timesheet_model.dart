class TimesheetModel {
  final int id;
  final int userId;
  final int businessId;
  final int? userDetailId;
  final int? clientId;
  final int? approvedBy;
  final int? mailTemplateId;
  final String? sendTo;
  final String startDate;
  final String endDate;
  final double? grossMargin;
  final double? netMargin;
  final String status;
  final String totalHours;
  final String? remarks;
  final String? attachmentPath;
  final String? submittedAt;
  final String? approvedAt;
  final String createdAt;
  final String updatedAt;
  final TimesheetUser user;
  final TimesheetClient client;
  final TimesheetMail? mail;
  final TimesheetUser? approver;
  final TimesheetUserDetail? userDetail;
  final List<TimesheetEntry> entries;

  TimesheetModel({
    required this.id,
    required this.userId,
    required this.businessId,
    this.userDetailId,
    this.clientId,
    this.approvedBy,
    this.mailTemplateId,
    this.sendTo,
    required this.startDate,
    required this.endDate,
    this.grossMargin,
    this.netMargin,
    required this.status,
    required this.totalHours,
    this.remarks,
    this.attachmentPath,
    this.submittedAt,
    this.approvedAt,
    required this.createdAt,
    required this.updatedAt,
    required this.user,
    required this.client,
    this.mail,
    this.approver,
    this.userDetail,
    required this.entries,
  });

  factory TimesheetModel.fromJson(Map<String, dynamic> json) {
    return TimesheetModel(
      id: json['id'] as int,
      userId: json['user_id'] as int,
      businessId: json['business_id'] as int,
      userDetailId: json['user_detail_id'] as int?,
      clientId: json['client_id'] as int?,
      approvedBy: json['approved_by'] as int?,
      mailTemplateId: json['mail_template_id'] as int?,
      sendTo: json['send_to'] as String?,
      startDate: json['start_date'] as String,
      endDate: json['end_date'] as String,
      grossMargin: json['gross_margin'] != null ? double.tryParse(json['gross_margin'].toString()) : null,
      netMargin: json['net_margin'] != null ? double.tryParse(json['net_margin'].toString()) : null,
      status: json['status'] as String,
      totalHours: json['total_hours'] as String,
      remarks: json['remarks'] as String?,
      attachmentPath: json['attachment_path'] as String?,
      submittedAt: json['submitted_at'] as String?,
      approvedAt: json['approved_at'] as String?,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
      user: TimesheetUser.fromJson(json['user'] as Map<String, dynamic>),
      client: _parseClient(json),
      mail: json['mail'] != null ? TimesheetMail.fromJson(json['mail'] as Map<String, dynamic>) : null,
      approver: json['approver'] != null ? TimesheetUser.fromJson(json['approver'] as Map<String, dynamic>) : null,
      userDetail: json['user_detail'] != null ? TimesheetUserDetail.fromJson(json['user_detail'] as Map<String, dynamic>) : null,
      entries: (json['entries'] as List<dynamic>?)
          ?.map((e) => TimesheetEntry.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'business_id': businessId,
      'user_detail_id': userDetailId,
      'client_id': clientId,
      'approved_by': approvedBy,
      'mail_template_id': mailTemplateId,
      'send_to': sendTo,
      'start_date': startDate,
      'end_date': endDate,
      'gross_margin': grossMargin,
      'net_margin': netMargin,
      'status': status,
      'total_hours': totalHours,
      'remarks': remarks,
      'attachment_path': attachmentPath,
      'submitted_at': submittedAt,
      'approved_at': approvedAt,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'user': user.toJson(),
      'client': client.toJson(),
      'mail': mail?.toJson(),
      'approver': approver?.toJson(),
      'user_detail': userDetail?.toJson(),
      'entries': entries.map((e) => e.toJson()).toList(),
    };
  }

  // Safely parse client; if backend returns null client, create a placeholder
  static TimesheetClient _parseClient(Map<String, dynamic> json) {
    final dynamic clientJson = json['client'];
    if (clientJson is Map<String, dynamic>) {
      return TimesheetClient.fromJson(clientJson);
    }

    // Fallback dummy client to avoid runtime cast errors
    return TimesheetClient(
      id: 0,
      name: 'Unknown Client',
      phone: null,
      zipCode: null,
      address: null,
      remarks: null,
      partyType: '',
      businessId: (json['business_id'] as int? ?? 0),
      createdAt: json['created_at']?.toString() ?? '',
      updatedAt: json['updated_at']?.toString() ?? '',
    );
  }
}

class TimesheetUserDetail {
  final int id;
  final int userId;
  final double? clientRate;
  final double? consultantRate;
  final double? otherRate;
  final double? w2;
  final double? c2cOrOther;
  final double? ptax;
  final String? timeSheetPeriod;
  final String? startDate;
  final String? endDate;
  final int? partyId;
  final int? accountManagerId;
  final double? accountManagerCommission;
  final int? businessDevelopmentManagerId;
  final double? businessDevelopmentManagerCommission;
  final int? recruiterId;
  final double? recruiterCommission;
  final String? invoiceTo;
  final bool? recursive;
  final String? recursiveMonth;

  TimesheetUserDetail({
    required this.id,
    required this.userId,
    this.clientRate,
    this.consultantRate,
    this.otherRate,
    this.w2,
    this.c2cOrOther,
    this.ptax,
    this.timeSheetPeriod,
    this.startDate,
    this.endDate,
    this.partyId,
    this.accountManagerId,
    this.accountManagerCommission,
    this.businessDevelopmentManagerId,
    this.businessDevelopmentManagerCommission,
    this.recruiterId,
    this.recruiterCommission,
    this.invoiceTo,
    this.recursive,
    this.recursiveMonth,
  });

  factory TimesheetUserDetail.fromJson(Map<String, dynamic> json) {
    return TimesheetUserDetail(
      id: json['id'] as int,
      userId: json['user_id'] as int,
      clientRate: json['client_rate'] != null ? double.tryParse(json['client_rate'].toString()) : null,
      consultantRate: json['consultant_rate'] != null ? double.tryParse(json['consultant_rate'].toString()) : null,
      otherRate: json['other_rate'] != null ? double.tryParse(json['other_rate'].toString()) : null,
      w2: json['w2'] != null ? double.tryParse(json['w2'].toString()) : null,
      c2cOrOther: json['c2c_or_other'] != null ? double.tryParse(json['c2c_or_other'].toString()) : null,
      ptax: json['ptax'] != null ? double.tryParse(json['ptax'].toString()) : null,
      timeSheetPeriod: json['time_sheet_period'] as String?,
      startDate: json['start_date'] as String?,
      endDate: json['end_date'] as String?,
      partyId: json['party_id'] as int?,
      accountManagerId: json['account_manager_id'] as int?,
      accountManagerCommission: json['account_manager_commission'] != null ? double.tryParse(json['account_manager_commission'].toString()) : null,
      businessDevelopmentManagerId: json['business_development_manager_id'] as int?,
      businessDevelopmentManagerCommission: json['business_development_manager_commission'] != null ? double.tryParse(json['business_development_manager_commission'].toString()) : null,
      recruiterId: json['recruiter_id'] as int?,
      recruiterCommission: json['recruiter_commission'] != null ? double.tryParse(json['recruiter_commission'].toString()) : null,
      invoiceTo: json['invoice_to'] as String?,
      recursive: json['recursive'] == 1 || json['recursive'] == true,
      recursiveMonth: json['recursive_month'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'client_rate': clientRate,
      'consultant_rate': consultantRate,
      'other_rate': otherRate,
      'w2': w2,
      'c2c_or_other': c2cOrOther,
      'ptax': ptax,
      'time_sheet_period': timeSheetPeriod,
      'start_date': startDate,
      'end_date': endDate,
      'party_id': partyId,
      'account_manager_id': accountManagerId,
      'account_manager_commission': accountManagerCommission,
      'business_development_manager_id': businessDevelopmentManagerId,
      'business_development_manager_commission': businessDevelopmentManagerCommission,
      'recruiter_id': recruiterId,
      'recruiter_commission': recruiterCommission,
      'invoice_to': invoiceTo,
      'recursive': recursive,
      'recursive_month': recursiveMonth,
    };
  }
}

class TimesheetUser {
  final int id;
  final String name;
  final String username;
  final String email;
  final String? emailVerifiedAt;
  final String? phone;
  final String? gender;
  final int businessId;
  final String? image;
  final String? signature;
  final String? maritalStatus;
  final String status;
  final String createdAt;
  final String updatedAt;

  TimesheetUser({
    required this.id,
    required this.name,
    required this.username,
    required this.email,
    this.emailVerifiedAt,
    this.phone,
    this.gender,
    required this.businessId,
    this.image,
    this.signature,
    this.maritalStatus,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory TimesheetUser.fromJson(Map<String, dynamic> json) {
    return TimesheetUser(
      id: json['id'] as int,
      name: json['name'] as String,
      username: json['username'] as String,
      email: json['email'] as String,
      emailVerifiedAt: json['email_verified_at'] as String?,
      phone: json['phone'] as String?,
      gender: json['gender'] as String?,
      businessId: json['business_id'] as int,
      image: json['image'] as String?,
      signature: json['signature'] as String?,
      maritalStatus: json['marital_status'] as String?,
      status: json['status'] as String,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'username': username,
      'email': email,
      'email_verified_at': emailVerifiedAt,
      'phone': phone,
      'gender': gender,
      'business_id': businessId,
      'image': image,
      'signature': signature,
      'marital_status': maritalStatus,
      'status': status,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }
}

class TimesheetClient {
  final int id;
  final String name;
  final String? phone;
  final String? zipCode;
  final String? address;
  final String? remarks;
  final String partyType;
  final int businessId;
  final String createdAt;
  final String updatedAt;

  TimesheetClient({
    required this.id,
    required this.name,
    this.phone,
    this.zipCode,
    this.address,
    this.remarks,
    required this.partyType,
    required this.businessId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory TimesheetClient.fromJson(Map<String, dynamic> json) {
    return TimesheetClient(
      id: json['id'] as int,
      name: json['name'] as String,
      phone: json['phone'] as String?,
      zipCode: json['zip_code'] as String?,
      address: json['address'] as String?,
      remarks: json['remarks'] as String?,
      partyType: json['party_type'] as String,
      businessId: json['business_id'] as int,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'zip_code': zipCode,
      'address': address,
      'remarks': remarks,
      'party_type': partyType,
      'business_id': businessId,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }
}

class TimesheetMail {
  final int id;
  final String? templateName;
  final String? subject;
  final String? body;

  TimesheetMail({
    required this.id,
    this.templateName,
    this.subject,
    this.body,
  });

  factory TimesheetMail.fromJson(Map<String, dynamic> json) {
    return TimesheetMail(
      id: json['id'] as int,
      templateName: json['template_name'] as String?,
      subject: json['subject'] as String?,
      body: json['body'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'template_name': templateName,
      'subject': subject,
      'body': body,
    };
  }
}

class TimesheetEntry {
  final int id;
  final int businessId;
  final int timesheetId;
  final DateTime entryDate;
  final String dailyHours;
  final String extraHours;
  final String vacationHours;
  final String? note;
  final int isLocked;
  final String? clientRateSnapshot;
  final String? consultantRateSnapshot;
  final String createdAt;
  final String updatedAt;

  TimesheetEntry({
    required this.id,
    required this.businessId,
    required this.timesheetId,
    required this.entryDate,
    required this.dailyHours,
    required this.extraHours,
    required this.vacationHours,
    this.note,
    required this.isLocked,
    this.clientRateSnapshot,
    this.consultantRateSnapshot,
    required this.createdAt,
    required this.updatedAt,
  });

  factory TimesheetEntry.fromJson(Map<String, dynamic> json) {
    return TimesheetEntry(
      id: json['id'] as int,
      businessId: json['business_id'] as int,
      timesheetId: json['timesheet_id'] as int,
      entryDate: DateTime.parse(json['entry_date'] as String),
      dailyHours: json['daily_hours'] as String,
      extraHours: json['extra_hours'] as String,
      vacationHours: json['vacation_hours'] as String,
      note: json['note'] as String?,
      isLocked: json['is_locked'] as int,
      clientRateSnapshot: json['client_rate_snapshot'] as String?,
      consultantRateSnapshot: json['consultant_rate_snapshot'] as String?,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'business_id': businessId,
      'timesheet_id': timesheetId,
      'entry_date': entryDate.toIso8601String(),
      'daily_hours': dailyHours,
      'extra_hours': extraHours,
      'vacation_hours': vacationHours,
      'note': note,
      'is_locked': isLocked,
      'client_rate_snapshot': clientRateSnapshot,
      'consultant_rate_snapshot': consultantRateSnapshot,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }

  double get dailyHoursDouble => double.tryParse(dailyHours) ?? 0.0;
  double get extraHoursDouble => double.tryParse(extraHours) ?? 0.0;
  double get vacationHoursDouble => double.tryParse(vacationHours) ?? 0.0;
}

class TimesheetResponse {
  final bool success;
  final List<TimesheetModel> data;

  TimesheetResponse({
    required this.success,
    required this.data,
  });

  factory TimesheetResponse.fromJson(Map<String, dynamic> json) {
    return TimesheetResponse(
      success: json['success'] as bool,
      data: (json['data'] as List<dynamic>?)
              ?.where((e) => e is Map<String, dynamic>)
              .map((e) => TimesheetModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'data': data.map((e) => e.toJson()).toList(),
    };
  }
}
