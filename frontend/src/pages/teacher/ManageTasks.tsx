import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskForm } from "@/components/teacher/TaskForm";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Task {
  id: string; // MongoDB ObjectId string
  title: string;
  description: string;
  videoUrl?: string;
  dueDate: string;
  estimatedTime?: string;
  instructions?: string;
  isLocked: boolean;
  isCompleted: boolean;
}

export default function ManageTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null); // ID is now string

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("{url}/tasks"); // Adjust URL if needed
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast({
          title: "Error",
          description: "Could not fetch tasks.",
          variant: "destructive",
        });
      }
    };
    fetchTasks();
  }, []);

  const handleAddTask = async (newTaskData: Omit<Task, 'id' | 'isLocked' | 'isCompleted'>) => {
    try {
      const response = await fetch("http://localhost:8000/tasks", { // Adjust URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newTaskData, isLocked: false, isCompleted: false }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create task");
      }
      const createdTask = await response.json();
      setTasks(prevTasks => [...prevTasks, createdTask]);
      setIsAddDialogOpen(false);
      toast({
        title: "Task created",
        description: "The task has been created successfully.",
      });
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast({
        title: "Error creating task",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (taskToDelete === null) return;
    
    try {
      const response = await fetch(`http://localhost:8000/tasks/${taskToDelete}`, { // Adjust URL
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete task");
      }
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete));
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error deleting task",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="md:pl-24 lg:pl-72 pt-4 pb-20 md:pb-4 md:pt-4">
        <div className="content-container">
          <div className="flex justify-between items-center mb-6">
            <h1 className="page-heading">Manage Tasks</h1>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-main"
            >
              <PlusCircle size={16} className="mr-2" />
              Add Task
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">All Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{task.description}</TableCell>
                      <TableCell>{task.dueDate}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/teacher/task/${task.id}`)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteClick(task.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {tasks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10">
                        <p className="text-muted-foreground">No tasks have been created yet</p>
                        <Button 
                          onClick={() => setIsAddDialogOpen(true)} 
                          variant="outline"
                          className="mt-4"
                        >
                          <PlusCircle size={16} className="mr-2" />
                          Create your first task
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add task details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <TaskForm onSubmit={handleAddTask} onCancel={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
