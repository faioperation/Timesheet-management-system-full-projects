import React, { useState } from 'react';
import { FaTimes, FaCopy, FaCheck, FaEnvelope } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

const ViewTemplateModal = ({ isOpen, onClose, template, roles = [] }) => {
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen || !template) return null;

  const usedBy = template.used_by || [];
  const assignedRoles = usedBy.map(item => {
    const roleId = typeof item === 'object' ? item.role_id : item;
    return roles.find(r => r.id === roleId);
  }).filter(Boolean);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <MdEmail className="text-white" size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">Email Template Preview</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Email Preview Container */}
          <div className="p-6 bg-gray-50">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Email Header Section */}
              <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 px-6 py-4">
                <div className="space-y-3">
                  {/* From */}
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">From:</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">TS</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Timesheet Management System</p>
                          <p className="text-xs text-gray-500">noreply@timesheet.com</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(template.name || 'Default template', 'title')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      {copiedField === 'title' ? (
                        <>
                          <FaCheck size={12} className="text-green-600" />
                          <span className="text-green-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <FaCopy size={12} />
                          <span>Copy Subject</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* To */}
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">To:</span>
                    <div className="flex-1">
                      <p className="text-gray-700">Recipients ({assignedRoles.length > 0 ? assignedRoles.map(r => r.name).join(', ') : 'All Users'})</p>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">Subject:</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-lg">{template.name || 'Default template'}</p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">Date:</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">{new Date().toLocaleString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Body Section */}
              <div className="px-6 py-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                    <FaEnvelope className="text-indigo-500" size={14} />
                    Message Content
                  </h3>
                  <button
                    onClick={() => handleCopy(template.body || '', 'body')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    {copiedField === 'body' ? (
                      <>
                        <FaCheck size={12} className="text-green-600" />
                        <span className="text-green-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <FaCopy size={12} />
                        <span>Copy Content</span>
                      </>
                    )}
                  </button>
                </div>
                
                {/* Email Body Content with Professional Styling */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200 min-h-[200px]">
                  <div className="prose prose-sm max-w-none">
                    <div className="text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">
                      {template.body || 'No content available.'}
                    </div>
                  </div>
                  
                  {/* Email Footer/Signature Simulation */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">Best regards,</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">Timesheet Management Team</p>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        This is an automated email from Timesheet Management System. Please do not reply to this email.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permissions Section */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Accessible to Roles:</p>
                    <div className="flex flex-wrap gap-2">
                      {assignedRoles.length > 0 ? (
                        assignedRoles.map((role, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm"
                          >
                            {role.name === 'Staff' ? 'Supervisor' : role.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm italic">No roles assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTemplateModal;
