import React from 'react';

export default function FormInput({
    label,
    type = "text",
    placeholder,
    name,
    register,
    error,
    errorMessage,
    ...props
}) {
    return (
        <fieldset className="fieldset text-black">
            <legend className="fieldset-legend text-black">{label}</legend>
            <input
                type={type}
                className="input py-4 border-[#CED2E5] bg-white w-full -mt-1 text-black focus:outline-none"
                placeholder={placeholder}
                name={name}
                {...register}
                {...props}
            />
            {error && (
                <span className="text-red-600 text-sm">{errorMessage || `${label} is required`}</span>
            )}
        </fieldset>
    );
}
