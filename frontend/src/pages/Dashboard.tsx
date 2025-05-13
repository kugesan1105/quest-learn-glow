import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { ProgressTracker } from "@/components/ProgressTracker";
import { TaskCard, Task as TaskCardType } from "@/components/TaskCard"; // Renamed to avoid conflict
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; // Added
import { toast } from "@/components/ui/use-toast"; // Added

// Define Task interface consistent with backend and TaskCardType
export interface Task extends TaskCardType {
  id: string; // Changed from number to string
  studentSubmissionStatus?: "pending" | "graded"; // Added
}

// Submission interface (can be imported or defined locally)
interface Submission {
  id: string;
  taskId: string;
  status: "pending" | "graded";
}

export default function Dashboard() {
  const { user } = useAuth(); // Added
  const [userName, setUserName] = useState<string>("Student");
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);

  useEffect(() => {
    // Get user data from localStorage
    const name = localStorage.getItem("userName");
    const image = localStorage.getItem("userProfileImage");

    if (name) setUserName(name);
    if (image) setUserProfileImage(image);
  }, []);

  const [tasks, setTasks] = useState<TaskCardType[]>([]); // Use TaskCardType for initial fetch
  const [studentSubmissions, setStudentSubmissions] = useState<Submission[]>([]); // Added
  const [loadingTasks, setLoadingTasks] = useState(true); // Added
  const [loadingSubmissions, setLoadingSubmissions] = useState(true); // Added
  const [nextDeadlineTask, setNextDeadlineTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchTasksAndSubmissions = async () => {
      setLoadingTasks(true);
      setLoadingSubmissions(true);
      try {
        const response = await fetch("http://localhost:8000/tasks");
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data: TaskCardType[] = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast({ title: "Error", description: "Could not load tasks.", variant: "destructive" });
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
        setStudentSubmissions([]);
        setLoadingSubmissions(false);
      }
    };

    fetchTasksAndSubmissions();
  }, [user?.email]);

  const processedTasks = useMemo((): Task[] => {
    if (loadingTasks || (user?.email && loadingSubmissions)) return [];
    return tasks.map(task => {
      const submission = studentSubmissions.find(s => s.taskId === task.id);
      return {
        ...task,
        studentSubmissionStatus: submission?.status as ("pending" | "graded" | undefined),
      };
    });
  }, [tasks, studentSubmissions, loadingTasks, loadingSubmissions, user?.email]);

  useEffect(() => {
    if (processedTasks.length > 0) {
      const upcomingTask = processedTasks
        .filter(task => !task.isLocked && task.studentSubmissionStatus !== "graded" && !task.isCompleted && task.dueDate)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
      setNextDeadlineTask(upcomingTask || null);
    }
  }, [processedTasks]);

  const completedTasksCount = processedTasks.filter(task => task.studentSubmissionStatus === "graded").length;
  const totalTasks = processedTasks.length;
  const upcomingTasks = processedTasks.filter(task => !task.isLocked && task.studentSubmissionStatus !== "graded");
  const lockedTasks = processedTasks.filter(task => task.isLocked && task.studentSubmissionStatus !== "graded");
  const completedTasksList = processedTasks.filter(task => task.studentSubmissionStatus === "graded");

  const isLoading = loadingTasks || (user?.email && loadingSubmissions);

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
                <ProgressTracker completedTasks={completedTasksCount} totalTasks={totalTasks} className="mt-4" />

                <div className="mt-8">
                  <h3 className="font-medium mb-2">Your Learning Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-light/20 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-purple">{completedTasksCount}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div className="bg-blue-light/20 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-blue">{processedTasks.filter(t => t.studentSubmissionStatus === "pending").length}</div>
                      <div className="text-xs text-muted-foreground">In Progress</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="font-medium mb-2">Next Deadline</h3>
                  {isLoading ? (
                    <div className="text-muted-foreground">Loading deadline...</div>
                  ) : nextDeadlineTask ? (
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
                    {isLoading && <div className="col-span-full text-center py-10"><p className="text-muted-foreground">Loading tasks...</p></div>}
                    {!isLoading && upcomingTasks.map(task => (
                      <TaskCard key={task.id} task={task} studentSubmissionStatus={task.studentSubmissionStatus} />
                    ))}
                    {!isLoading && upcomingTasks.length === 0 && processedTasks.length > 0 && (
                      <div className="col-span-full text-center py-10">
                        <p className="text-muted-foreground">No upcoming tasks. Check locked or completed tasks.</p>
                      </div>
                    )}
                    {!isLoading && processedTasks.length === 0 && !user?.email && (
                      <div className="col-span-full text-center py-10">
                        <p className="text-muted-foreground">Login to see your personalized task status.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="locked" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isLoading && <div className="col-span-full text-center py-10"><p className="text-muted-foreground">Loading tasks...</p></div>}
                    {!isLoading && lockedTasks.map(task => (
                      <TaskCard key={task.id} task={task} studentSubmissionStatus={task.studentSubmissionStatus} />
                    ))}
                    {!isLoading && lockedTasks.length === 0 && processedTasks.length > 0 && (
                      <div className="col-span-full text-center py-10">
                        <p className="text-muted-foreground">No locked tasks.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="completed" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isLoading && <div className="col-span-full text-center py-10"><p className="text-muted-foreground">Loading tasks...</p></div>}
                    {!isLoading && completedTasksList.map(task => (
                      <TaskCard key={task.id} task={task} studentSubmissionStatus={task.studentSubmissionStatus} />
                    ))}
                    {!isLoading && completedTasksList.length === 0 && processedTasks.length > 0 && (
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
