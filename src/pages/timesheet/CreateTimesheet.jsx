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
    client: '',
    consultant: '',
    file: null,
    previewUrl: null,
    startDate: '',
    endDate: '',
    emailTemplate: '',
    emailTo: 'example@gmail.com',
    emailSubject: 'Naresh Vyas timesheet',
    emailBody: '<p>Hello,</p><p>Timesheet is submit for client : R12</p><p>for time period: 09/15/2025 To 09/21/2025</p><p>Please check and approve.</p><p>Thank you.</p>',
    remark: '',
    defaultTimesheetId: '',
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
  const [userRole, setUserRole] = useState('');
  const [consultants, setConsultants] = useState([]);
  const [isConsultantsLoading, setIsConsultantsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userDefaults, setUserDefaults] = useState([]);
  const [isDefaultsLoading, setIsDefaultsLoading] = useState(false);

  const [timesheetEntries, setTimesheetEntries] = useState([]);

  const formatDisplayDate = (dateObj) => {
    if (!dateObj || Number.isNaN(dateObj.getTime())) return '-';
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
    
    // Get user's weekend settings
    const weekendSettings = userProfile?.user_details?.weekend || ['Saturday', 'Sunday'];
    
    while (current <= last) {
      const dayName = current.toLocaleDateString('en-US', { weekday: 'long' });
      const isWeekend = weekendSettings.includes(dayName);
      const defaultDailyHours = isWeekend ? '00:00' : '08:00';

      entries.push({
        date: formatDisplayDate(current),
        entryDate: toISODate(current),
        dailyHours: defaultDailyHours,
        extraHours: '00:00',
        vacations: '00:00',
        notes: '',
      });
      current.setDate(current.getDate() + 1);
    }
    return entries;
  };

  const formatDecimalToTime = (decimal) => {
    if (decimal === undefined || decimal === null || isNaN(decimal)) return '00:00';
    const totalMinutes = Math.round(Number(decimal) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
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

    const sDate = toISODate(start);
    const eDate = toISODate(end);

    setFormData(prev => ({
      ...prev,
      startDate: sDate,
      endDate: eDate,
    }));

    // This now internally handles weekend 0h and workday 8h
    const updated = buildEntriesForRange(start, end);
    setTimesheetEntries(updated);
    toast.success('Hours set based on your weekend settings');
  };

  const handleFileChange = (file) => {
    if (!file) return;

    // Create preview URL
    const url = URL.createObjectURL(file);
    setFormData(prev => {
      // Clean up old preview URL if exists
      if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return { ...prev, file, previewUrl: url };
    });
  };

  const fetchUserDefaults = async (userId) => {
    if (!userId) return;
    setIsDefaultsLoading(true);
    try {
      const response = await apiFetch(`/user/${userId}/timesheet-defaults`, { method: 'GET' });
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setUserDefaults(result.data);
      } else {
        setUserDefaults([]);
      }
    } catch (error) {
      console.error('Failed to load user defaults:', error);
      setUserDefaults([]);
    } finally {
      setIsDefaultsLoading(false);
    }
  };

  const handleDefaultTimesheetChange = (id) => {
    const selected = userDefaults.find(d => String(d.id) === String(id));
    if (!selected) return;

    setFormData(prev => ({
      ...prev,
      defaultTimesheetId: id,
      startDate: selected.start_date || '',
      endDate: selected.end_date || '',
      client: selected.user_detail?.party_id ? String(selected.user_detail.party_id) : prev.client,
    }));

    if (selected.start_date && selected.end_date) {
      const start = new Date(selected.start_date);
      const end = new Date(selected.end_date);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const entries = [];
        const current = new Date(start);
        const last = new Date(end);

        while (current <= last) {
          const dayOfWeek = current.getDay(); // 0 (Sun) - 6 (Sat)
          const defaultEntry = selected.entries?.find(e => Number(e.day_of_week) === dayOfWeek);

          entries.push({
            date: formatDisplayDate(current),
            entryDate: toISODate(current),
            dailyHours: defaultEntry ? formatDecimalToTime(defaultEntry.default_daily_hours) : '00:00',
            extraHours: defaultEntry ? formatDecimalToTime(defaultEntry.default_extra_hours) : '00:00',
            vacations: defaultEntry ? formatDecimalToTime(defaultEntry.default_vacation_hours) : '00:00',
            notes: defaultEntry?.note || '',
          });
          current.setDate(current.getDate() + 1);
        }
        setTimesheetEntries(entries);
      }
    }
    toast.success('Loaded from default timesheet');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiFetch('/profile', { method: 'GET' });
        if (!response.ok) return;
        const result = await response.json();
        if (result.success && result.data && result.data.id) {
          setCurrentUserId(result.data.id);
          setUserProfile(result.data);
          // Set role from cookie or response
          const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(";").shift();
            return null;
          };
          const role = getCookie('user_role');
          setUserRole(role || '');

          // Populate email if user is a Consultant
          if (role === 'User' && result.data.email) {
            setFormData(prev => ({ ...prev, emailTo: result.data.email }));
          }
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
          // Only auto-select client if user role is 'User'
          const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(";").shift();
            return null;
          };
          const role = getCookie('user_role');
          if (result.data.length && !formData.client && role === 'User') {
            setFormData(prev => ({ ...prev, client: String(result.data[0].id) }));
          }
        } else {
          setClients([]);
        }
      } catch (error) {
        console.error('Failed to load clients:', error);
        setClients([]);
      } finally {
        setIsClientsLoading(false);
      }
    };

    fetchClients();
  }, [formData.client]); // Added dependency to re-run if client cleared

  useEffect(() => {
    const fetchConsultants = async () => {
      if (userRole === 'User') return;
      setIsConsultantsLoading(true);
      try {
        const response = await apiFetch('/users', { method: 'GET' });
        if (!response.ok) throw new Error('Failed to load users');
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          // Filter to only include 'User' role (consultants)
          const filtered = result.data.filter(u =>
            u.roles && u.roles.some(r => r.name === 'User')
          );
          setConsultants(filtered);
        }
      } catch (error) {
        console.error('Consultant load error:', error);
      } finally {
        setIsConsultantsLoading(false);
      }
    };

    if (userRole && userRole !== 'User') {
      fetchConsultants();
    }
  }, [userRole]);

  useEffect(() => {
    if (userRole === 'User' && currentUserId) {
      fetchUserDefaults(currentUserId);
    }
  }, [userRole, currentUserId]);

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (formData.previewUrl) URL.revokeObjectURL(formData.previewUrl);
    };
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

  const replacePlaceholders = (text, data) => {
    if (!text) return '';
    let result = text;
    
    // Find client name
    const client = clients.find(c => String(c.id) === String(data.client));
    const clientName = client ? client.name : 'Client';
    
    // Find consultant name
    let consultantName = '';
    if (userRole === 'Business Admin' || userRole === 'Staff') {
      const cons = consultants.find(u => String(u.id) === String(data.consultant));
      consultantName = cons ? cons.name : 'Consultant';
    } else {
      consultantName = userProfile ? userProfile.name : 'Consultant';
    }

    const placeholders = {
      '{{ User first name }}': consultantName.split(' ')[0],
      '{{ User last name }}': consultantName.split(' ').slice(1).join(' ') || '',
      '{{ Client name }}': clientName,
      '{{ Start date }}': data.startDate || '',
      '{{ End date }}': data.endDate || '',
      '{{ Signature }}': consultantName,
      '{{ Private signature }}': consultantName,
    };

    Object.entries(placeholders).forEach(([key, value]) => {
      result = result.split(key).join(value || '');
    });

    return result;
  };

  const handleEmailTemplateChange = (templateId) => {
    handleInputChange('emailTemplate', templateId);
    const template = emailTemplates.find(t => String(t.id) === String(templateId));
    if (template) {
      const subject = replacePlaceholders(template.subject || '', formData);
      const bodyText = replacePlaceholders(template.body || '', formData);
      // Wrap plain text in HTML for ReactQuill
      const bodyHtml = bodyText.includes('<p>') 
        ? bodyText 
        : `<p>${bodyText.replace(/\n/g, '<br/>')}</p>`;
      
      setFormData(prev => ({
        ...prev,
        emailTemplate: templateId,
        emailSubject: subject,
        emailBody: bodyHtml,
      }));
      toast.info('Template applied');
    }
  };

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

      // If Admin/Staff, use selected consultant ID, else use current user ID
      const targetUserId = (userRole === 'Business Admin' || userRole === 'Staff')
        ? formData.consultant
        : currentUserId;

      if (!targetUserId) {
        toast.error('Please select a consultant');
        return;
      }

      payload.append('user_id', String(targetUserId));
      payload.append('client_id', String(formData.client));

      if (formData.file) {
        payload.append('file', formData.file);
      }

      if (formData.emailTemplate) {
        payload.append('mail_template_id', String(formData.emailTemplate));
      }
      if (formData.emailTo) {
        payload.append('send_to', formData.emailTo);
      }
      if (formData.emailSubject) {
        payload.append('subject', formData.emailSubject);
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

              {/* Folder Icon Placeholder if no file */}
              {!formData.file && (
                <div className="relative z-10">
                  <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 40 L70 40 L85 55 L170 55 L170 140 L30 140 Z" fill="#E0E7FF" stroke="#C7D2FE" strokeWidth="2" />
                    <path d="M30 40 L70 40 L85 25 L120 25 L120 40 L70 40" fill="#10B981" stroke="#059669" strokeWidth="2" />
                    <rect x="40" y="65" width="120" height="65" rx="2" fill="white" stroke="#E5E7EB" strokeWidth="1" />
                    <rect x="45" y="75" width="110" height="50" rx="2" fill="white" stroke="#E5E7EB" strokeWidth="1" />
                  </svg>
                </div>
              )}

              {/* File Preview */}
              {formData.file && formData.previewUrl && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4">
                  {formData.file.type === 'application/pdf' ? (
                    <iframe
                      src={formData.previewUrl}
                      title="PDF Preview"
                      className="w-full h-full border-none"
                    />
                  ) : formData.file.type.startsWith('image/') ? (
                    <img
                      src={formData.previewUrl}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain shadow-md rounded"
                    />
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-600 font-medium">{formData.file.name}</p>
                      <p className="text-sm text-gray-400">Preview not available for this file type</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
          {/* Client and Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Role-based selection: User (Consultant) for Admins */}
            {(userRole === 'Business Admin' || userRole === 'Staff') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User (Consultant)</label>
                <div className="relative">
                  <select
                    value={formData.consultant}
                    onChange={(e) => {
                      const userId = e.target.value;
                      handleInputChange('consultant', userId);
                      fetchUserDefaults(userId);

                      // Find selected user's email to auto-populate "To" field
                      const selectedUser = consultants.find(u => String(u.id) === String(userId));
                      if (selectedUser && selectedUser.email) {
                        handleInputChange('emailTo', selectedUser.email);
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                  >
                    <option value="">Select consultant</option>
                    {isConsultantsLoading && <option disabled>Loading consultants...</option>}
                    {consultants.map((u) => (
                      <option key={u.id} value={String(u.id)}>{u.name}</option>
                    ))}
                  </select>
                  <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
              </div>
            )}

            {/* Default Timesheet Selection - Required to populate dates and client */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Timesheet</label>
              <div className="relative">
                <select
                  value={formData.defaultTimesheetId}
                  onChange={(e) => handleDefaultTimesheetChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                >
                  <option value="">Select default timesheet</option>
                  {isDefaultsLoading && <option disabled>Loading defaults...</option>}
                  {userDefaults.map((d) => (
                    <option key={d.id} value={String(d.id)}>
                      Default ({d.start_date} to {d.end_date})
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
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-500 cursor-pointer hover:border-[#5069E5] transition-colors flex items-center justify-between">
                    <span>{formData.file ? formData.file.name : 'No file choosen'}</span>
                    <IoMdArrowDropdown className="text-gray-500" size={20} />
                  </div>
                </label>
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
                    onChange={(e) => handleEmailTemplateChange(e.target.value)}
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

