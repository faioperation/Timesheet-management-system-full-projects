import React, { useState } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { BiNote } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../libs/apiFetch';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function CreateTimesheet() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    client: 'Naresh Vyas',
    file: null,
    startDate: '15 Sep 2025',
    endDate: '21 Sep 2025',
    emailTemplate: 'Example.file',
    emailTo: 'example@gmail.com',
    emailSubject: 'Naresh Vyas timesheet',
    emailBody: '<p>Hello,</p><p>Timesheet is submit for client : R12</p><p>for time period: 09/15/2025 To 09/21/2025</p><p>Please check and approve.</p><p>Thank you.</p>',
  });

  const [timesheetEntries, setTimesheetEntries] = useState([
    { date: '15 Sep 2025', dailyHours: '8:30', extraHours: '8:30', vacations: '8:30', notes: '' },
    { date: '16 Sep 2025', dailyHours: '8:30', extraHours: '8:30', vacations: '8:30', notes: '' },
    { date: '17 Sep 2025', dailyHours: '8:30', extraHours: '8:30', vacations: '8:30', notes: '' },
    { date: '18 Sep 2025', dailyHours: '8:30', extraHours: '8:30', vacations: '8:30', notes: '' },
    { date: '19 Sep 2025', dailyHours: '8:30', extraHours: '8:30', vacations: '8:30', notes: '' },
    { date: '20 Sep 2025', dailyHours: '8:30', extraHours: '8:30', vacations: '8:30', notes: '' },
    { date: '21 Sep 2025', dailyHours: '8:30', extraHours: '8:30', vacations: '8:30', notes: '' },
  ]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTimesheetEntryChange = (index, field, value) => {
    const updated = [...timesheetEntries];
    updated[index][field] = value;
    setTimesheetEntries(updated);
  };

  const handleSetWeekdays = () => {
    const updated = timesheetEntries.map(entry => ({
      ...entry,
      dailyHours: '8:00',
    }));
    setTimesheetEntries(updated);
    toast.success('Weekdays set to 8 hours');
  };

  const handleSubmit = async () => {
    try {
      // API call to submit timesheet
      // await apiFetch('/timesheet/create', { method: 'POST', body: JSON.stringify({ ...formData, entries: timesheetEntries }) });
      toast.success('Timesheet submitted successfully');
      navigate('/timesheet');
    } catch (error) {
      toast.error('Failed to submit timesheet');
    }
  };

  return (
    <div className="w-full pb-10">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Section - Preview */}
        <div className="w-full lg:w-[400px] flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Preview</h3>
            <div className="bg-[#F3F4F6] rounded-lg p-8 min-h-[400px] flex items-center justify-center relative overflow-hidden">
              {/* Watermark background pattern */}
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)',
              }}></div>
              
              {/* Folder Icon */}
              <div className="relative z-10">
                <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Folder body */}
                  <path d="M30 40 L70 40 L85 55 L170 55 L170 140 L30 140 Z" fill="#E0E7FF" stroke="#C7D2FE" strokeWidth="2"/>
                  {/* Folder tab */}
                  <path d="M30 40 L70 40 L85 25 L120 25 L120 40 L70 40" fill="#10B981" stroke="#059669" strokeWidth="2"/>
                  {/* Documents inside */}
                  <rect x="40" y="65" width="120" height="65" rx="2" fill="white" stroke="#E5E7EB" strokeWidth="1"/>
                  <rect x="45" y="75" width="110" height="50" rx="2" fill="white" stroke="#E5E7EB" strokeWidth="1"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
          {/* Client and Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
              <div className="relative">
                <select
                  value={formData.client}
                  onChange={(e) => handleInputChange('client', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                >
                  <option value="Naresh Vyas">Naresh Vyas</option>
                </select>
                <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
              <div className="relative">
                <label className="block">
                  <input
                    type="file"
                    onChange={(e) => handleInputChange('file', e.target.files[0])}
                    className="hidden"
                  />
                  <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-500 cursor-pointer hover:border-[#5069E5] transition-colors flex items-center justify-between">
                    <span>{formData.file ? formData.file.name : 'No file choosen'}</span>
                    <IoMdArrowDropdown className="text-gray-500" size={20} />
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800 pr-10"
                />
                <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800 pr-10"
                />
                <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleSetWeekdays}
              className="px-4 py-2 bg-[#5069E5] text-white rounded-lg hover:bg-[#3d52c7] transition-colors font-medium"
            >
              Set weekdays 8 hour
            </button>
            <button
              className="px-4 py-2 bg-white border border-[#5069E5] text-[#5069E5] rounded-lg hover:bg-[#E0E7FF] transition-colors font-medium"
            >
              Add remark
            </button>
          </div>

          {/* Timesheet Entry Table */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">Daily hours</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">Extra hours</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">Vacations</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-300">Notes</th>
                </tr>
              </thead>
              <tbody>
                {timesheetEntries.map((entry, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-800 border border-gray-300">{entry.date}</td>
                    <td className="px-4 py-2 border border-gray-300">
                      <div className="relative">
                        <input
                          type="time"
                          value={entry.dailyHours}
                          onChange={(e) => handleTimesheetEntryChange(index, 'dailyHours', e.target.value)}
                          className="w-full px-3 py-1.5 border-none focus:outline-none text-sm"
                        />
                        <IoMdArrowDropdown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <div className="relative">
                        <input
                          type="time"
                          value={entry.extraHours}
                          onChange={(e) => handleTimesheetEntryChange(index, 'extraHours', e.target.value)}
                          className="w-full px-3 py-1.5 border-none focus:outline-none text-sm"
                        />
                        <IoMdArrowDropdown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <div className="relative">
                        <input
                          type="time"
                          value={entry.vacations}
                          onChange={(e) => handleTimesheetEntryChange(index, 'vacations', e.target.value)}
                          className="w-full px-3 py-1.5 border-none focus:outline-none text-sm"
                        />
                        <IoMdArrowDropdown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center border border-gray-300">
                      <button className="text-[#5069E5] hover:text-[#3d52c7] transition-colors">
                        <BiNote size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Email Composition Section */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Template</label>
                <div className="relative">
                  <select
                    value={formData.emailTemplate}
                    onChange={(e) => handleInputChange('emailTemplate', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                  >
                    <option value="Example.file">Example.file</option>
                  </select>
                  <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <input
                  type="email"
                  value={formData.emailTo}
                  onChange={(e) => handleInputChange('emailTo', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={formData.emailSubject}
                  onChange={(e) => handleInputChange('emailSubject', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                />
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <ReactQuill
                theme="snow"
                value={formData.emailBody}
                onChange={(value) => handleInputChange('emailBody', value)}
                modules={{
                  toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['script', { script: 'sub' }, { script: 'super' }],
                    [{ 'color': [] }],
                    [{ 'size': ['13', '14', '16', '18', '20'] }],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                    ['link'],
                    ['clean']
                  ],
                }}
                formats={[
                  'bold', 'italic', 'underline', 'strike',
                  'script', 'color', 'size',
                  'list', 'bullet', 'align',
                  'link'
                ]}
                style={{
                  height: '200px',
                  marginBottom: '50px'
                }}
                className="rich-text-editor"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-3 bg-[#5069E5] text-white rounded-lg hover:bg-[#3d52c7] transition-colors font-medium"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

