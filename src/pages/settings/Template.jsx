import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import ReusableTable from '../../components/ReusableTable';
import CreateTemplateModal from '../../components/CreateTemplateModal';
import ViewTemplateModal from '../../components/ViewTemplateModal';

export default function Template() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Sample template data matching the image
  const templateData = [
    {
      id: 1,
      no: '01',
      name: 'Default template',
      type: 'Timesheet submit, {{start_date}} To {{end_date}}',
      subject: 'Timesheet submit, {{start_date}} To {{end_date}}',
      body: `Hello,

Timesheet is submit for client : {{client_name}}
for time period: {{start_date}} To {{end_date}}

Please check and approve.

Thank you.`,
    },
    {
      id: 2,
      no: '02',
      name: 'Timesheet resubmit',
      type: 'Timesheet submit, {{start_date}} To {{end_date}}',
      subject: 'Timesheet submit, {{start_date}} To {{end_date}}',
      body: `Hello,

Timesheet is submit for client : {{client_name}}
for time period: {{start_date}} To {{end_date}}

Please check and approve.

Thank you.`,
    },
    {
      id: 3,
      no: '03',
      name: 'Timesheet resubmit',
      type: 'Timesheet submit, {{start_date}} To {{end_date}}',
      subject: 'Timesheet submit, {{start_date}} To {{end_date}}',
      body: `Hello,

Timesheet is submit for client : {{client_name}}
for time period: {{start_date}} To {{end_date}}

Please check and approve.

Thank you.`,
    },
    {
      id: 4,
      no: '04',
      name: 'Timesheet resubmit',
      type: 'Timesheet submit, {{start_date}} To {{end_date}}',
      subject: 'Timesheet submit, {{start_date}} To {{end_date}}',
      body: `Hello,

Timesheet is submit for client : {{client_name}}
for time period: {{start_date}} To {{end_date}}

Please check and approve.

Thank you.`,
    },
    {
      id: 5,
      no: '05',
      name: 'Timesheet resubmit',
      type: 'Timesheet submit, {{start_date}} To {{end_date}}',
      subject: 'Timesheet submit, {{start_date}} To {{end_date}}',
      body: `Hello,

Timesheet is submit for client : {{client_name}}
for time period: {{start_date}} To {{end_date}}

Please check and approve.

Thank you.`,
    },
    {
      id: 6,
      no: '07',
      name: 'Timesheet resubmit',
      type: 'Timesheet submit, {{start_date}} To {{end_date}}',
      subject: 'Timesheet submit, {{start_date}} To {{end_date}}',
      body: `Hello,

Timesheet is submit for client : {{client_name}}
for time period: {{start_date}} To {{end_date}}

Please check and approve.

Thank you.`,
    },
    {
      id: 7,
      no: '08',
      name: 'Timesheet resubmit',
      type: 'Timesheet submit, {{start_date}} To {{end_date}}',
      subject: 'Timesheet submit, {{start_date}} To {{end_date}}',
      body: `Hello,

Timesheet is submit for client : {{client_name}}
for time period: {{start_date}} To {{end_date}}

Please check and approve.

Thank you.`,
    },
    {
      id: 8,
      no: '09',
      name: 'Timesheet resubmit',
      type: 'Timesheet submit, {{start_date}} To {{end_date}}',
      subject: 'Timesheet submit, {{start_date}} To {{end_date}}',
      body: `Hello,

Timesheet is submit for client : {{client_name}}
for time period: {{start_date}} To {{end_date}}

Please check and approve.

Thank you.`,
    },
    {
      id: 9,
      no: '10',
      name: 'Submission',
      type: 'Submission, {{start_date}} To {{end_date}}',
      subject: 'Submission, {{start_date}} To {{end_date}}',
      body: `Hello,

Timesheet is submit for client : {{client_name}}
for time period: {{start_date}} To {{end_date}}

Please check and approve.

Thank you.`,
    },
  ];

  const handleCreateTemplate = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
      <ReusableTable
        columns={columns}
        data={templateData}
        itemsPerPage={10}
        totalPages={25}
        onPageChange={handlePageChange}
        showPagination={true}
      />

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
