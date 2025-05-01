
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/task/:taskId" element={<Task />} />
            <Route path="/history" element={<History />} />
            <Route path="/calendar" element={<Calendar />} />
            {/* Teacher Routes */}
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/tasks" element={<ManageTasks />} />
            <Route path="/teacher/task/:taskId" element={<EditTask />} />
            <Route path="/teacher/submissions" element={<Submissions />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
