import React from 'react';
import { FaTimes } from 'react-icons/fa';

const ViewTemplateModal = ({ isOpen, onClose, template }) => {
  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-100 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-white rounded-lg m-2 p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Hey!</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4 mb-6">
            {/* Template Name */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Template Name</p>
              <p className="text-base text-gray-900 font-semibold">{template.name || 'Default template'}</p>
            </div>

            {/* Template Type */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Template type</p>
              <p className="text-base text-gray-900 font-semibold">{template.type || 'Timesheet submit'}</p>
            </div>

            {/* Subject */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Subject</p>
              <p className="text-base text-gray-900 font-semibold">{template.subject || 'Timesheet submit, {{start_date}} To {{end_date}}'}</p>
            </div>

            {/* Permission */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Permission</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  User
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Admin
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Supervisor
                </span>
              </div>
            </div>
          </div>

          {/* Footer - Dates */}
          <div className="flex justify-between items-end pt-4 border-t border-gray-200">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Start</p>
              <p className="text-sm font-semibold text-green-600">20 Nov 2025</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-gray-600 mb-1">End</p>
              <p className="text-sm font-semibold text-red-600">20 Dec 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTemplateModal;
