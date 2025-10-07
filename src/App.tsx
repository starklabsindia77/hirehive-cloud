import * as React from "react";
import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PWAUpdatePrompt } from "@/components/PWAUpdatePrompt";
import { OnlineStatus } from "@/components/OnlineStatus";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SuperAdminRoute } from "@/components/SuperAdminRoute";
import { SubdomainRouter } from "@/components/SubdomainRouter";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Lazy load pages
const Index = React.lazy(() => import("@/pages/Index"));
const Auth = React.lazy(() => import("@/pages/Auth"));
const OrganizationAuth = React.lazy(() => import("@/pages/OrganizationAuth"));
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const Candidates = React.lazy(() => import("@/pages/Candidates"));
const CandidateDetail = React.lazy(() => import("@/pages/CandidateDetail"));
const Jobs = React.lazy(() => import("@/pages/Jobs"));
const JobDetail = React.lazy(() => import("@/pages/JobDetail"));
const Careers = React.lazy(() => import("@/pages/Careers"));
const CareerJobDetail = React.lazy(() => import("@/pages/CareerJobDetail"));
const Interviews = React.lazy(() => import("@/pages/Interviews"));
const InterviewCalendar = React.lazy(() => import("@/pages/InterviewCalendar"));
const Offers = React.lazy(() => import("@/pages/Offers"));
const Analytics = React.lazy(() => import("@/pages/Analytics"));
const Team = React.lazy(() => import("@/pages/Team"));
const Workflows = React.lazy(() => import("@/pages/Workflows"));
const EmailTemplates = React.lazy(() => import("@/pages/EmailTemplates"));
const EmailSequences = React.lazy(() => import("@/pages/EmailSequences"));
const Settings = React.lazy(() => import("@/pages/Settings"));
const Billing = React.lazy(() => import("@/pages/Billing"));
const Usage = React.lazy(() => import("@/pages/Usage"));
const Permissions = React.lazy(() => import("@/pages/Permissions"));
const SSOConfiguration = React.lazy(() => import("@/pages/SSOConfiguration"));
const SuperAdmin = React.lazy(() => import("@/pages/SuperAdmin"));
const PlatformDocument = React.lazy(() => import("@/pages/PlatformDocument"));
const PlatformSecrets = React.lazy(() => import("@/pages/PlatformSecrets"));
const PlatformSettings = React.lazy(() => import("@/pages/PlatformSettings"));
const SubscriptionManagement = React.lazy(() => import("@/pages/SubscriptionManagement"));
const PlanManagement = React.lazy(() => import("@/pages/PlanManagement"));
const PlatformAnalytics = React.lazy(() => import("@/pages/PlatformAnalytics"));
const OrganizationsManagement = React.lazy(() => import("@/pages/OrganizationsManagement"));
const Onboarding = React.lazy(() => import("@/pages/Onboarding"));
const HelpCenter = React.lazy(() => import("@/pages/HelpCenter"));
const VideoTutorials = React.lazy(() => import("@/pages/VideoTutorials"));
const Community = React.lazy(() => import("@/pages/Community"));
const Support = React.lazy(() => import("@/pages/Support"));
const APIDocs = React.lazy(() => import("@/pages/APIDocs"));
const Privacy = React.lazy(() => import("@/pages/Privacy"));
const Terms = React.lazy(() => import("@/pages/Terms"));
const Contact = React.lazy(() => import("@/pages/Contact"));
const About = React.lazy(() => import("@/pages/About"));
const Features = React.lazy(() => import("@/pages/Features"));
const Pricing = React.lazy(() => import("@/pages/Pricing"));
const FAQ = React.lazy(() => import("@/pages/FAQ"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <OrganizationProvider>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<SubdomainRouter />}>
                      <Route index element={<Index />} />
                    </Route>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/organization-auth" element={<OrganizationAuth />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/careers/:jobId" element={<CareerJobDetail />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/platform-document" element={<PlatformDocument />} />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/candidates" element={<ProtectedRoute><Candidates /></ProtectedRoute>} />
                    <Route path="/candidates/:id" element={<ProtectedRoute><CandidateDetail /></ProtectedRoute>} />
                    <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
                    <Route path="/jobs/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
                    <Route path="/interviews" element={<ProtectedRoute><Interviews /></ProtectedRoute>} />
                    <Route path="/interview-calendar" element={<ProtectedRoute><InterviewCalendar /></ProtectedRoute>} />
                    <Route path="/offers" element={<ProtectedRoute><Offers /></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                    <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
                    <Route path="/workflows" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
                    <Route path="/email-templates" element={<ProtectedRoute><EmailTemplates /></ProtectedRoute>} />
                    <Route path="/email-sequences" element={<ProtectedRoute><EmailSequences /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
                    <Route path="/usage" element={<ProtectedRoute><Usage /></ProtectedRoute>} />
                    <Route path="/permissions" element={<ProtectedRoute><Permissions /></ProtectedRoute>} />
                    <Route path="/sso-configuration" element={<ProtectedRoute><SSOConfiguration /></ProtectedRoute>} />
                    <Route path="/super-admin" element={<SuperAdminRoute><SuperAdmin /></SuperAdminRoute>} />
                    
                    <Route path="/platform-secrets" element={<SuperAdminRoute><PlatformSecrets /></SuperAdminRoute>} />
                    <Route path="/platform-settings" element={<SuperAdminRoute><PlatformSettings /></SuperAdminRoute>} />
                    <Route path="/subscription-management" element={<SuperAdminRoute><SubscriptionManagement /></SuperAdminRoute>} />
                    <Route path="/plan-management" element={<SuperAdminRoute><PlanManagement /></SuperAdminRoute>} />
                    <Route path="/platform-analytics" element={<SuperAdminRoute><PlatformAnalytics /></SuperAdminRoute>} />
                    <Route path="/organizations-management" element={<SuperAdminRoute><OrganizationsManagement /></SuperAdminRoute>} />
                    <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                    <Route path="/help" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
                    <Route path="/videos" element={<ProtectedRoute><VideoTutorials /></ProtectedRoute>} />
                    <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                    <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                    <Route path="/api-docs" element={<ProtectedRoute><APIDocs /></ProtectedRoute>} />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                
                {/* Global Components */}
                {/* <Toaster /> */}
                <Sonner />
                <PWAInstallPrompt />
                <PWAUpdatePrompt />
                <OnlineStatus />
              </OrganizationProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
