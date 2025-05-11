
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { TaskForm } from "@/components/teacher/TaskForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function EditTask() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load tasks from localStorage
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      const parsedTasks = JSON.parse(storedTasks);
      const foundTask = parsedTasks.find((t: any) => t.id.toString() === taskId);
      if (foundTask) {
        setTask(foundTask);
      }
    }
    setIsLoading(false);
  }, [taskId]);

  const handleUpdateTask = (updatedTaskData: any) => {
    // Get all tasks
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      const parsedTasks = JSON.parse(storedTasks);
      
      // Find the task to update
      const updatedTasks = parsedTasks.map((t: any) => {
        if (t.id.toString() === taskId) {
          return { ...t, ...updatedTaskData };
        }
        return t;
      });
      
      // Save back to localStorage
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      
      // Show success message
      toast({
        title: "Task updated",
        description: "The task has been updated successfully.",
      });
      
      // Navigate back to task management
      navigate("/teacher/tasks");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="md:pl-24 lg:pl-72 pt-4">
          <div className="content-container">
            <p>Loading task...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="md:pl-24 lg:pl-72 pt-4">
          <div className="content-container">
            <h1 className="page-heading">Task Not Found</h1>
            <p className="text-muted-foreground mb-6">The task you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/teacher/tasks")}>
              <ChevronLeft size={16} className="mr-2" />
              Back to Tasks
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="md:pl-24 lg:pl-72 pt-4 pb-20 md:pb-4 md:pt-4">
        <div className="content-container">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 flex items-center gap-1"
            onClick={() => navigate("/teacher/tasks")}
          >
            <ChevronLeft size={16} />
            Back to Tasks
          </Button>

          <h1 className="page-heading mb-6">Edit Task</h1>
          
          <Card className="p-6">
            <TaskForm 
              initialData={{
                title: task.title,
                description: task.description,
                videoUrl: task.videoUrl,
                dueDate: task.dueDate,
                estimatedTime: task.estimatedTime || "",
                instructions: task.instructions || "",
              }}
              onSubmit={handleUpdateTask}
              onCancel={() => navigate("/teacher/tasks")}
              isEdit={true}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
