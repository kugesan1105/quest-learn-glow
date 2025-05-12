import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast"; // Import toast for error notifications

interface Task {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  dueDate: string; // This will be a string like "YYYY-MM-DD"
  estimatedTime?: string;
  instructions?: string;
  isLocked: boolean;
  isCompleted: boolean;
}

// Helper function to parse "YYYY-MM-DD" string to a local Date object at midnight
function parseDueDate(dueDateString: string): Date | null {
  console.log(' dueDateString ---> ', dueDateString);
  if (!dueDateString || !/^\d{4}-\d{2}-\d{2}$/.test(dueDateString)) {
    return null;
  }
  const parts = dueDateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
  const day = parseInt(parts[2], 10);
  
  const date = new Date(year, month, day);
  console.log(' date ---> ', date);
  // Verify if the created date is valid (e.g., for inputs like "2023-02-30")
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  console.log(' date ---> ', date);
  return date;
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://localhost:8000/tasks"); // Adjust URL if needed
        if (!response.ok) {
          throw new Error("Failed to fetch tasks for calendar");
        }
        const data = await response.json();
        setAllTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast({
          title: "Error",
          description: "Could not fetch tasks for the calendar.",
          variant: "destructive",
        });
      }
    };
    fetchTasks();
  }, []);

  // Derive taskDueDates from fetched tasks using the robust parser
  const taskDueDates = allTasks
    .map(task => {
      const parsedDate = parseDueDate(task.dueDate);
      if (!parsedDate) return null;
      return {
        date: parsedDate,
        title: task.title,
      };
    })
    .filter(task => task !== null) as { date: Date; title: string }[];

  // Find tasks due on the selected date using the robust parser and comparison
  const selectedDateTasks = allTasks.filter(
    (task) => {
      if (!date) return false;
      const taskDueDate = parseDueDate(task.dueDate);
      if (!taskDueDate) return false;

      // Normalize the selected date from the calendar to midnight for accurate comparison
      const selectedDayAtMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      return (
        taskDueDate.getFullYear() === selectedDayAtMidnight.getFullYear() &&
        taskDueDate.getMonth() === selectedDayAtMidnight.getMonth() &&
        taskDueDate.getDate() === selectedDayAtMidnight.getDate()
      );
    }
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="md:pl-24 lg:pl-72 pt-4 pb-20 md:pb-4 md:pt-4">
        <div className="content-container p-4">
          <h2 className="page-heading mb-6">Learning Schedule</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 animate-fade-in">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border p-3 pointer-events-auto"
                    // Highlight dates with tasks
                    modifiers={{
                      highlighted: taskDueDates.map(task => task.date)
                    }}
                    modifiersStyles={{
                      highlighted: { backgroundColor: "rgba(155, 135, 245, 0.15)" }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>
                  {date ? (
                    <>Tasks for {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</>
                  ) : (
                    <>Select a Date</>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateTasks.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateTasks.map((task, index) => (
                      <div key={index} className="p-3 border rounded-md bg-white shadow-sm">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">Due today</div>
                        <Badge className="mt-2 bg-purple">Task Due</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {date ? "No tasks scheduled for this day" : "Select a date to view tasks"}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
