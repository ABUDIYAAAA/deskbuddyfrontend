import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import ArrivalPage from "./pages/stage/Arrival";
import HostelPage from "./pages/stage/Hostel";
import DocumentsPage from "./pages/stage/Documents";
import KitPage from "./pages/stage/Kit";
import ArrivalScan from "./pages/scan/ArrivalScan";
import HostelScan from "./pages/scan/HostelScan";
import DocumentsScan from "./pages/scan/DocumentsScan";
import KitScan from "./pages/scan/KitScan";
import SendQR from "./pages/SendQR";
import Analytics from "./pages/Analytics";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import PageTransition from "./components/PageTransition";
import NewSidebar from "./components/NewSidebar";
import React, { useState } from "react";
import SplashPreloader from "./components/SplashPreloader";
import { FiMenu } from "react-icons/fi";
import { AnalyticsProvider } from "./context/AnalyticsContext";
import Checkin from "./pages/Checkin";

// Component to handle automatic redirection for authenticated users
const AuthRedirect = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppLayout({ children, theme }) {
  const location = useLocation();
  const hideSidebar = location.pathname === "/";
  const handleCollapseChange = React.useCallback(() => {}, []);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const marginLeft = !hideSidebar ? 64 : 0;
  // Detect mobile
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 900px)").matches;
  return (
    <div className={theme === "dark" ? "app dark" : "app"}>
      {/* Sidebar only on desktop/tablet, no hamburger */}
      {!hideSidebar && !isMobile && (
        <NewSidebar
          onCollapseChange={handleCollapseChange}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />
      )}
      <div
        className="main-content"
        style={{
          marginLeft: !isMobile && !hideSidebar ? marginLeft : 0,
          width: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function App() {
  const [theme] = useState("light");
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    // Show splash for at least one full animation cycle (4s)
    const timeout = setTimeout(() => setShowSplash(false), 3500); // 4s for full animation
    return () => clearTimeout(timeout);
  }, []);

  return (
    <AuthProvider>
      <AnalyticsProvider>
        {showSplash && <SplashPreloader />}
        <BrowserRouter>
          <AppLayout theme={theme}>
            <PageTransition>
              <Routes>
                <Route
                  path="/"
                  element={
                    <AuthRedirect>
                      <Login />
                    </AuthRedirect>
                  }
                />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Stage Landing Pages */}
                <Route
                  path="/arrival"
                  element={
                    <ProtectedRoute>
                      <ArrivalPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hostel"
                  element={
                    <ProtectedRoute>
                      <HostelPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkin"
                  element={
                    <ProtectedRoute>
                      <Checkin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/documents"
                  element={
                    <ProtectedRoute>
                      <DocumentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/kit"
                  element={
                    <ProtectedRoute>
                      <KitPage />
                    </ProtectedRoute>
                  }
                />

                {/* Scanner Tabs */}
                <Route
                  path="/arrival/scan"
                  element={
                    <ProtectedRoute>
                      <ArrivalScan />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hostel/scan"
                  element={
                    <ProtectedRoute>
                      <HostelScan />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/documents/scan"
                  element={
                    <ProtectedRoute>
                      <DocumentsScan />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/kit/scan"
                  element={
                    <ProtectedRoute>
                      <KitScan />
                    </ProtectedRoute>
                  }
                />

                {/* QR Mailer Page */}
                <Route
                  path="/sendqr"
                  element={
                    <ProtectedRoute>
                      <SendQR />
                    </ProtectedRoute>
                  }
                />

                {/* Analytics Page */}
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />

                {/* Catch all route - redirect to dashboard if authenticated, otherwise to login */}
                <Route
                  path="*"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/dashboard" replace />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </PageTransition>
          </AppLayout>
        </BrowserRouter>
      </AnalyticsProvider>
    </AuthProvider>
  );
}

export default App;
