import React, { useState, useEffect } from 'react';
import { FaCheck, FaSave, FaCalendarWeek } from 'react-icons/fa';
import { apiFetch } from '../../libs/apiFetch';
import { toast } from 'react-toastify';

const DAYS_OF_WEEK = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

export default function Weekend() {
  const [selectedDays, setSelectedDays] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchWeekendSettings = async () => {
    setIsFetching(true);
    try {
      const response = await apiFetch('/profile', { method: 'GET' });
      const result = await response.json();

      if (response.ok && result.success) {
        if (result.data.user_details && result.data.user_details.weekend) {
          setSelectedDays(result.data.user_details.weekend);
        }
      } else {
        throw new Error(result.message || 'Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching weekend settings:', error);
      toast.error(error.message || 'Failed to load settings');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchWeekendSettings();
  }, []);

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const handleSave = async () => {
    console.log('handleSave triggered with:', selectedDays);
    setIsSaving(true);
    try {
      console.log('Sending request to /update-weekend...');
      const response = await apiFetch('/update-weekend', {
        method: 'POST',
        body: JSON.stringify({ weekend: selectedDays }),
      });
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response result:', result);

      if (response.ok && result.success) {
        toast.success('Weekend settings updated successfully');
      } else {
        throw new Error(result.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating weekend settings:', error);
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm min-h-[500px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaCalendarWeek className="text-[#5069E5]" />
            Weekend Settings
          </h2>
          <p className="text-gray-500 text-sm mt-1">Select the days that should be considered as your weekend.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || isFetching}
          className="flex items-center gap-2 px-6 py-3 bg-[#5069E5] text-white rounded-xl hover:bg-[#3d52c7] transition-all shadow-md hover:shadow-lg active:scale-95 font-semibold disabled:opacity-50"
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <FaSave size={16} />
          )}
          Save Settings
        </button>
      </div>

      {isFetching ? (
        <div className="flex flex-col justify-center items-center py-20 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5069E5]"></div>
          <p className="text-gray-500 font-medium">Loading settings...</p>
        </div>
      ) : (
        <div className="max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDays.includes(day);
              const isMaxSelected = selectedDays.length >= 2;
              const isDisabled = !isSelected && isMaxSelected;

              return (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  disabled={isDisabled}
                  className={`
                    flex items-center justify-between p-4 rounded-xl border-2 transition-all
                    ${
                      isSelected
                        ? 'border-[#5069E5] bg-[#F3F4FF] text-[#5069E5]'
                        : isDisabled
                        ? 'border-gray-50 bg-gray-50 text-gray-300 cursor-not-allowed'
                        : 'border-gray-100 hover:border-gray-300 text-gray-600'
                    }
                  `}
                >
                  <span className="font-semibold">{day}</span>
                  {isSelected && (
                    <div className="bg-[#5069E5] rounded-full p-1">
                      <FaCheck size={10} className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-blue-800 text-sm">
              <strong>Tip:</strong> You can select 1 or maximum 2 days as your weekend. These days will be marked as non-working days in your timesheet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
