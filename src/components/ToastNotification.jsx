"use client";

import React from "react";
import { useTaskFlow } from "@/context/TaskContext";

export default function ToastNotification() {
  const { toast } = useTaskFlow();

  if (!toast) return null;

  const isError = toast.type === "error";

  return (
    <div className="fixed top-18 sm:top-20 left-3.5 right-3.5 sm:left-auto sm:right-6 max-w-sm mx-auto sm:mx-0 z-50 flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white text-slate-900 shadow-2xl ring-1 ring-black/10 animate-in fade-in slide-in-from-top-4 sm:slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isError ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isError ? "error" : "check_circle"}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold truncate">{toast.message}</p>
          <p className="text-[11px] text-slate-500 truncate">
            {isError ? "Please check required fields" : "Synced to sprint state"}
          </p>
        </div>
      </div>
    </div>
  );
}
