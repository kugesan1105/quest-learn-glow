import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />

            {/* Student Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Tasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/task/:taskId"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Task />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Calendar />
                </ProtectedRoute>
              }
            />

            {/* Teacher Routes */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/tasks"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <ManageTasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/task/:taskId"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <EditTask />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/submissions"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <Submissions />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
