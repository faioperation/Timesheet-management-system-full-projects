import React, { useState, useEffect, useMemo } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import ReusableTable from "../components/ReusableTable";
import { apiFetch } from "../libs/apiFetch";
import { toast } from "react-toastify";

// Helper function to format action to display text
const formatAction = (action) => {
  const actionMap = {
    login: "Login",
    create_vendor: "Create Vendor",
    create_employee: "Create Employee",
    create_user: "Create User",
    create_timesheet: "Create Timesheet",
    update_profile: "Update Profile",
    change_password: "Change Password",
    assign_permission_to_role: "Assign Permission to Role",
    timesheet_approved: "Timesheet Approved",
    timesheet_submit: "Timesheet Submit",
    timesheet_resubmit: "Timesheet Resubmit",
  };

  // Convert snake_case to Title Case if not in map
  if (actionMap[action]) {
    return actionMap[action];
  }

  return action
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Helper function to map API role to filter role
const mapRoleToFilter = (apiRole) => {
  const roleMap = {
    "Business Admin": "Admin",
    Admin: "Admin",
    User: "User",
    Staff: "Supervisor",
    Supervisor: "Supervisor",
  };

  return roleMap[apiRole] || apiRole;
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export default function Activity() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [activitiesData, setActivitiesData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch data from API
  useEffect(() => {
    const fetchActivities = async () => {
      setIsFetching(true);
      try {
        // Build query params
        const params = new URLSearchParams();
        params.append("page", currentPage.toString());
        params.append("per_page", "10");

        const response = await apiFetch(
          `/manage-activity?${params.toString()}`,
          {
            method: "GET",
          },
        );

        if (!response.ok) {
          // Handle common permission errors with a clear message
          if (response.status === 403 || response.status === 401) {
            toast.error("You do not have permission to view activities");
            setActivitiesData([]);
            setTotalPages(1);
            setTotalItems(0);
            return;
          }

          if (response.status === 404) {
            toast.error("Activities endpoint not found");
            setActivitiesData([]);
            setTotalPages(1);
            setTotalItems(0);
            return;
          }
          throw new Error("Failed to fetch activitiess");
        }

        const result = await response.json();

        if (result.success && result.data) {
          // Map API data to table structure
          let mappedData = result.data.data.map((item, index) => {
            const role = item.user?.roles?.[0]?.name || "Unknown";
            const mappedRole = mapRoleToFilter(role);

            return {
              id: item.id,
              no: String((currentPage - 1) * 10 + index + 1).padStart(2, "0"),
              createdBy: item.user?.name || "Unknown",
              date: formatDate(item.created_at),
              role: mappedRole,
              activities: formatAction(item.action),
            };
          });

          // Filter by role if not 'All' (client-side filtering)
          if (activeFilter !== "All") {
            mappedData = mappedData.filter(
              (item) => item.role === activeFilter,
            );
          }

          setActivitiesData(mappedData);
          setTotalPages(result.data.last_page || 1);
          setTotalItems(result.data.total || 0);
        } else {
          // No data case
          setActivitiesData([]);
          setTotalPages(1);
          setTotalItems(0);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        toast.error(error.message || "Failed to load activities");
        setActivitiesData([]);
      } finally {
        setIsFetching(false);
      }
    };

    fetchActivities();
  }, [activeFilter, currentPage]);

  useEffect(() => {
    // Reset to first page when filter changes
    setCurrentPage(1);
  }, [activeFilter]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const columns = [
    {
      key: "no",
      label: "No",
      className: "text-left w-[5%]",
    },
    {
      key: "createdBy",
      label: "Created by",
      className: "text-left w-[25%]",
    },
    {
      key: "date",
      label: "Date",
      className: "text-left w-[20%]",
    },
    {
      key: "role",
      label: "Role",
      className: "text-left w-[15%]",
    },
    {
      key: "activities",
      label: "Activities",
      className: "text-left w-[35%]",
    },
  ];

  return (
    <div className="w-full pb-10">
      {/* Top Section with Filter Tabs and Dropdown */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          {["All", "Admin", "User", "Supervisor"].map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`
                px-6 py-2.5 rounded-lg text-sm font-medium transition-colors border-b-2
                ${
                  activeFilter === filter
                    ? "bg-[#F3F4FF] text-[#5069E5] border-[#5069E5]"
                    : "bg-white text-gray-600 hover:text-gray-900 border-transparent"
                }
              `}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Activities Dropdown */}
        <div className="relative">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-[#5069E5] transition-colors">
            <span>Activities</span>
            <IoMdArrowDropdown size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      {isFetching ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading activities...</div>
          </div>
        </div>
      ) : (
        <ReusableTable
          key={activeFilter} // Reset pagination when filter changes
          columns={columns}
          data={activitiesData}
          itemsPerPage={10}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          headerBgColor="bg-[#E0E7FF]"
          stripedRows={true}
        />
      )}
    </div>
  );
}
