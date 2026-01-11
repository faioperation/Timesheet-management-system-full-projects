import React from 'react';

export default function LoadingButton({
    isLoading,
    loadingText = "Loading...",
    children,
    type = "submit",
    className = "",
    ...props
}) {
    const baseClasses = "bg-[#5069E5] text-white w-full py-4 rounded-[4px] font-semibold text-xl cursor-pointer hover:bg-[#3d52c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";

    return (
        <button
            type={type}
            disabled={isLoading}
            className={`${baseClasses} ${className}`}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{loadingText}</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
}
