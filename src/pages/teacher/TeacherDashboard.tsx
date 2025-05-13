import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Users, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Task {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  dueDate: string;
  estimatedTime?: string;
  instructions?: string;
  isLocked: boolean;
  isCompleted: boolean;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://localhost:8000/tasks");
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        setTasks(data);
        console.log("Fetched tasks:", data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await fetch("http://localhost:8000/users?role=student");
        if (!response.ok) throw new Error("Failed to fetch students");
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        setStudents([]);
      }
    };

    fetchTasks();
    fetchStudents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="md:pl-24 lg:pl-72 pt-4 pb-20 md:pb-4 md:pt-4">
        <div className="content-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Teacher Profile Card */}
            <Card className="lg:col-span-1 animate-fade-in">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16 border-4 border-purple-light">
                    {user?.profileImage ? (
                      <AvatarImage src={user.profileImage} alt={user.name} />
                    ) : (
                      <AvatarFallback className="bg-gradient-main text-white">
                        {user?.name?.slice(0, 2).toUpperCase() || "TE"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">Welcome, {user?.name || "Teacher"}!</h2>
                    <p className="text-muted-foreground">Teacher Dashboard</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Quick Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-light/20 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-purple">{tasks.length}</div>
                      <div className="text-xs text-muted-foreground">Total Tasks</div>
                    </div>
                    <div className="bg-blue-light/20 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-blue">{students.length}</div>
                      <div className="text-xs text-muted-foreground">Students</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Button 
                    onClick={() => navigate("/teacher/tasks")} 
                    className="w-full bg-gradient-main"
                  >
                    <PlusCircle size={16} className="mr-2" />
                    Create New Task
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Tasks and Submissions Overview */}
            <div className="lg:col-span-2 animate-fade-in space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Recent Submissions</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => navigate("/teacher/submissions")}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.slice(0, 5).map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell className="font-medium">{submission.taskTitle}</TableCell>
                          <TableCell>{submission.studentName}</TableCell>
                          <TableCell>{submission.date}</TableCell>
                          <TableCell>
                            <span 
                              className={`px-2 py-1 text-xs rounded-full ${
                                submission.status === 'Graded' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {submission.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                      {submissions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No submissions yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl">Students</CardTitle>
                      <Users size={20} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {students.slice(0, 5).map((student) => (
                        <div key={student.id} className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            {student.profileImage ? (
                              <AvatarImage src={student.profileImage} alt={student.name} />
                            ) : (
                              <AvatarFallback>{student.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      ))}
                      {students.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">No students enrolled</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl">Tasks</CardTitle>
                      <FileText size={20} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {tasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-xs text-muted-foreground">Due: {task.dueDate}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => navigate(`/teacher/task/${task.id}`)}
                          >
                            Edit
                          </Button>
                        </div>
                      ))}
                      {tasks.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">No tasks created</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
