import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { TaskCard } from "@/components/TaskCard"; // Assuming TaskCard expects 'Task' type
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

// Define Task interface consistent with backend and TaskCard props
export interface Task {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  isLocked: boolean;
  isCompleted: boolean;
  dueDate: string;
  estimatedTime?: string;
  instructions?: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Fetch tasks from the backend API
        const response = await fetch("http://localhost:8000/tasks");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTasks(data as Task[]); // Assuming the backend returns an array of Task
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        toast({
          title: "Error fetching tasks",
          description: "Could not load tasks from the server. Please try again later.",
          variant: "destructive",
        });
        // Fallback to empty or previously stored demo data if desired
        setTasks([]); // Or load demo tasks as a fallback
      }
    };

    fetchTasks();
  }, []);

  const allTasks = tasks;
  const unlockedTasks = tasks.filter(task => !task.isLocked);
  const lockedTasks = tasks.filter(task => task.isLocked);
  const completedTasks = tasks.filter(task => task.isCompleted);

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
                {allTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {allTasks.length === 0 && (
                  <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground">No tasks available.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="unlocked" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unlockedTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {unlockedTasks.length === 0 && (
                  <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground">No unlocked tasks available.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="locked" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lockedTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {lockedTasks.length === 0 && (
                  <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground">No locked tasks available.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="completed" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {completedTasks.length === 0 && (
                  <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground">No completed tasks yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
