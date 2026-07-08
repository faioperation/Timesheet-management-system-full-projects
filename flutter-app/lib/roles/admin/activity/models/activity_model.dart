class ActivityModel {
  final int id;
  final int userId;
  final int businessId;
  final String action;
  final String ipAddress;
  final String userAgent;
  final String createdAt;
  final String updatedAt;
  final ActivityUser user;

  ActivityModel({
    required this.id,
    required this.userId,
    required this.businessId,
    required this.action,
    required this.ipAddress,
    required this.userAgent,
    required this.createdAt,
    required this.updatedAt,
    required this.user,
  });

  factory ActivityModel.fromJson(Map<String, dynamic> json) {
    return ActivityModel(
      id: json['id'] ?? 0,
      userId: json['user_id'] ?? 0,
      businessId: json['business_id'] ?? 0,
      action: json['action'] ?? '',
      ipAddress: json['ip_address'] ?? '',
      userAgent: json['user_agent'] ?? '',
      createdAt: json['created_at'] ?? '',
      updatedAt: json['updated_at'] ?? '',
      user: ActivityUser.fromJson(json['user'] ?? {}),
    );
  }

  String get role {
    if (user.roles.isEmpty) return 'User';
    return user.roles.first.name;
  }
}

class ActivityUser {
  final int id;
  final String name;
  final String email;
  final List<ActivityRole> roles;

  ActivityUser({
    required this.id,
    required this.name,
    required this.email,
    required this.roles,
  });

  factory ActivityUser.fromJson(Map<String, dynamic> json) {
    return ActivityUser(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      roles: (json['roles'] as List<dynamic>?)
              ?.map((role) => ActivityRole.fromJson(role))
              .toList() ??
          [],
    );
  }
}

class ActivityRole {
  final int id;
  final String name;

  ActivityRole({
    required this.id,
    required this.name,
  });

  factory ActivityRole.fromJson(Map<String, dynamic> json) {
    return ActivityRole(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
    );
  }
}

class ActivityResponse {
  final bool success;
  final ActivityPaginationData data;

  ActivityResponse({
    required this.success,
    required this.data,
  });

  factory ActivityResponse.fromJson(Map<String, dynamic> json) {
    return ActivityResponse(
      success: json['success'] ?? false,
      data: ActivityPaginationData.fromJson(json['data'] ?? {}),
    );
  }
}

class ActivityPaginationData {
  final int currentPage;
  final List<ActivityModel> activities;
  final int total;
  final int perPage;
  final int lastPage;
  final String? nextPageUrl;
  final String? prevPageUrl;

  ActivityPaginationData({
    required this.currentPage,
    required this.activities,
    required this.total,
    required this.perPage,
    required this.lastPage,
    this.nextPageUrl,
    this.prevPageUrl,
  });

  factory ActivityPaginationData.fromJson(Map<String, dynamic> json) {
    return ActivityPaginationData(
      currentPage: json['current_page'] ?? 1,
      activities: (json['data'] as List<dynamic>?)
              ?.map((activity) => ActivityModel.fromJson(activity))
              .toList() ??
          [],
      total: json['total'] ?? 0,
      perPage: json['per_page'] ?? 50,
      lastPage: json['last_page'] ?? 1,
      nextPageUrl: json['next_page_url'],
      prevPageUrl: json['prev_page_url'],
    );
  }
}
