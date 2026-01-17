import React, { useEffect, useState } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { BiNote } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../libs/apiFetch';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';

export default function CreateTimesheet() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    client: '2',
    file: null,
    startDate: '',
    endDate: '',
    emailTemplate: '',
    emailTo: 'example@gmail.com',
    emailSubject: 'Naresh Vyas timesheet',
    emailBody: '<p>Hello,</p><p>Timesheet is submit for client : R12</p><p>for time period: 09/15/2025 To 09/21/2025</p><p>Please check and approve.</p><p>Thank you.</p>',
    remark: '',
  });
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [remarkText, setRemarkText] = useState('');
  const [noteModalIndex, setNoteModalIndex] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState([]);
  const [isClientsLoading, setIsClientsLoading] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);

  const [timesheetEntries, setTimesheetEntries] = useState([]);

  const formatDisplayDate = (dateObj) => {
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const toISODate = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const buildEntriesForRange = (startDate, endDate) => {
    const entries = [];
    const current = new Date(startDate);
    const last = new Date(endDate);
    while (current <= last) {
      entries.push({
        date: formatDisplayDate(current),
        entryDate: toISODate(current),
        dailyHours: '00:00',
        extraHours: '00:00',
        vacations: '00:00',
        notes: '',
      });
      current.setDate(current.getDate() + 1);
    }
    return entries;
  };

  const timeToNumber = (value) => {
    if (!value) return 0;
    const [h = '0', m = '0'] = value.split(':');
    const hours = Number(h) || 0;
    const minutes = Number(m) || 0;
    const total = hours + minutes / 60;
    return Number.isFinite(total) ? total : 0;
  };

  const hoursOptions = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, '0')
  );
  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, '0')
  );

  const getTimeParts = (value) => {
    const [h = '00', m = '00'] = (value || '00:00').split(':');
    return { h: h.padStart(2, '0'), m: m.padStart(2, '0') };
  };

  const handleTimePartChange = (index, field, part, value) => {
    const { h, m } = getTimeParts(timesheetEntries[index]?.[field]);
    const next = part === 'h' ? `${value}:${m}` : `${h}:${value}`;
    handleTimesheetEntryChange(index, field, next);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (updated.startDate && updated.endDate) {
        const start = new Date(updated.startDate);
        const end = new Date(updated.endDate);
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
          const orderedStart = start <= end ? start : end;
          const orderedEnd = start <= end ? end : start;
          setTimesheetEntries(buildEntriesForRange(orderedStart, orderedEnd));
        }
      } else {
        setTimesheetEntries([]);
      }
      return updated;
    });
  };

  const handleTimesheetEntryChange = (index, field, value) => {
    const updated = [...timesheetEntries];
    updated[index][field] = value;
    setTimesheetEntries(updated);
  };

  const handleSetWeekdays = () => {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 6);

    setFormData(prev => ({
      ...prev,
      startDate: toISODate(start),
      endDate: toISODate(end),
    }));

    const updated = buildEntriesForRange(start, end).map(entry => ({
      ...entry,
      dailyHours: '08:00',
    }));
    setTimesheetEntries(updated);
    toast.success('Weekdays set to 8 hours');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiFetch('/profile', { method: 'GET' });
        if (!response.ok) return;
        const result = await response.json();
        if (result.success && result.data && result.data.id) {
          setCurrentUserId(result.data.id);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      setIsClientsLoading(true);
      try {
        const response = await apiFetch('/clients', { method: 'GET' });
        if (!response.ok) {
          throw new Error('Failed to load clients');
        }
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setClients(result.data);
          if (result.data.length && !formData.client) {
            setFormData(prev => ({ ...prev, client: String(result.data[0].id) }));
          }
        } else {
          setClients([]);
        }
      } catch (error) {
        console.error('Failed to load clients:', error);
        toast.error(error.message || 'Failed to load clients');
        setClients([]);
      } finally {
        setIsClientsLoading(false);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsTemplatesLoading(true);
      try {
        const response = await apiFetch('/email-template', { method: 'GET' });
        if (!response.ok) {
          throw new Error('Failed to load email templates');
        }
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setEmailTemplates(result.data);
          if (result.data.length && !formData.emailTemplate) {
            setFormData(prev => ({ ...prev, emailTemplate: String(result.data[0].id) }));
          }
        } else {
          setEmailTemplates([]);
        }
      } catch (error) {
        console.error('Failed to load email templates:', error);
        toast.error(error.message || 'Failed to load email templates');
        setEmailTemplates([]);
      } finally {
        setIsTemplatesLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleOpenRemarkModal = () => {
    setIsRemarkModalOpen(true);
  };

  const handleCloseRemarkModal = () => {
    setIsRemarkModalOpen(false);
  };

  const handleSaveRemark = () => {
    setFormData(prev => ({ ...prev, remark: remarkText.trim() }));
    setIsRemarkModalOpen(false);
    toast.success('Remark added');
  };

  const handleOpenNoteModal = (index) => {
    setNoteModalIndex(index);
    setNoteText(timesheetEntries[index]?.notes || '');
  };

  const handleCloseNoteModal = () => {
    setNoteModalIndex(null);
    setNoteText('');
  };

  const handleSaveNote = () => {
    if (noteModalIndex === null) return;
    const updated = [...timesheetEntries];
    updated[noteModalIndex] = {
      ...updated[noteModalIndex],
      notes: noteText.trim(),
    };
    setTimesheetEntries(updated);
    setNoteModalIndex(null);
    setNoteText('');
    toast.success('Note saved');
  };

  const handleSubmit = async () => {
    try {
      if (!formData.startDate || !formData.endDate) {
        toast.error('Please select start and end date');
        return;
      }
      if (!timesheetEntries.length) {
        toast.error('Please add at least one timesheet entry');
        return;
      }
      if (!currentUserId) {
        toast.error('User information not loaded yet');
        return;
      }

      setIsSubmitting(true);

      const payload = new FormData();
      payload.append('start_date', formData.startDate);
      payload.append('end_date', formData.endDate);
      payload.append('status', 'submitted');
      payload.append('remarks', formData.remark || '');
      payload.append('user_id', String(currentUserId));
      payload.append('client_id', String(formData.client));

      if (formData.file) {
        payload.append('file', formData.file);
      }

      if (formData.emailTemplate) {
        payload.append('mail_template_id', '1');
      }
      if (formData.emailTo) {
        payload.append('send_to', formData.emailTo);
      }

      timesheetEntries.forEach((entry, index) => {
        payload.append(`entries[${index}][entry_date]`, entry.entryDate || '');
        payload.append(
          `entries[${index}][daily_hours]`,
          String(timeToNumber(entry.dailyHours))
        );
        payload.append(
          `entries[${index}][extra_hours]`,
          String(timeToNumber(entry.extraHours))
        );
        payload.append(
          `entries[${index}][vacation_hours]`,
          String(timeToNumber(entry.vacations))
        );
        payload.append(`entries[${index}][note]`, entry.notes || '');
      });

      const response = await apiFetch('/timesheet', {
        method: 'POST',
        body: payload,
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        const message = result.message || result.error || 'Failed to submit timesheet';
        throw new Error(message);
      }

      toast.success('Timesheet submitted successfully');
      navigate('/timesheet');
    } catch (error) {
      console.error('Timesheet submit error:', error);
      toast.error(error.message || 'Failed to submit timesheet');
    } finally {
      setIsSubmitting(false);
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
                  {isClientsLoading && (
                    <option value="">Loading...</option>
                  )}
                  {!isClientsLoading && clients.length === 0 && (
                    <option value="">No clients found</option>
                  )}
                  {!isClientsLoading && clients.map((client) => (
                    <option key={client.id} value={String(client.id)}>
                      {client.name || `Client ${client.id}`}
                    </option>
                  ))}
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
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
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
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
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
              onClick={handleOpenRemarkModal}
              className="px-4 py-2 bg-white border border-[#5069E5] text-[#5069E5] rounded-lg hover:bg-[#E0E7FF] transition-colors font-medium"
            >
              Add remark
            </button>
          </div>

          {/* Timesheet Entry Table */}
          <div className="mb-6 overflow-x-auto">
            {timesheetEntries.length === 0 ? (
              <div className="h-40 border border-gray-300 rounded-lg bg-white"></div>
            ) : (
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
                  {timesheetEntries.map((entry, index) => {
                    const dailyParts = getTimeParts(entry.dailyHours);
                    const extraParts = getTimeParts(entry.extraHours);
                    const vacationParts = getTimeParts(entry.vacations);
                    return (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-800 border border-gray-300">{entry.date}</td>
                        <td className="px-4 py-2 border border-gray-300">
                          <div className="flex items-center gap-2">
                            <select
                              value={dailyParts.h}
                              onChange={(e) => handleTimePartChange(index, 'dailyHours', 'h', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                            >
                              {hoursOptions.map((h) => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                            <span className="text-gray-500">:</span>
                            <select
                              value={dailyParts.m}
                              onChange={(e) => handleTimePartChange(index, 'dailyHours', 'm', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                            >
                              {minuteOptions.map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-4 py-2 border border-gray-300">
                          <div className="flex items-center gap-2">
                            <select
                              value={extraParts.h}
                              onChange={(e) => handleTimePartChange(index, 'extraHours', 'h', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                            >
                              {hoursOptions.map((h) => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                            <span className="text-gray-500">:</span>
                            <select
                              value={extraParts.m}
                              onChange={(e) => handleTimePartChange(index, 'extraHours', 'm', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                            >
                              {minuteOptions.map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-4 py-2 border border-gray-300">
                          <div className="flex items-center gap-2">
                            <select
                              value={vacationParts.h}
                              onChange={(e) => handleTimePartChange(index, 'vacations', 'h', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                            >
                              {hoursOptions.map((h) => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                            <span className="text-gray-500">:</span>
                            <select
                              value={vacationParts.m}
                              onChange={(e) => handleTimePartChange(index, 'vacations', 'm', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                            >
                              {minuteOptions.map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center border border-gray-300">
                          {entry.notes ? (
                            <button
                              type="button"
                              onClick={() => handleOpenNoteModal(index)}
                              className="text-sm text-gray-700 hover:text-[#3d52c7] transition-colors"
                              title={entry.notes}
                            >
                              {entry.notes}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenNoteModal(index)}
                              className="text-[#5069E5] hover:text-[#3d52c7] transition-colors"
                            >
                              <BiNote size={20} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
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
                  {isTemplatesLoading && (
                    <option value="">Loading...</option>
                  )}
                  {!isTemplatesLoading && emailTemplates.length === 0 && (
                    <option value="">No templates found</option>
                  )}
                  {!isTemplatesLoading && emailTemplates.map((template) => (
                    <option key={template.id} value={String(template.id)}>
                      {template.name || template.subject || `Template ${template.id}`}
                    </option>
                  ))}
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
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-[#5069E5] text-white rounded-lg hover:bg-[#3d52c7] transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      {isRemarkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Add Remark
            </h3>
            <textarea
              rows={4}
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              placeholder="Write your remark..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5069E5]"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={handleCloseRemarkModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRemark}
                className="px-4 py-2 rounded-lg bg-[#5069E5] text-white hover:bg-[#3d52c7] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {noteModalIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Add Note
            </h3>
            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write your note..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5069E5]"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={handleCloseNoteModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 rounded-lg bg-[#5069E5] text-white hover:bg-[#3d52c7] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

