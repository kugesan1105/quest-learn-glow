
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";

interface TaskFormProps {
  initialData?: {
    title: string;
    description: string;
    videoUrl: string;
    dueDate: string;
    estimatedTime: string;
    instructions: string;
  };
  onSubmit: (taskData: any) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export function TaskForm({ initialData, onSubmit, onCancel, isEdit = false }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    videoUrl: initialData?.videoUrl || "",
    dueDate: initialData?.dueDate || "",
    estimatedTime: initialData?.estimatedTime || "",
    instructions: initialData?.instructions || "",
  });
  
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    videoUrl: "",
    dueDate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors = {
      title: formData.title.trim() === "" ? "Title is required" : "",
      description: formData.description.trim() === "" ? "Description is required" : "",
      videoUrl: formData.videoUrl.trim() === "" ? "Video URL is required" : "",
      dueDate: formData.dueDate.trim() === "" ? "Due date is required" : "",
    };
    
    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="title">Task Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description"
            className="min-h-[100px]"
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input
              id="videoUrl"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="Enter video URL"
            />
            {errors.videoUrl && <p className="text-sm text-red-500">{errors.videoUrl}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              placeholder="e.g., Apr 15, 2025"
            />
            {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate}</p>}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="estimatedTime">Estimated Completion Time</Label>
          <Input
            id="estimatedTime"
            name="estimatedTime"
            value={formData.estimatedTime}
            onChange={handleChange}
            placeholder="e.g., 45 minutes"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="instructions">Detailed Instructions</Label>
          <Textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            placeholder="Enter detailed instructions for the task"
            className="min-h-[150px]"
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-main">
          <CheckCircle size={16} className="mr-2" />
          {isEdit ? "Update Task" : "Create Task"}
        </Button>
      </DialogFooter>
    </form>
  );
}
