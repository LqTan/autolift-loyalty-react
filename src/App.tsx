import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout";
import {
  LoginPage,
  DashboardPage,
  CampaignsPage,
  CustomersPage,
  VouchersPage,
  PromotionsPage,
  TargetingPage,
  GpRulesPage,
  NotificationsPage,
  LoyaltyPage,
  MlJobsPage,
  SandboxPage,
} from "@/pages";
import { Toaster } from "@/components/ui/sonner";
import { getAuthToken } from "@/lib/api";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = getAuthToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/vouchers" element={<VouchersPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/targeting" element={<TargetingPage />} />
          <Route path="/gp-rules" element={<GpRulesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/loyalty" element={<LoyaltyPage />} />
          <Route path="/ml-jobs" element={<MlJobsPage />} />
          <Route path="/sandbox" element={<SandboxPage />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;