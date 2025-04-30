
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileText, Search, Video } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function History() {
  // Mock data for completed tasks
  const completedTasks = [
    {
      id: 1,
      title: "Introduction to Web Development",
      type: "video",
      submissionDate: "April 12, 2025",
      fileName: "intro_project.zip",
      fileSize: "2.4 MB",
      feedback: "Great work! Your HTML structure is excellent.",
      grade: "A",
    },
    {
      id: 2,
      title: "HTML Fundamentals",
      type: "document",
      submissionDate: "April 5, 2025",
      fileName: "html_exercise.pdf",
      fileSize: "1.1 MB",
      feedback: "Good understanding of semantic tags.",
      grade: "B+",
    },
    {
      id: 3,
      title: "CSS Basics",
      type: "video",
      submissionDate: "March 29, 2025",
      fileName: "css_project.zip",
      fileSize: "3.7 MB",
      feedback: "Nice use of Flexbox and Grid layouts!",
      grade: "A-",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="md:pl-24 lg:pl-72 pt-4 pb-20 md:pb-4 md:pt-4">
        <div className="content-container">
          <h1 className="page-heading">Submission History</h1>
          
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input className="pl-10" placeholder="Search submissions..." />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Filter</Button>
              <Button variant="outline">Sort by Date</Button>
            </div>
          </div>
          
          <div className="space-y-6 animate-fade-in">
            {completedTasks.map((task) => (
              <Card key={task.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-16 bg-gradient-card flex items-center justify-center p-4 md:p-0">
                    {task.type === "video" ? (
                      <Video size={24} className="text-white" />
                    ) : (
                      <FileText size={24} className="text-white" />
                    )}
                  </div>
                  
                  <div className="p-6 flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-medium mb-1">{task.title}</h2>
                        <p className="text-sm text-muted-foreground">
                          Submitted on {task.submissionDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium bg-purple-light text-purple px-3 py-1 rounded-full">
                          Grade: {task.grade}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <span className="font-medium">Feedback:</span> {task.feedback}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Submission:</span> {task.fileName} ({task.fileSize})
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Download size={16} />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            {completedTasks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No submissions yet. Complete some tasks to see your history!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
