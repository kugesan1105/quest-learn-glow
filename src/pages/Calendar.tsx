
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Sample task due dates
  const taskDueDates = [
    { date: new Date(2025, 3, 15), title: "Introduction to Web Development" },
    { date: new Date(2025, 3, 18), title: "Advanced CSS Techniques" },
    { date: new Date(2025, 3, 20), title: "JavaScript Fundamentals" },
    { date: new Date(2025, 3, 25), title: "Building Interactive UIs" },
    { date: new Date(2025, 3, 30), title: "Introduction to React" },
    { date: new Date(2025, 4, 5), title: "Building a Full-Stack App" },
  ];

  // Find tasks due on the selected date
  const selectedDateTasks = taskDueDates.filter(
    (task) => 
      date && 
      task.date.getDate() === date.getDate() &&
      task.date.getMonth() === date.getMonth() &&
      task.date.getFullYear() === date.getFullYear()
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
