import '../../main_bottom_nav_screen.dart';

UserRole getRoleFromApi(String roleName) {
  switch (roleName.toLowerCase()) {
    case "business admin":
    case "admin":
      return UserRole.admin;

    // case "supervisor":
    //   return UserRole.supervisor;

    case "staff":
    case "supervisor":
      return UserRole.staff;

    default:
      return UserRole.user;
  }
}
