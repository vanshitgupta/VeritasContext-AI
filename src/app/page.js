// src/app/page.js
"use client";

import { useState } from "react";
// Using relative paths to avoid the alias build error
import AuthView from "../components/AuthView";
import AdminDashboard from "../components/AdminDashboard";
import ChatView from "../components/ChatView";
import Navigation from "../components/Navigation";
import { SYSTEM_ROLES } from "../lib/constants";

/**
 * Main Application Router
 * This component acts as the traffic controller. It checks if a user has an active session.
 * If no session exists, it renders the AuthView gateway.
 * If a session exists, it renders the Navigation bar and either the AdminDashboard or ChatView.
 */
export default function AppRouter() {
  // State to hold the current logged-in user's role (e.g., "Finance", "Administrator")
  const [activeSessionRole, setActiveSessionRole] = useState(null);

  // 1. Security Gate: If no role is active, force the user to authenticate.
  if (!activeSessionRole) {
    return <AuthView onLogin={setActiveSessionRole} />;
  }

  // 2. Authenticated View: The user has passed the passcode check.
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Global Navigation Bar passes the current role and logout handler */}
      <Navigation
        role={activeSessionRole}
        onLogout={() => setActiveSessionRole(null)}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Role-Based Component Rendering:
          If the user is an Administrator, they see the Data Governance Hub.
          Otherwise, they see the Chat Interface locked to their specific department.
        */}
        {activeSessionRole === SYSTEM_ROLES.ADMIN ? (
          <AdminDashboard />
        ) : (
          <ChatView role={activeSessionRole} />
        )}
      </main>
    </div>
  );
}
