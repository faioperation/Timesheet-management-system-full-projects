import React from "react";
import Timesheet from "./Timesheet";
import UserTimesheet from "./UserTimesheet";

const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

export default function TimesheetRoute() {
  const role = getCookie("user_role");
  

  if (role === "User") {
    return <UserTimesheet />;
  }

  return <Timesheet />;
}

