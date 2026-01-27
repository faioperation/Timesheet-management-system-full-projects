import React, { useState, useEffect } from "react";
import {
  MdSpaceDashboard,
  MdOutlineAccessTimeFilled,
  MdOutlineCalendarMonth,
  MdSettings,
  MdHome,
  MdBusiness,
} from "react-icons/md";
import { LuSquareActivity } from "react-icons/lu";
import { FaUserLarge } from "react-icons/fa6";
import { IoLogOut } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getRoleBasedMenuItems } from "../libs/roleUtils";
import { logout } from "../libs/apiFetch";

function Sidebar({ onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const Pathname = location.pathname;
  const [userRole, setUserRole] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
    };
    const role = getCookie("user_role");
    setUserRole(role);

    // Get menu items based on role
    const items = getRoleBasedMenuItems(role);

    // Map icon keys to actual icons
    const iconMap = {
      home: <MdHome />,
      company: <MdBusiness />,
      dashboard: <MdSpaceDashboard />,
      users: <FaUserLarge />,
      timesheet: <MdOutlineCalendarMonth />,
      scheduler: <MdOutlineAccessTimeFilled />,
      activity: <LuSquareActivity />,
      settings: <MdSettings />,
    };

    const itemsWithIcons = items.map((item) => ({
      ...item,
      Icon: iconMap[item.iconKey] || <MdSpaceDashboard />,
    }));

    setMenuItems(itemsWithIcons);
  }, []);

  const NavLinks = menuItems;

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className={`bg-[#5069E5] w-[100%] h-[100%] px-2 sm:px-3 lg:px-4 py-4 lg:py-6 flex flex-col justify-between`}
    >
      {/* Mobile close button */}
      <div className="lg:hidden flex justify-end mb-2">
        <button
          onClick={onClose}
          className="text-white text-2xl hover:bg-white/20 rounded p-1 transition-colors"
          aria-label="Close menu"
        >
          <RxCross2 />
        </button>
      </div>

      <div className="w-full flex-1">
        <ul className="flex flex-col items-center gap-4 sm:gap-6 lg:gap-8 mt-2 sm:mt-4 lg:mt-6 pt-4 sm:pt-5 lg:pt-6 border-t border-[#CED2E5] w-full">
          {NavLinks.map((navlink, idx) => {
            // Check if current path matches the navlink path
            const isExactMatch = Pathname === navlink.pathname;
            // Check if current path starts with navlink path (for nested routes)
            const isNestedMatch =
              navlink.pathname !== "/" &&
              Pathname.startsWith(navlink.pathname + "/");

            // Special handling for settings: any /settings/* route should highlight settings menu
            let isActive = isExactMatch || isNestedMatch;

            // Check if any sub-item is active
            const hasSubItems = navlink.subItems && navlink.subItems.length > 0;
            if (hasSubItems && !isActive) {
              const isSubItemActive = navlink.subItems.some(sub =>
                Pathname === sub.pathname || Pathname.startsWith(sub.pathname + "/")
              );
              if (isSubItemActive) isActive = true;
            }

            if (
              navlink.Title === "settings" &&
              Pathname.startsWith("/settings")
            ) {
              isActive = true;
            }
            if (navlink.Title === "users" && Pathname.startsWith("/user")) {
              isActive = true;
            }
            const isHovered = hoveredItem === idx;

            return (
              <li
                key={idx}
                className={`w-full relative ${isActive ? "text-white" : "text-[#0C0C0D]"
                  } hover:text-white transition-colors duration-200`}
                onMouseEnter={() => hasSubItems && setHoveredItem(idx)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Main menu item */}
                <Link
                  to={navlink.pathname}
                  onClick={handleLinkClick}
                  className="flex flex-col items-center py-2 text-xl sm:text-2xl"
                >
                  {navlink.Icon}
                </Link>

                {/* Sub-menu dropdown */}
                {hasSubItems && isHovered && (
                  <div className="absolute left-full top-0 pl-2 z-50">
                    <div className="bg-[#5069E5] rounded-xl shadow-2xl min-w-[200px] py-3 border border-white/10">
                      <div className="px-5 py-2 mb-2 border-b border-white/10">
                        <p className="text-white font-bold text-lg tracking-wide uppercase">
                          {navlink.Title}
                        </p>
                      </div>
                      {navlink.subItems.map((subItem, subIdx) => {
                        const isSubActive =
                          Pathname === subItem.pathname ||
                          Pathname.startsWith(subItem.pathname + "/");
                        return (
                          <Link
                            key={subIdx}
                            to={subItem.pathname}
                            onClick={handleLinkClick}
                            className={`block px-5 py-2.5 text-sm transition-all duration-200 ${isSubActive
                              ? "text-white font-bold bg-white/20"
                              : "text-[#CED2E5] font-medium hover:text-white hover:bg-white/10"
                              }`}
                          >
                            {subItem.Title}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <div
          className={`${Pathname === "/logout" ? "text-white" : "text-[#0C0C0D]"
            } text-xl sm:text-2xl text-center cursor-pointer`}
        >
          <div
            className="flex flex-col items-center py-2 hover:text-white transition-colors"
            onClick={() => {
              logout({ navigate });
              if (onClose) {
                onClose();
              }
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                logout({ navigate });
                if (onClose) {
                  onClose();
                }
              }
            }}
            aria-label="Logout"
          >
            <IoLogOut />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

// MdDesktopAccessDisabled;k 