"use client";

import React, { useState } from "react";

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({
  content,
  children,
  position = "top",
}: TooltipProps): React.ReactElement {
  const [visible, setVisible] = useState(false);

  const posClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={`absolute z-50 whitespace-normal max-w-xs rounded-lg border border-white/15 bg-surface-50 px-3 py-2 text-xs font-normal text-slate-200 shadow-xl backdrop-blur-md transition-opacity duration-150 ${posClasses[position]}`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
