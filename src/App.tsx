import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PWAUpdatePrompt } from "@/components/PWAUpdatePrompt";
import { OnlineStatus } from "@/components/OnlineStatus";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SubdomainRouter } from "./components/SubdomainRouter";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Candidates from "./pages/Candidates";
import CandidateDetail from "./pages/CandidateDetail";
import Settings from "./pages/Settings";
import Interviews from "./pages/Interviews";
import Team from "./pages/Team";
import Billing from "./pages/Billing";
import Usage from "./pages/Usage";
import Offers from "./pages/Offers";
import Onboarding from "./pages/Onboarding";
import SuperAdmin from './pages/SuperAdmin';
import EmailTemplates from './pages/EmailTemplates';
import Permissions from './pages/Permissions';
import Careers from './pages/Careers';
import CareerJobDetail from './pages/CareerJobDetail';
import Workflows from './pages/Workflows';
import EmailSequences from './pages/EmailSequences';
import InterviewCalendar from "./pages/InterviewCalendar";
import Analytics from "./pages/Analytics";
import HelpCenter from './pages/HelpCenter';
import VideoTutorials from './pages/VideoTutorials';
import Community from './pages/Community';
import Support from './pages/Support';
import APIDocs from './pages/APIDocs';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <OrganizationProvider>
          <Toaster />
          <Sonner />
          <PWAInstallPrompt />
          <PWAUpdatePrompt />
          <OnlineStatus />
          <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<SubdomainRouter />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/careers/:id" element={<CareerJobDetail />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs"
                element={
                  <ProtectedRoute>
                    <Jobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs/:id"
                element={
                  <ProtectedRoute>
                    <JobDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidates"
                element={
                  <ProtectedRoute>
                    <Candidates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidates/:id"
                element={
                  <ProtectedRoute>
                    <CandidateDetail />
                  </ProtectedRoute>
                }
              />
              <Route path="/interviews" element={<ProtectedRoute><Interviews /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><InterviewCalendar /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            <Route path="/usage" element={<ProtectedRoute><Usage /></ProtectedRoute>} />
            <Route path="/offers" element={<ProtectedRoute><Offers /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/super-admin" element={<ProtectedRoute><SuperAdmin /></ProtectedRoute>} />
            <Route path="/workflows" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
            <Route path="/email-sequences" element={<ProtectedRoute><EmailSequences /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
            <Route path="/video-tutorials" element={<ProtectedRoute><VideoTutorials /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
            <Route path="/api-docs" element={<ProtectedRoute><APIDocs /></ProtectedRoute>} />
              <Route
                path="/email-templates"
                element={
                  <ProtectedRoute>
                    <EmailTemplates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/permissions"
                element={
                  <ProtectedRoute>
                    <Permissions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sso"
                lazy={async () => {
                  const SSOConfiguration = await import("./pages/SSOConfiguration");
                  return { Component: () => <ProtectedRoute><SSOConfiguration.default /></ProtectedRoute> };
                }}
              />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </OrganizationProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
