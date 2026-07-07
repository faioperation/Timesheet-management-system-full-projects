import React, { useState } from "react";

export default function TemplateUsedBy() {
  const [selected, setSelected] = useState([]);

  const handleChange = (role) => {
    setSelected((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  const roles = ["Admin", "User", "Supervisor"];

  return (
    <div className="">
      <h2 className="font-roboto text-[#0C0C0D] mb-3">
        Template is used by
      </h2>

      <div className="flex gap-6">
        {roles.map((role) => (
          <label
            key={role}
            className="flex items-center gap-2 text-[#0C0C0D] font-roboto  cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.includes(role)}
              onChange={() => handleChange(role)}
              className="w-5 h-5 border border-[#CED2E5] rounded-md outline-none accent-indigo-600 bg-white "
            />
            <span className="">{role}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
