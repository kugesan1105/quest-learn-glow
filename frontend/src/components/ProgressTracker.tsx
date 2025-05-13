
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressTrackerProps {
  completedTasks: number;
  totalTasks: number;
  className?: string;
}

export function ProgressTracker({
  completedTasks,
  totalTasks,
  className,
}: ProgressTrackerProps) {
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between mb-2 text-sm">
        <div className="font-medium">Your Progress</div>
        <div className="text-muted-foreground">
          {completedTasks}/{totalTasks} tasks
        </div>
      </div>
      <Progress
        value={progress}
        className="h-3 bg-purple-light"
      />
      <div className="flex justify-between mt-2">
        <div className="text-xs text-muted-foreground">
          {progress.toFixed(0)}% Complete
        </div>
        <div className="text-xs text-purple font-medium">
          {completedTasks === totalTasks
            ? "All tasks completed!"
            : `${totalTasks - completedTasks} tasks remaining`}
        </div>
      </div>
    </div>
  );
}
