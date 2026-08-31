import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Splash from "./pages/Splash";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Main from "./pages/Main";
import Dashboard from "./pages/Dashboard";
import RoutePlanner from "./pages/RoutePlanner";
import ImageAnalysis from "./pages/ImageAnalysis";
import History from "./pages/History";
import NotificationListener from "./components/NotificationListener";
import AnimatedBackground from "./components/AnimatedBackground";
import Bot3DGuide from "./components/Bot3DGuide";

// Simple auth wrapper (can be expanded later)
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AnimatedBackground />
      <NotificationListener />
      <Bot3DGuide />
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/main" element={<Main />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/route-planner" element={<ProtectedRoute><RoutePlanner /></ProtectedRoute>} />
        <Route path="/image-analysis" element={<ProtectedRoute><ImageAnalysis /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;