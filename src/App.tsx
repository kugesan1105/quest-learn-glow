import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Task from "./pages/Task";
import History from "./pages/History";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import ManageTasks from "./pages/teacher/ManageTasks";
import Submissions from "./pages/teacher/Submissions";
import EditTask from "./pages/teacher/EditTask";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// ProtectedRoute component
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return null;
  if (!user) return <Navigate to="/" state={{ from: location }} replace />;
  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* Protected Student Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute><Tasks /></ProtectedRoute>
            } />
            <Route path="/task/:taskId" element={
              <ProtectedRoute><Task /></ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute><History /></ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute><Calendar /></ProtectedRoute>
            } />
            {/* Protected Teacher Routes */}
            <Route path="/teacher/dashboard" element={
              <ProtectedRoute><TeacherDashboard /></ProtectedRoute>
            } />
            <Route path="/teacher/tasks" element={
              <ProtectedRoute><ManageTasks /></ProtectedRoute>
            } />
            <Route path="/teacher/task/:taskId" element={
              <ProtectedRoute><EditTask /></ProtectedRoute>
            } />
            <Route path="/teacher/submissions" element={
              <ProtectedRoute><Submissions /></ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
