import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { CheckCircle, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

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
  const initialDueDate = initialData?.dueDate
    ? (() => {
        const [year, month, day] = initialData.dueDate.split("-");
        if (year && month && day) {
          return new Date(Number(year), Number(month) - 1, Number(day));
        }
        return undefined;
      })()
    : undefined;

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    videoUrl: initialData?.videoUrl || "",
    estimatedTime: initialData?.estimatedTime || "",
    instructions: initialData?.instructions || "",
  });
  const [dueDate, setDueDate] = useState<Date | undefined>(initialDueDate);

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    videoUrl: "",
    dueDate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleDueDateChange = (date: Date | undefined) => {
    setDueDate(date);
    if (errors.dueDate) {
      setErrors(prev => ({ ...prev, dueDate: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors = {
      title: formData.title.trim() === "" ? "Title is required" : "",
      description: formData.description.trim() === "" ? "Description is required" : "",
      videoUrl: formData.videoUrl.trim() === "" ? "Video URL is required" : "",
      dueDate: !dueDate ? "Due date is required" : "",
    };
    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const formattedDueDate = dueDate
        ? `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")}`
        : "";
      onSubmit({
        ...formData,
        dueDate: formattedDueDate,
      });
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${!dueDate ? "text-muted-foreground" : ""}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "yyyy-MM-dd") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={handleDueDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
