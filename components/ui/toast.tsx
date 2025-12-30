"use client";

import * as React from "react";

interface ToastProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const Toast: React.FC<ToastProps> = ({ title, description, variant = "default" }) => {
  const bgColor = variant === "destructive" ? "bg-red-500" : "bg-gray-800";
  return (
    <div className={`p-4 rounded-md text-white ${bgColor}`}>
      <strong>{title}</strong>
      {description && <p>{description}</p>}
    </div>
  );
};
