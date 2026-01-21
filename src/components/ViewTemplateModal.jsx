import React, { useState } from 'react';
import { FaTimes, FaCopy, FaCheck } from 'react-icons/fa';

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
      <div className="bg-gray-100 rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        <div className="bg-white rounded-lg m-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Template Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaTimes size={18} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs uppercase font-bold text-indigo-500 tracking-wider">Title</p>
                <button
                  onClick={() => handleCopy(template.name || 'Default template', 'title')}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors uppercase"
                >
                  {copiedField === 'title' ? (
                    <>
                      <FaCheck size={10} className="text-green-500" />
                      <span className="text-green-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <FaCopy size={10} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-semibold text-gray-900">
                {template.name || 'Default template'}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs uppercase font-bold text-indigo-500 tracking-wider">Body</p>
                <button
                  onClick={() => handleCopy(template.body || '', 'body')}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors uppercase"
                >
                  {copiedField === 'body' ? (
                    <>
                      <FaCheck size={10} className="text-green-500" />
                      <span className="text-green-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <FaCopy size={10} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 min-h-[150px] text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {template.body || 'No content available.'}
              </div>
            </div>

            {/* Permissions / Roles */}
            <div>
              <p className="text-xs uppercase font-bold text-indigo-500 tracking-wider mb-2">Permissions</p>
              <div className="flex flex-wrap gap-2">
                {assignedRoles.length > 0 ? (
                  assignedRoles.map((role, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {role.name}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm italic">No roles assigned</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#5069E5] text-white rounded-xl font-bold hover:bg-[#3d52c7] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTemplateModal;
