class Urls{
  static const String _baseUrl = "https://test5.fireai.agency/api";
  static const String signUpUrl = '${_baseUrl}/register';
  static const String signInUrl = '${_baseUrl}/login';
  static const String forgotPassUrl = '${_baseUrl}/forget-password';
  static const String verifyOtpUrl = '${_baseUrl}/otp-varification';
  static const String resetPassUrl = '${_baseUrl}/reset-password';
  static const String adminProfileUrl = '${_baseUrl}/profile';
  static const String adminEditProfileUrl = '${_baseUrl}/profile-edit';
  static const String adminChangePassUrl = '${_baseUrl}/change-password';



  static const String adminAddUserUrl = '${_baseUrl}/user';
  static const String userListUrl = '${_baseUrl}/users';
  static const String rolesUrl = '${_baseUrl}/roles';
  static String singleUserUrl(id) => '${_baseUrl}/user/$id';
  static String updateUserProfileUrl(id) => '${_baseUrl}/user/$id';
  static String updateUserStatusUrl(int userId) => '${_baseUrl}/user/$userId';
  static String deleteUserUrl(int userId) => '${_baseUrl}/user/$userId';
  static String deletePartyUrl(int partyId) => '${_baseUrl}/party/$partyId';
  static String deleteInternalUserUrl(int internalUserId) => '${_baseUrl}/internaluser/$internalUserId';


  //party
  static const String createPartyListUrl = '${_baseUrl}/party';
  static String updatePartyUrl(int partyId) => '${_baseUrl}/party/$partyId';
  static const String vendorList = '${_baseUrl}/vendors';
  static const String employeeList = '${_baseUrl}/employees';
  static const String clientList = '${_baseUrl}/clients';
  static const String internalUserList = '${_baseUrl}/internalusers';
  static const String createInternalUserUrl = '${_baseUrl}/internaluser';
  static String updateInternalUserUrl(int internalUserId) => '${_baseUrl}/internaluser/$internalUserId';
  static String updateInternalUserRoleUrl(int internalUserId) => '${_baseUrl}/internaluser/$internalUserId';
  static const String manageActivityUrl = '${_baseUrl}/manage-activity';
  static const String supervisorPermissionsUrl = '${_baseUrl}/supervisor-permissions';
  static const String supervisorAvailablePermissionsUrl = '${_baseUrl}/supervisor-available-permissions';
  static const String userPermissionsUrl = '${_baseUrl}/user-permissions';
  static const String userAvailablePermissionsUrl = '${_baseUrl}/user-available-permissions';
  static const String roleHasPermissionUrl = '${_baseUrl}/role-has-permission';
  static const String emailTemplateUrl = '${_baseUrl}/email-template';
  static String updateEmailTemplateUrl(int id) => '${_baseUrl}/email-template/$id';
  static const String timesheetUrl = '${_baseUrl}/timesheet';
  static String updateTimesheetStatusUrl(int timesheetId) => '${_baseUrl}/timesheet/$timesheetId';
  static String userTimesheetDefaultsUrl(int userId) => '${_baseUrl}/user/$userId/timesheet-defaults';
  static const String staffDashboardUrl = '${_baseUrl}/staff-dashboard';
  static String schedulerUrl(String month) => '${_baseUrl}/scheduler?month=$month';
  static const String chartTrendUrl = '${_baseUrl}/chart/trend';
  static const String userHasRoleUrl = '${_baseUrl}/user-has-role';
  static const String companyUpdateUrl = '${_baseUrl}/company-update';
  static String assignClientUrl(int userDetailsId) => '${_baseUrl}/user-details/$userDetailsId';
  static const String updateWeekendUrl = '${_baseUrl}/update-weekend';







}