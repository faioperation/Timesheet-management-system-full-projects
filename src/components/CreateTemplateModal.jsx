import React, { useState } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { FaTimes, FaArrowRight } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';

const CreateTemplateModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    parameterInsertOn: 'Subject', // 'Subject' or 'template'
    templateType: 'Timesheet submit',
    templateName: 'Timesheet Name',
    usedBy: {
      admin: false,
      user: false,
      supervisor: false,
    },
    subject: 'This is subject {{ Client name }}',
    templateBody: '<p>Hello,</p><p>Timesheet is submit for client: {{ User First name }}</p><p>for time period: 09/15/2025 To 09/21/2025</p><p>Please check and approve.</p><p>Thank you.</p>',
  });

  const parameters = [
    { label: 'User first name', placeholder: 'User First name' },
    { label: 'User last name', placeholder: 'User Last name' },
    { label: 'Client name', placeholder: 'Client name' },
    { label: 'Start date', placeholder: 'Start date' },
    { label: 'End date', placeholder: 'End date' },
    { label: 'Timesheet rejected by first name', placeholder: 'Timesheet rejected by first name' },
    { label: 'Timesheet rejected by last name', placeholder: 'Timesheet rejected by last name' },
    { label: 'Signature', placeholder: 'Signature' },
    { label: 'Private signature', placeholder: 'Private signature' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({
      ...prev,
      usedBy: {
        ...prev.usedBy,
        [field]: !prev.usedBy[field],
      },
    }));
  };

  const handleParameterClick = (param) => {
    const placeholder = `{{ ${param.placeholder} }}`;
    if (formData.parameterInsertOn === 'Subject') {
      handleInputChange('subject', formData.subject + ' ' + placeholder);
    } else {
      const currentBody = formData.templateBody;
      // Insert placeholder at cursor position or at the end
      const newBody = currentBody.replace(/<\/p>$/, ' ' + placeholder + '</p>');
      handleInputChange('templateBody', newBody);
    }
  };

  const handleSave = () => {
    // Save logic here
    console.log('Save template:', formData);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'color': [] }],
      [{ 'size': ['13', '14', '16', '18', '20'] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'table'],
      ['clean'],
    ],
  };

  const quillFormats = [
    'bold', 'italic', 'underline', 'script', 'color', 'size',
    'list', 'bullet', 'align', 'link', 'table',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left Section - Parameter Insert on */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Parameter Insert on
              </h3>
              
              {/* Radio Buttons */}
              <div className="space-y-3 mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="parameterInsertOn"
                    value="Subject"
                    checked={formData.parameterInsertOn === 'Subject'}
                    onChange={(e) => handleInputChange('parameterInsertOn', e.target.value)}
                    className="w-4 h-4 text-[#5069E5] focus:ring-[#5069E5] focus:ring-2"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Subject</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="parameterInsertOn"
                    value="template"
                    checked={formData.parameterInsertOn === 'template'}
                    onChange={(e) => handleInputChange('parameterInsertOn', e.target.value)}
                    className="w-4 h-4 text-[#5069E5] focus:ring-[#5069E5] focus:ring-2"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">template</span>
                </label>
              </div>

              {/* Parameter List */}
              <div className="space-y-2">
                {parameters.map((param, index) => (
                  <button
                    key={index}
                    onClick={() => handleParameterClick(param)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaArrowRight size={12} className="text-gray-400" />
                    <span>{param.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Section - Template Editor */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 space-y-6">
              {/* Template Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template type<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.templateType}
                    onChange={(e) => handleInputChange('templateType', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800 pr-10 appearance-none cursor-pointer"
                  >
                    <option value="Timesheet submit">Timesheet submit</option>
                    <option value="Timesheet resubmit">Timesheet resubmit</option>
                    <option value="Submission">Submission</option>
                  </select>
                  <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
              </div>

              {/* Template Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.templateName}
                  onChange={(e) => handleInputChange('templateName', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                />
              </div>

              {/* Template is used by */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Template is used by
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.usedBy.admin}
                      onChange={() => handleCheckboxChange('admin')}
                      className="w-4 h-4 text-[#5069E5] border-gray-300 rounded focus:ring-[#5069E5] focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">Admin</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.usedBy.user}
                      onChange={() => handleCheckboxChange('user')}
                      className="w-4 h-4 text-[#5069E5] border-gray-300 rounded focus:ring-[#5069E5] focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">User</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.usedBy.supervisor}
                      onChange={() => handleCheckboxChange('supervisor')}
                      className="w-4 h-4 text-[#5069E5] border-gray-300 rounded focus:ring-[#5069E5] focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">Supervisor</span>
                  </label>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                  placeholder="This is subject {{ Client name }}"
                />
              </div>

              {/* Template Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={formData.templateBody}
                    onChange={(value) => handleInputChange('templateBody', value)}
                    modules={quillModules}
                    formats={quillFormats}
                    className="h-64"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Buttons */}
        <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#5069E5] text-white rounded-lg hover:bg-[#3d52c7] transition-colors font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTemplateModal;

