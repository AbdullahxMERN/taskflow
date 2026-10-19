"use client";

import React from "react";
import { useTaskFlow } from "@/context/TaskContext";

export default function ConfirmModal() {
  const { confirmModal, closeConfirmModal } = useTaskFlow();

  if (!confirmModal || !confirmModal.isOpen) return null;

  const isDanger = confirmModal.variant === "danger";

  const handleConfirm = () => {
    if (typeof confirmModal.onConfirm === "function") {
      confirmModal.onConfirm();
    }
    closeConfirmModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeConfirmModal}
      />

      <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 animate-in zoom-in-95 duration-200 p-5 sm:p-6">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              isDanger
                ? "bg-rose-50 text-rose-600 border border-rose-100 ring-4 ring-rose-50/50"
                : "bg-indigo-50 text-[#4648d4] border border-indigo-100 ring-4 ring-indigo-50/50"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {isDanger ? "delete_forever" : "help"}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {confirmModal.title || "Confirm Action"}
            </h3>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-1 leading-relaxed">
              {confirmModal.message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={closeConfirmModal}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-all active:scale-95"
          >
            {confirmModal.cancelText || "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition-all active:scale-95 shadow-sm flex items-center gap-1.5 ${
              isDanger
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                : "bg-[#4648d4] hover:bg-[#3b3ecb] shadow-indigo-200"
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {isDanger ? "delete" : "check"}
            </span>
            <span>{confirmModal.confirmText || "Confirm"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
