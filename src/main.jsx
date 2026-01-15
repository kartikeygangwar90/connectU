/* eslint-disable react-refresh/only-export-components */
import React, { Suspense, lazy } from "react";
import reactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./AuthContext";
import { TeamProvider } from "./context/TeamContext";
import Access from "./access";
import ProfileSetup from "./profile";
import PrivateRoute from "./privateRoute";
import Policy from "./Terms&Conditions";
import Home from "./home";

// Create QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy load dashboard components for better performance
const DashboardLayout = lazy(() => import("./components/layout/DashboardLayout"));
const Events = lazy(() => import("./pages/dashboard/Events"));
const Teams = lazy(() => import("./pages/dashboard/Teams"));
const ForYou = lazy(() => import("./pages/dashboard/ForYou"));
const ProfileView = lazy(() => import("./pages/dashboard/ProfileView"));
const DiscoverTalent = lazy(() => import("./pages/dashboard/DiscoverTalent"));

// Loading fallback component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#000'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid rgba(255,255,255,0.1)',
      borderTop: '3px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

reactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TeamProvider>
            {/* Toast notifications */}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1f2937',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                },
                success: {
                  iconTheme: { primary: '#22c55e', secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#fff' },
                },
              }}
            />
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Access />} />
              <Route path="/profile" element={<ProfileSetup />} />
              <Route path="/policy" element={<Policy />} />

              <Route path="/home" element={
                <PrivateRoute><Home /></PrivateRoute>
              } />

              {/* Legacy redirect */}
              <Route path="/mainpage" element={<Navigate to="/app/events" replace />} />

              {/* Dashboard Routes with Lazy Loading */}
              <Route path="/app" element={
                <PrivateRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <DashboardLayout />
                  </Suspense>
                </PrivateRoute>
              }>
                <Route index element={<Navigate to="events" replace />} />
                <Route path="events" element={
                  <Suspense fallback={<LoadingSpinner />}><Events /></Suspense>
                } />
                <Route path="teams" element={
                  <Suspense fallback={<LoadingSpinner />}><Teams /></Suspense>
                } />
                <Route path="recommendations" element={
                  <Suspense fallback={<LoadingSpinner />}><ForYou /></Suspense>
                } />
                <Route path="profile" element={
                  <Suspense fallback={<LoadingSpinner />}><ProfileView /></Suspense>
                } />
                <Route path="discover" element={
                  <Suspense fallback={<LoadingSpinner />}><DiscoverTalent /></Suspense>
                } />
              </Route>
            </Routes>
          </TeamProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
