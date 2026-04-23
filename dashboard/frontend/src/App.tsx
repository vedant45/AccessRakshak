import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Audit from "./pages/Audit";
import Delegate from "./pages/Delegate";
import Certify from "./pages/Certify";
import PreDelegate from "./pages/PreDelegate";
import Sidebar from "./components/Sidebar";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/" />;
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ marginLeft: "220px", flex: 1, minHeight: "100vh", padding: "32px" }}>
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  const { token } = useAuth();
  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/audit" element={<ProtectedLayout><Audit /></ProtectedLayout>} />
      <Route path="/delegate" element={<ProtectedLayout><Delegate /></ProtectedLayout>} />
      <Route path="/certify" element={<ProtectedLayout><Certify /></ProtectedLayout>} />
      <Route path="/pre-delegate" element={<ProtectedLayout><PreDelegate /></ProtectedLayout>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}