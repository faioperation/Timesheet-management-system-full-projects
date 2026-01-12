import React from 'react';
import { FaTimes } from 'react-icons/fa';

const ViewTemplateModal = ({ isOpen, onClose, template }) => {
  if (!isOpen || !template) return null;

  // Default template content if not provided
  const templateContent = template.body || `Hello,

Timesheet is submit for client : {{client_name}}
for time period: {{start_date}} To {{end_date}}

Please check and approve.

Thank you.`;

  // Convert HTML to plain text if needed (remove HTML tags)
  const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Check if content is HTML or plain text
  const isHtml = /<[a-z][\s\S]*>/i.test(templateContent);
  const displayContent = isHtml ? stripHtml(templateContent) : templateContent;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {template.name || 'Template Preview'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <div className="bg-white min-h-[400px]">
            <pre className="whitespace-pre-wrap font-sans text-gray-800 text-base leading-relaxed">
              {displayContent}
            </pre>
          </div>
        </div>

        {/* Footer - Close Button */}
        <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTemplateModal;

