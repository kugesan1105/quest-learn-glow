import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FileText, Lock, Video } from "lucide-react";

export interface Task {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  isLocked: boolean;
  isCompleted: boolean;
  dueDate: string;
}

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  studentSubmissionStatus?: "pending" | "graded"; // Add this prop
}

export function TaskCard({ task, onClick, studentSubmissionStatus }: TaskCardProps) {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);

  const handleClick = () => {
    if (task.isLocked) return;
    if (onClick) {
      onClick();
    } else {
      navigate(`/task/${task.id}`);
    }
  };

  return (
    <Card
      className={cn(
        "task-card",
        task.isLocked && "task-card-locked",
        "overflow-hidden"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative overflow-hidden">
        <div
          className="h-40 bg-gradient-card flex items-center justify-center"
        >
          {task.isLocked ? (
            <Lock size={40} className="text-white opacity-80" />
          ) : (
            <Video size={40} className="text-white" />
          )}
        </div>
        {studentSubmissionStatus === "graded" ? (
          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
            ✓
          </div>
        ) : null}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">
          {task.title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className={cn(
          "text-sm text-muted-foreground line-clamp-2",
          task.isLocked && "blur-sm"
        )}>
          {task.isLocked ? "This content will be unlocked as you progress" : task.description}
        </p>
      </CardContent>

      <CardFooter className="pt-2 flex justify-between">
        {!task.isLocked && (
          <>
            <div className="text-xs text-muted-foreground">
              <FileText size={14} className="inline mr-1" />
              Due: {task.dueDate}
            </div>
            <Button
              size="sm"
              onClick={handleClick}
              className={cn(
                "transition-all",
                studentSubmissionStatus === "graded"
                  ? "bg-green-500 hover:bg-green-600"
                  : "btn-gradient"
              )}
            >
              {studentSubmissionStatus === "graded"
                ? "Completed"
                : studentSubmissionStatus === "pending"
                ? "Pending Review"
                : "Start"}
            </Button>
          </>
        )}
        {task.isLocked && (
          <div className="w-full flex justify-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Lock size={14} /> Locked
            </span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
