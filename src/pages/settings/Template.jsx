import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import ReusableTable from '../../components/ReusableTable';
import CreateTemplateModal from '../../components/CreateTemplateModal';
import ViewTemplateModal from '../../components/ViewTemplateModal';
import { apiFetch } from '../../libs/apiFetch';
import { toast } from 'react-toastify';

export default function Template() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

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
          used_by: item.used_by || []
        }));
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

  useEffect(() => {
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
      render: () => (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Admin
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            User
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Supervisor
          </span>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      className: 'text-left',
      render: (row) => (
        <button
          onClick={() => handleViewTemplate(row)}
          className="text-[#5069E5] hover:text-[#3d52c7] font-medium transition-colors"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header with Create Template Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleCreateTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-[#5069E5] text-white rounded-lg hover:bg-[#3d52c7] transition-colors font-medium"
        >
          <FaPlus size={14} />
          Create template
        </button>
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
      />
    </div>
  );
}
