import React from 'react';
import { FaTrash, FaTimes } from 'react-icons/fa';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName, title = "Confirm Delete" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col scale-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTrash className="text-red-500" size={24} />
          </div>
          <p className="text-gray-600 text-lg mb-2">
            Are you sure you want to delete this {itemName}?
          </p>
          <p className="text-gray-400 text-sm">
            This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-3 p-5 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium min-w-[100px]"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium min-w-[100px]"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
