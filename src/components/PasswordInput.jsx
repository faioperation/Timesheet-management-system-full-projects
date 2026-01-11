import React, { useState } from 'react';
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

export default function PasswordInput({
    label = "Password",
    placeholder = "Enter your password",
    name,
    register,
    error,
    errorMessage,
    ...props
}) {
    const [viewPass, setViewPass] = useState(false);

    return (
        <fieldset className="fieldset text-black relative">
            <legend className="fieldset-legend text-black">{label}</legend>
            <input
                type={viewPass ? "text" : "password"}
                className="input py-4 border-[#CED2E5] bg-white w-full -mt-1 focus:outline-none pr-8"
                placeholder={placeholder}
                name={name}
                {...register}
                {...props}
            />
            <p
                className="absolute z-20 top-1/2 right-2 -translate-y-1/2 text-xl text-[#6D6E73] cursor-pointer"
                onClick={() => setViewPass(!viewPass)}
            >
                {viewPass ? <AiFillEye /> : <AiFillEyeInvisible />}
            </p>
            {error && (
                <span className="text-red-600 text-sm">{errorMessage || `${label} is required`}</span>
            )}
        </fieldset>
    );
}
