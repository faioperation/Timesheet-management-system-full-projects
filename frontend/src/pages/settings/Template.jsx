import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import ReusableTable from '../../components/ReusableTable';
import CreateTemplateModal from '../../components/CreateTemplateModal';
import UpdateTemplateModal from '../../components/UpdateTemplateModal';
import ViewTemplateModal from '../../components/ViewTemplateModal';
import { apiFetch } from '../../libs/apiFetch';
import { toast } from 'react-toastify';

export default function Template() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const userRole = getCookie("user_role");
  const canModify =
    userRole === "Business Admin" ||
    userRole === "Staff" ||
    userRole === "supervisor";
  const canDelete = userRole === "Business Admin";

  const fetchTemplates = async () => {
    setIsFetching(true);
    try {
      const response = await apiFetch('/email-template', { method: 'GET' });
      const result = await response.json();

      if (response.ok && result.success) {
        // Map API data to our table structure if needed
        const mappedData = (result.data || []).map((item, index) => ({
          id: item.id,
          no: (index + 1).toString().padStart(2, '0'),
          name: item.template_name,
          type: item.template_type,
          subject: item.subject,
          body: item.body,
          business_id: item.business_id, // Include business_id
          used_by: item.used_by || item.usedBy || []
        }));
        console.log('Templates raw data:', result.data);
        console.log('Templates mapped data:', mappedData);
        setTemplates(mappedData);
      } else {
        throw new Error(result.message || 'Failed to fetch templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error(error.message || 'Failed to load templates');
    } finally {
      setIsFetching(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await apiFetch('/roles', { method: 'GET' });
      const result = await response.json();
      if (response.ok && result.success) {
        setRoles(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchTemplates();
  }, []);

  const handleCreateTemplate = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = (refresh = false) => {
    setIsModalOpen(false);
    if (refresh === true) {
      fetchTemplates();
    }
  };

  const handleViewTemplate = (template) => {
    setSelectedTemplate(template);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleUpdateTemplate = (template) => {
    setSelectedTemplate(template);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = (refresh = false) => {
    setIsUpdateModalOpen(false);
    setSelectedTemplate(null);
    if (refresh === true) {
      fetchTemplates();
    }
  };

  const handleDeleteTemplate = async (template) => {
    if (!window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      return;
    }

    try {
      const response = await apiFetch(`/email-template/${template.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (response.ok && result.success) {
        toast.success('Template deleted successfully');
        fetchTemplates();
      } else {
        throw new Error(result.message || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error(error.message || 'Failed to delete template');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Fetch data for the page here
  };

  const columns = [
    {
      key: 'no',
      label: 'No',
      className: 'text-left',
    },
    {
      key: 'name',
      label: 'Template name',
      className: 'text-left',
    },
    {
      key: 'type',
      label: 'Template type',
      className: 'text-left',
    },
    {
      key: 'subject',
      label: 'Subject',
      className: 'text-left',
    },
    {
      key: 'permission',
      label: 'Permission',
      className: 'text-left',
      render: (row) => {
        const usedBy = row.used_by || [];

        // Helper to get consistent colors for tags
        const getTagStyles = (roleId) => {
          const styles = [
            'bg-yellow-100 text-yellow-800',
            'bg-blue-100 text-blue-800',
            'bg-green-100 text-green-800',
            'bg-purple-100 text-purple-800',
            'bg-pink-100 text-pink-800',
            'bg-orange-100 text-orange-800',
          ];
          return styles[roleId % styles.length] || styles[0];
        };

        return (
          <div className="flex items-center gap-2 flex-wrap">
            {usedBy.map((item, idx) => {
              // Row's used_by can be IDs or objects with role_id
              const roleId = typeof item === 'object' ? item.role_id : item;
              const role = roles.find(r => r.id === roleId);

              if (!role) return null;

              return (
                <span key={idx} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagStyles(roleId)}`}>
                  {role.name === 'Staff' ? 'Supervisor' : role.name}
                </span>
              );
            })}
            {usedBy.length === 0 && <span className="text-gray-400 text-xs italic">No roles assigned</span>}
          </div>
        );
      },
    },
    {
      key: 'action',
      label: 'Action',
      className: 'text-left',
      render: (row) => {
        // Check if this is a default template (business_id = null)
        const isDefaultTemplate = row.business_id === null;
        
        return (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleViewTemplate(row)}
              className="text-[#5069E5] hover:text-[#3d52c7] font-medium transition-colors"
            >
              View
            </button>
            {/* Only show Update button for business templates (not default) */}
            {canModify && !isDefaultTemplate && (
              <button
                onClick={() => handleUpdateTemplate(row)}
                className="text-green-600 hover:text-green-800 font-medium transition-colors"
              >
                Update
              </button>
            )}
            {/* Only show Delete button for business templates (not default) */}
            {canDelete && !isDefaultTemplate && (
              <button
                onClick={() => handleDeleteTemplate(row)}
                className="text-red-600 hover:text-red-800 font-medium transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      {/* Header with Create Template Button */}
      <div className="flex justify-end mb-6">
        {canModify && (
          <button
            onClick={handleCreateTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-[#5069E5] text-white rounded-lg hover:bg-[#3d52c7] transition-colors font-medium"
          >
            <FaPlus size={14} />
            Create template
          </button>
        )}
      </div>

      {/* Reusable Table */}
      {isFetching ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-gray-500 font-medium">Loading templates...</p>
        </div>
      ) : (
        <ReusableTable
          columns={columns}
          data={templates}
          itemsPerPage={10}
          onPageChange={handlePageChange}
          showPagination={true}
        />
      )}

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* View Template Modal */}
      <ViewTemplateModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        template={selectedTemplate}
        roles={roles}
      />

      {/* Update Template Modal */}
      {isUpdateModalOpen && (
        <UpdateTemplateModal
          isOpen={isUpdateModalOpen}
          onClose={handleCloseUpdateModal}
          template={selectedTemplate}
        />
      )}
    </div>
  );
}
