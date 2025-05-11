import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ProgressTracker } from "@/components/ProgressTracker";
import { TaskCard, Task } from "@/components/TaskCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "lucide-react";

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

  const [tasks] = useState<Task[]>([
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
  ]);

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
                  <div className="bg-gradient-card text-white rounded-lg p-4">
                    <div className="text-sm opacity-80">Due in 3 days</div>
                    <div className="font-medium">Advanced CSS Techniques</div>
                  </div>
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
                    {upcomingTasks.length === 0 && (
                      <div className="col-span-full text-center py-10">
                        <p className="text-muted-foreground">No upcoming tasks. Check locked or completed tasks.</p>
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
                    {completedTasksList.length === 0 && (
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
