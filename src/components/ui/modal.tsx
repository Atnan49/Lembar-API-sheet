"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`w-full bg-white border-3 border-black rounded-none shadow-[6px_6px_0px_#000000] p-6 relative animate-in fade-in zoom-in-95 duration-100 ${maxWidthStyles[maxWidth]}`}
      >
        <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-4 gap-4">
          <div>
            <h2 id="modal-title" className="text-lg font-extrabold uppercase tracking-wider text-black">
              {title}
            </h2>
            {description && <p className="text-xs sm:text-sm text-zinc-700 mt-1 font-medium">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup dialog"
            className="p-1.5 border-2 border-black bg-white hover:bg-black hover:text-white transition-all active:translate-x-[1px] active:translate-y-[1px] min-w-[36px] min-h-[36px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-black"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
