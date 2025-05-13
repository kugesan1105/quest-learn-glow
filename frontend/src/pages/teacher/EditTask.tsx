import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { TaskForm } from "@/components/teacher/TaskForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface TaskData {
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

export default function EditTask() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`http://localhost:8000/tasks/${taskId}`); // Adjust URL
        if (!response.ok) {
          if (response.status === 404) {
            setTask(null);
          } else {
            throw new Error("Failed to fetch task");
          }
        } else {
          const data = await response.json();
          setTask(data);
        }
      } catch (error) {
        console.error("Error fetching task:", error);
        toast({
          title: "Error",
          description: "Failed to load task details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  const handleUpdateTask = async (updatedTaskData: any) => {
    if (!taskId) return;

    try {
      const response = await fetch(`http://localhost:8000/tasks/${taskId}`, { // Adjust URL
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTaskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update task");
      }
      
      toast({
        title: "Task updated",
        description: "The task has been updated successfully.",
      });
      
      navigate("/teacher/tasks");
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast({
        title: "Error updating task",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
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
