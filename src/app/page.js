"use client";

import React, { useState, useEffect } from "react";
import { TaskProvider, useTaskFlow } from "@/context/TaskContext";
import Header from "@/components/Header";
import OverviewView from "@/components/OverviewView";
import KanbanBoardView from "@/components/KanbanBoardView";
import TeamWorkloadView from "@/components/TeamWorkloadView";
import AssignmentView from "@/components/AssignmentView";
import CreateTaskModal from "@/components/CreateTaskModal";
import TaskAssignmentModal from "@/components/TaskAssignmentModal";
import CommandPalette from "@/components/CommandPalette";
import BottomNav from "@/components/BottomNav";
import ToastNotification from "@/components/ToastNotification";
import ConfirmModal from "@/components/ConfirmModal";

function DashboardContent() {
  const { activeTab } = useTaskFlow();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f8faff] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#4648d4] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Loading TaskFlow...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faff] flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-18 sm:pt-20 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-12 transition-all">
        {activeTab === "overview" && <OverviewView />}
        {activeTab === "board" && <KanbanBoardView />}
        {activeTab === "team" && <TeamWorkloadView />}
        {activeTab === "assignment" && <AssignmentView />}
      </main>

      <CreateTaskModal />
      <TaskAssignmentModal />
      <CommandPalette />
      <ToastNotification />
      <ConfirmModal />

      <BottomNav />
    </div>
  );
}

export default function Home() {
  return (
    <TaskProvider>
      <DashboardContent />
    </TaskProvider>
  );
}
