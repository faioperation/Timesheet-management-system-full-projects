import React, { useState, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import { apiFetch } from '../libs/apiFetch';
import { toast } from 'react-toastify';

export default function UpdateHolidayModal({ isOpen, onClose, holiday }) {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'public',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (holiday) {
      setFormData({
        name: holiday.name || '',
        date: holiday.date || '',
        type: holiday.type || 'public',
        description: holiday.description || ''
      });
    }
  }, [holiday]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiFetch(`/holiday/${holiday.id}`, {
        method: 'POST', // Backend update route uses POST with ID
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || 'Holiday updated successfully');
        onClose(true);
      } else {
        throw new Error(result.message || 'Failed to update holiday');
      }
    } catch (error) {
      console.error('Error updating holiday:', error);
      toast.error(error.message || 'An error occurred while updating the holiday');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Update Holiday</h2>
          <button 
            onClick={() => onClose(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoMdClose size={24} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Holiday Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5069E5] focus:border-transparent outline-none transition-all"
              placeholder="e.g. Independence Day"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5069E5] focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, type: 'public' }))}
                className={`py-2 px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                  formData.type === 'public' 
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                    : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                }`}
              >
                Public
              </button>
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, type: 'company' }))}
                className={`py-2 px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                  formData.type === 'company' 
                    ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm' 
                    : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                }`}
              >
                Company
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5069E5] focus:border-transparent outline-none transition-all resize-none"
              placeholder="Short description of the holiday..."
            ></textarea>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update Holiday'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
