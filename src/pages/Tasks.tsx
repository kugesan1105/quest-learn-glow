import { useState, useEffect, useMemo } from "react"; // Added useMemo
import { Navbar } from "@/components/Navbar";
import { TaskCard } from "@/components/TaskCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext"; // Added useAuth

// Define Task interface consistent with backend and TaskCard props
export interface Task {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  isLocked: boolean;
  isCompleted: boolean; // Global completion
  dueDate: string;
  estimatedTime?: string;
  instructions?: string;
  studentSubmissionStatus?: "pending" | "graded"; // Added for student-specific status
}

// Submission interface (can be imported or defined locally)
interface Submission {
  id: string;
  taskId: string;
  // ... other submission fields if needed for display, matching History.tsx
  status: "pending" | "graded";
}

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [studentSubmissions, setStudentSubmissions] = useState<Submission[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  useEffect(() => {
    const fetchTasksAndSubmissions = async () => {
      setLoadingTasks(true);
      setLoadingSubmissions(true);
      try {
        const response = await fetch("http://localhost:8000/tasks");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTasks(data as Task[]);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        toast({
          title: "Error fetching tasks",
          description: "Could not load tasks from the server. Please try again later.",
          variant: "destructive",
        });
        setTasks([]);
      } finally {
        setLoadingTasks(false);
      }

      if (user?.email) {
        try {
          const submissionsResponse = await fetch(`http://localhost:8000/submissions?studentId=${user.email}`);
          if (!submissionsResponse.ok) {
            throw new Error("Failed to fetch student submissions");
          }
          const submissionsData: Submission[] = await submissionsResponse.json();
          setStudentSubmissions(submissionsData);
        } catch (error) {
          console.error("Error fetching submissions:", error);
          toast({ title: "Error", description: "Could not load your submission data.", variant: "destructive" });
          setStudentSubmissions([]);
        } finally {
          setLoadingSubmissions(false);
        }
      } else {
        setLoadingSubmissions(false);
        setStudentSubmissions([]);
      }
    };

    fetchTasksAndSubmissions();
  }, [user?.email]);

  const processedTasks = useMemo(() => {
    if (loadingTasks || loadingSubmissions) return [];
    return tasks.map(task => {
      const submission = studentSubmissions.find(s => s.taskId === task.id);
      return {
        ...task,
        studentSubmissionStatus: submission?.status as ("pending" | "graded" | undefined),
      };
    });
  }, [tasks, studentSubmissions, loadingTasks, loadingSubmissions]);

  const allProcessedTasks = processedTasks;
  const unlockedTasks = processedTasks.filter(task => !task.isLocked && task.studentSubmissionStatus !== 'graded');
  const lockedTasks = processedTasks.filter(task => task.isLocked && task.studentSubmissionStatus !== 'graded');
  const completedTasks = processedTasks.filter(task => task.studentSubmissionStatus === 'graded');
  
  const renderTaskList = (taskList: Task[]) => {
    if (loadingTasks || loadingSubmissions) {
      return <p className="col-span-full text-center py-10">Loading tasks...</p>;
    }
    if (taskList.length === 0) {
      return <p className="col-span-full text-center py-10 text-muted-foreground">No tasks in this category.</p>;
    }
    return taskList.map(task => (
      <TaskCard key={task.id} task={task} studentSubmissionStatus={task.studentSubmissionStatus} />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="md:pl-24 lg:pl-72 pt-4 pb-20 md:pb-4 md:pt-4">
        <div className="content-container">
          <div className="mb-6">
            <h1 className="page-heading">All Tasks</h1>
            <p className="text-muted-foreground">Browse and complete your learning tasks</p>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
              <TabsTrigger value="locked">Locked</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderTaskList(allProcessedTasks)}
              </div>
            </TabsContent>
            
            <TabsContent value="unlocked" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderTaskList(unlockedTasks)}
              </div>
            </TabsContent>
            
            <TabsContent value="locked" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderTaskList(lockedTasks)}
              </div>
            </TabsContent>
            
            <TabsContent value="completed" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderTaskList(completedTasks)}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
