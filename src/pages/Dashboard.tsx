import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ProgressTracker } from "@/components/ProgressTracker";
import { TaskCard, Task as TaskCardType } from "@/components/TaskCard"; // Renamed to avoid conflict
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "lucide-react";

// Define Task interface consistent with backend and TaskCardType
export interface Task extends TaskCardType {
  id: string; // Changed from number to string
}

export default function Dashboard() {
  const [userName, setUserName] = useState<string>("Student");
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);

  useEffect(() => {
    // Get user data from localStorage
    const name = localStorage.getItem("userName");
    const image = localStorage.getItem("userProfileImage");

    if (name) setUserName(name);
    if (image) setUserProfileImage(image);
  }, []);

  const [tasks, setTasks] = useState<Task[]>([]); // Initialize with empty array
  const [nextDeadlineTask, setNextDeadlineTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://localhost:8000/tasks");
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data: Task[] = await response.json();
        setTasks(data);

        // Find the task with the nearest due date
        const upcomingTask = data
          .filter(task => !task.isCompleted && !task.isLocked && task.dueDate)
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
        setNextDeadlineTask(upcomingTask || null);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        // Optionally, set an error state and display a message to the user
      }
    };

    fetchTasks();
  }, []);

  const completedTasks = tasks.filter(task => task.isCompleted).length;
  const totalTasks = tasks.length;
  const upcomingTasks = tasks.filter(task => !task.isLocked && !task.isCompleted);
  const lockedTasks = tasks.filter(task => task.isLocked);
  const completedTasksList = tasks.filter(task => task.isCompleted);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="md:pl-24 lg:pl-72 pt-4 pb-20 md:pb-4 md:pt-4">
        <div className="content-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Summary */}
            <Card className="lg:col-span-1 animate-fade-in">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16 border-4 border-purple-light">
                    {userProfileImage ? (
                      <AvatarImage src={userProfileImage} alt={userName} />
                    ) : (
                      <AvatarFallback className="bg-gradient-main text-white">
                        {userName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">Hi, {userName}!</h2>
                    <p className="text-muted-foreground">Welcome back to your learning journey</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ProgressTracker completedTasks={completedTasks} totalTasks={totalTasks} className="mt-4" />

                <div className="mt-8">
                  <h3 className="font-medium mb-2">Your Learning Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-light/20 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-purple">{completedTasks}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div className="bg-blue-light/20 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-blue">2</div>
                      <div className="text-xs text-muted-foreground">In Progress</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="font-medium mb-2">Next Deadline</h3>
                  {nextDeadlineTask ? (
                    <div className="bg-gradient-card text-white rounded-lg p-4">
                      <div className="text-sm opacity-80">
                        Due in {Math.ceil((new Date(nextDeadlineTask.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                      </div>
                      <div className="font-medium">{nextDeadlineTask.title}</div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">No upcoming deadlines</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tasks Section */}
            <div className="lg:col-span-2 animate-fade-in">
              <h2 className="page-heading">Your Learning Path</h2>

              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="locked">Locked</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {upcomingTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                    {upcomingTasks.length === 0 && tasks.length > 0 && (
                      <div className="col-span-full text-center py-10">
                        <p className="text-muted-foreground">No upcoming tasks. Check locked or completed tasks.</p>
                      </div>
                    )}
                    {tasks.length === 0 && (
                      <div className="col-span-full text-center py-10">
                        <p className="text-muted-foreground">Loading tasks...</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="locked" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {lockedTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="completed" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {completedTasksList.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                    {completedTasksList.length === 0 && tasks.length > 0 && (
                      <div className="col-span-full text-center py-10">
                        <p className="text-muted-foreground">No completed tasks yet. Start your journey!</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
