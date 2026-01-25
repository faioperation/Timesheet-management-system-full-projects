import React, { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../../libs/apiFetch";
import { toast } from "react-toastify";

const actions = [
  { key: "add", label: "ADD", suffix: "create" },
  { key: "view", label: "VIEW", suffix: "view" },
  { key: "update", label: "UPDATE", suffix: "update" },
  { key: "delete", label: "DELETE", suffix: "delete" },
];

export default function RolePermission() {
  const [activeRoleName, setActiveRoleName] = useState("Supervisor"); // Display name
  const [internalRoleName, setInternalRoleName] = useState("Staff"); // Backend role name
  const [roles, setRoles] = useState({}); // roleName -> id
  const [featureRows, setFeatureRows] = useState([]); // Dynamically built rows
  const [activePermissions, setActivePermissions] = useState({}); // permissionId -> boolean
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Grouping logic: "action_feature" -> { feature, action }
  const parsePermission = (p) => {
    const name = p.name;
    
    // Normalize action mapping
    const mapAction = (act) => {
      const actionMap = {
        create: 'add',
        view: 'view',
        update: 'update',
        delete: 'delete',
        status: 'update', // status update maps to update
        role: 'update',   // role update maps to update
        submit: 'view',
        approve: 'update'
      };
      return actionMap[act] || 'view';
    };

    // Special handling for Internal User related permissions
    if (name.includes('internal_user')) {
      const parts = name.split('_');
      return { 
        feature: 'Internal user', 
        action: mapAction(parts[0]), 
        id: p.id 
      };
    }

    const parts = name.split('_');
    if (parts.length < 2) return { feature: name, action: 'view', id: p.id };
    
    const action = parts[0];
    let feature = parts.slice(1).join(' ');
    
    // Normalize feature name: remove 'update ' or 'role ' prefixes that cause duplicates
    feature = feature.replace(/^(update|role|status)\s+/i, '');
    
    // Rename Party
    if (feature.toLowerCase() === 'party') {
      feature = 'Client / Vendor / Employee';
    }
    
    return { 
      feature: feature.charAt(0).toUpperCase() + feature.slice(1), 
      action: mapAction(action), 
      id: p.id,
      originalName: name
    };
  };

  const fetchData = async (roleName) => {
    setIsFetching(true);
    try {
      const isSupervisor = roleName === "Staff";
      
      // 1. Fetch All Assignable Permissions for this role (The List)
      const listEndpoint = isSupervisor ? "/supervisor-permissions" : "/user-permissions";
      const listRes = await apiFetch(listEndpoint);
      const listData = await listRes.json();

      // 2. Fetch Available/Current Permissions (The Switch state)
      const availableEndpoint = isSupervisor ? "/supervisor-available-permissions" : "/user-available-permissions";
      const availableRes = await apiFetch(availableEndpoint);
      const availableData = await availableRes.json();

      if (listData.success && availableData.success) {
        // Build rows dynamically from the list
        const groupedFeatures = {};
        listData.data.forEach(p => {
          if (p.name.toLowerCase().includes('report')) return; // Explicitly skip report permissions
          
          const { feature, action, id } = parsePermission(p);
          if (!groupedFeatures[feature]) {
            groupedFeatures[feature] = { name: feature, perms: {} };
          }
          groupedFeatures[feature].perms[action] = id;
        });

        setFeatureRows(Object.values(groupedFeatures));

        // Set active switch states
        const activeMap = {};
        availableData.data.forEach(p => {
          activeMap[p.id] = true;
        });
        setActivePermissions(activeMap);
      }

      // 3. Get Role IDs if not already loaded (only once)
      if (Object.keys(roles).length === 0) {
        const rolesRes = await apiFetch("/roles");
        const rolesData = await rolesRes.json();
        if (rolesData.success) {
          const roleMapping = {};
          rolesData.data.forEach((r) => (roleMapping[r.name] = r.id));
          setRoles(roleMapping);
        }
      }
    } catch (error) {
      console.error("Error fetching permission data:", error);
      toast.error("Failed to load permissions");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchData(internalRoleName);
  }, [internalRoleName]);

  const handleToggle = (permId) => {
    if (!permId) return;
    setActivePermissions(prev => ({
      ...prev,
      [permId]: !prev[permId]
    }));
  };

  const handleSave = async () => {
    const roleId = roles[internalRoleName];
    if (!roleId) {
      toast.error("Role ID not found");
      return;
    }

    const selectedPermissionIds = Object.keys(activePermissions)
      .filter(id => activePermissions[id])
      .map(id => parseInt(id));

    setIsSaving(true);
    try {
      const response = await apiFetch("/role-has-permission", {
        method: "POST",
        body: JSON.stringify({
          role_id: roleId,
          permissions: selectedPermissionIds
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`Permissions updated for ${activeRoleName}`);
      } else {
        throw new Error(result.message || "Failed to update permissions");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetching && featureRows.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5069E5]"></div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6 bg-[#F8F9FD] min-h-screen font-sans">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Role Permission</h2>

        {/* Role Selector Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { label: "Supervisor", name: "Staff" },
            { label: "User", name: "User" }
          ].map((role) => (
            <button
              key={role.name}
              onClick={() => {
                setActiveRoleName(role.label);
                setInternalRoleName(role.name);
              }}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
                internalRoleName === role.name
                  ? "bg-[#5069E5] text-white shadow-lg shadow-indigo-100"
                  : "bg-white text-gray-500 hover:text-gray-800 border border-gray-100"
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Feature</th>
                  {actions.map((action) => (
                    <th key={action.key} className="px-8 py-5 text-[11px] font-black text-center text-gray-500 uppercase tracking-wider">
                      {action.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {featureRows.map((feature) => (
                  <tr key={feature.name} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-gray-700">{feature.name}</span>
                    </td>
                    {actions.map((action) => {
                      const pId = feature.perms[action.key];
                      const isEnabled = pId && activePermissions[pId];
                      const exists = !!pId;

                      return (
                        <td key={action.key} className="px-8 py-5 text-center">
                          <button
                            type="button"
                            disabled={!exists || isSaving}
                            onClick={() => handleToggle(pId)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5069E5] focus:ring-offset-2 ${
                              isEnabled ? "bg-[#5069E5]" : "bg-gray-200"
                            } ${!exists ? "opacity-20 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                isEnabled ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


        {/* Action Button */}
        <div className="flex justify-start">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-12 py-4 bg-[#5069E5] text-white rounded-2xl font-bold hover:bg-[#3d52c7] transition-all shadow-xl shadow-indigo-100 disabled:opacity-70 flex items-center gap-3"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
