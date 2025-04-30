
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { TaskCard, Task } from "@/components/TaskCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Fetch tasks from localStorage or use demo data
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    } else {
      // Use demo data if no tasks are stored
      const demoTasks = [
        {
          id: 1,
          title: "Introduction to Web Development",
          description: "Learn the basics of HTML, CSS, and JavaScript",
          videoUrl: "https://example.com/video1",
          isLocked: false,
          isCompleted: true,
          dueDate: "Apr 15, 2025"
        },
        {
          id: 2,
          title: "Advanced CSS Techniques",
          description: "Master flexbox, grid, and responsive design",
          videoUrl: "https://example.com/video2",
          isLocked: false,
          isCompleted: false,
          dueDate: "Apr 18, 2025"
        },
        {
          id: 3,
          title: "JavaScript Fundamentals",
          description: "Variables, functions, and control flow",
          videoUrl: "https://example.com/video3",
          isLocked: true,
          isCompleted: false,
          dueDate: "Apr 20, 2025"
        },
        {
          id: 4,
          title: "Building Interactive UIs",
          description: "Create dynamic user interfaces with JavaScript",
          videoUrl: "https://example.com/video4",
          isLocked: true,
          isCompleted: false,
          dueDate: "Apr 25, 2025"
        },
        {
          id: 5,
          title: "Introduction to React",
          description: "Learn the basics of the React library",
          videoUrl: "https://example.com/video5",
          isLocked: true,
          isCompleted: false,
          dueDate: "Apr 30, 2025"
        },
        {
          id: 6,
          title: "Building a Full-Stack App",
          description: "Combine frontend and backend technologies",
          videoUrl: "https://example.com/video6",
          isLocked: true,
          isCompleted: false,
          dueDate: "May 5, 2025"
        }
      ];
      setTasks(demoTasks);
    }
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
