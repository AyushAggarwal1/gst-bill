import React from "react";

interface FormSuccessProps {
  message?: string;
}

export const FormSuccess: React.FC<FormSuccessProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mt-4 mb-4">
      <p className="text-sm">{message}</p>
    </div>
  );
}; 