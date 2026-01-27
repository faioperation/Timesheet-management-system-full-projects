import React, { useState, useEffect } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { FaTimes, FaArrowRight } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import { apiFetch } from '../libs/apiFetch';
import { toast } from 'react-toastify';

const UpdateTemplateModal = ({ isOpen, onClose, template }) => {
    const [formData, setFormData] = useState({
        parameterInsertOn: 'Subject',
        templateType: 'submit',
        templateName: '',
        used_by: [], // IDs
        subject: '',
        templateBody: '',
    });

    const [roles, setRoles] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // Initialize with template data
    useEffect(() => {
        if (isOpen && template) {
            // If template.used_by is objects, map to IDs
            const usedByIDs = (template.used_by || []).map(item => {
                const id = typeof item === 'object' ? item.role_id : item;
                return Number(id);
            });

            setFormData({
                parameterInsertOn: 'Subject',
                templateType: template.type || template.template_type || 'submit',
                templateName: template.name || template.template_name || '',
                used_by: usedByIDs,
                subject: template.subject || '',
                templateBody: template.body || '',
            });
            setIsDataLoaded(true);
        }
    }, [isOpen, template]);

    // Fetch roles
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await apiFetch('/roles', { method: 'GET' });
                const result = await response.json();
                if (response.ok && result.success) {
                    setRoles(result.data || []);
                }
            } catch (err) {
                console.error('Error fetching roles:', err);
            }
        };
        if (isOpen) fetchRoles();
    }, [isOpen]);

    const parameters = [
        { label: 'User first name', placeholder: 'User first name' },
        { label: 'User last name', placeholder: 'User last name' },
        { label: 'Client name', placeholder: 'Client name' },
        { label: 'Start date', placeholder: 'Start date' },
        { label: 'End date', placeholder: 'End date' },
        { label: 'Timesheet rejected by first name', placeholder: 'Timesheet rejected by first name' },
        { label: 'Timesheet rejected by last name', placeholder: 'Timesheet rejected by last name' },
        { label: 'Signature', placeholder: 'Signature' },
        { label: 'Private signature', placeholder: 'Private signature' },
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCheckboxChange = (roleId) => {
        setFormData(prev => {
            const isSelected = prev.used_by.includes(Number(roleId));
            if (isSelected) {
                return { ...prev, used_by: prev.used_by.filter(id => Number(id) !== Number(roleId)) };
            } else {
                return { ...prev, used_by: [...prev.used_by, Number(roleId)] };
            }
        });
    };

    const handleParameterClick = (param) => {
        const placeholder = `{{ ${param.placeholder} }}`;
        if (formData.parameterInsertOn === 'Subject') {
            handleInputChange('subject', formData.subject + ' ' + placeholder);
        } else {
            const currentBody = formData.templateBody;
            const newBody = currentBody.replace(/<\/p>$/, ' ' + placeholder + '</p>');
            const finalBody = currentBody === '' ? `<p>${placeholder}</p>` : newBody;
            handleInputChange('templateBody', finalBody);
        }
    };

    const stripHtml = (html) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    const handleSave = async () => {
        if (!formData.templateName || !formData.subject || !formData.templateType) {
            toast.warning('Please fill in all required fields');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                template_name: formData.templateName,
                template_type: formData.templateType,
                subject: formData.subject,
                body: stripHtml(formData.templateBody),
                used_by: formData.used_by
            };

            console.log('Final Update Payload:', payload);

            const response = await apiFetch(`/email-template/${template.id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (response.ok && result.success) {
                toast.success('Template updated successfully');
                onClose(true); // Close and refresh
            } else {
                const errorDetail = result.errors
                    ? Object.values(result.errors).flat().join(', ')
                    : result.message || 'Failed to update template';
                throw new Error(errorDetail);
            }
        } catch (error) {
            console.error('Error updating template:', error);
            toast.error(error.message || 'Error updating template');
        } finally {
            setIsSaving(false);
        }
    };

    const quillModules = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'color': [] }],
            [{ 'size': ['13', '14', '16', '18', '20'] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['link', 'table'],
            ['clean'],
        ],
    };

    const quillFormats = [
        'bold', 'italic', 'underline', 'script', 'color', 'size',
        'list', 'bullet', 'align', 'link', 'table',
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Update Template</h2>
                    <button onClick={() => onClose()} className="text-gray-500 hover:text-gray-700">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Left Section - Parameter Insert on */}
                        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Parameter Insert on
                            </h3>
                            <div className="space-y-3 mb-6">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="parameterInsertOn"
                                        value="Subject"
                                        checked={formData.parameterInsertOn === 'Subject'}
                                        onChange={(e) => handleInputChange('parameterInsertOn', e.target.value)}
                                        className="w-4 h-4 text-[#5069E5] focus:ring-[#5069E5] focus:ring-2"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">Subject</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="parameterInsertOn"
                                        value="template"
                                        checked={formData.parameterInsertOn === 'template'}
                                        onChange={(e) => handleInputChange('parameterInsertOn', e.target.value)}
                                        className="w-4 h-4 text-[#5069E5] focus:ring-[#5069E5] focus:ring-2"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">Template</span>
                                </label>
                            </div>
                            <div className="space-y-2">
                                {parameters.map((param, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleParameterClick(param)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <FaArrowRight size={12} className="text-gray-400" />
                                        <span>{param.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right Section - Template Editor */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Template type<span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.templateType}
                                        onChange={(e) => handleInputChange('templateType', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800 pr-10 appearance-none cursor-pointer"
                                    >
                                        <option value="submit">Submit</option>
                                        <option value="resubmit">Resubmit</option>
                                        <option value="approved">Approved</option>
                                        <option value="reject">Reject</option>
                                        <option value="pending">Pending</option>
                                        <option value="access">Access</option>
                                        <option value="regular">Regular</option>
                                    </select>
                                    <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Template Name<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.templateName}
                                    onChange={(e) => handleInputChange('templateName', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                                    placeholder="Timesheet Submit Template simple"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Template is used by
                                </label>
                                <div className="flex flex-wrap gap-6">
                                    {roles.length > 0 ? (
                                        roles.map((role) => (
                                            <label key={role.id} className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.used_by.includes(role.id)}
                                                    onChange={() => handleCheckboxChange(role.id)}
                                                    className="w-4 h-4 text-[#5069E5] border-gray-300 rounded focus:ring-[#5069E5] focus:ring-2"
                                                />
                                                <span className="ml-2 text-sm text-gray-700 capitalize">
                                                    {role.name === 'Staff' ? 'Supervisor' : role.name}
                                                </span>
                                            </label>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-400">Loading roles...</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => handleInputChange('subject', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                                    placeholder="Timesheet submitted for {{ Client name }}"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Template
                                </label>
                                <div className="border border-gray-300 rounded-lg overflow-hidden">
                                    <ReactQuill
                                        theme="snow"
                                        value={formData.templateBody}
                                        onChange={(value) => handleInputChange('templateBody', value)}
                                        modules={quillModules}
                                        formats={quillFormats}
                                        className="h-64"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
                    <button
                        onClick={() => onClose()}
                        disabled={isSaving}
                        className="px-6 py-2.5 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-[#5069E5] text-white rounded-lg hover:bg-[#3d52c7] transition-colors font-medium disabled:opacity-50"
                    >
                        {isSaving ? 'Updating...' : 'Update'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateTemplateModal;
