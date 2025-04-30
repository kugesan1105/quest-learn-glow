
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { FileUpload } from "@/components/FileUpload";
import { Confetti } from "@/components/ui/confetti";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { CheckCircle, ChevronLeft, Clock } from "lucide-react";

export default function Task() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // For this demo, we'll use mock data
  const task = {
    id: taskId || "1",
    title: "Introduction to Web Development",
    description: "In this task, you will learn the foundations of HTML, CSS, and JavaScript, which are the building blocks of modern web development. Follow along with the video and complete the exercises to gain a solid understanding of these technologies.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Just a placeholder
    isCompleted: false,
    dueDate: "April 15, 2025",
    estimatedTime: "45 minutes",
    instructions: "Watch the video tutorial and then create a simple webpage using HTML and CSS. Your webpage should include a header, navigation menu, main content section, and footer. Use CSS to style these elements attractively."
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to submit",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, we would upload the file here
    // For now, just show success state
    setIsSubmitted(true);
    setShowConfetti(true);
    
    toast({
      title: "Task submitted!",
      description: "Your work has been submitted successfully.",
      variant: "default",
    });
    
    // Hide confetti after a few seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Confetti isActive={showConfetti} />
      
      <div className="md:pl-24 lg:pl-72 pt-4 pb-20 md:pb-4 md:pt-4">
        <div className="content-container">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 flex items-center gap-1"
            onClick={() => navigate("/dashboard")}
          >
            <ChevronLeft size={16} />
            Back to Dashboard
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task Details */}
            <div className="lg:col-span-2 space-y-6 animate-fade-in">
              <div>
                <h1 className="page-heading">{task.title}</h1>
                <div className="flex flex-wrap gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock size={16} />
                    <span>Due: {task.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock size={16} />
                    <span>Estimated time: {task.estimatedTime}</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6">{task.description}</p>
                
                <Card className="overflow-hidden">
                  <div className="aspect-video w-full">
                    <iframe
                      src={task.videoUrl}
                      className="w-full h-full"
                      title="Task Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </Card>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2">Instructions</h2>
                <p className="text-muted-foreground">{task.instructions}</p>
              </div>

              <Separator />

              <div>
                <h2 className="text-xl font-bold mb-4">Your Submission</h2>
                <FileUpload 
                  onFileSelect={handleFileSelect}
                  submitted={isSubmitted}
                  disabled={isSubmitted}
                />
                
                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={handleSubmit} 
                    className={isSubmitted ? "bg-green-500 hover:bg-green-600" : "btn-gradient"}
                    disabled={isSubmitted || !selectedFile}
                  >
                    {isSubmitted ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle size={16} />
                        Submitted
                      </span>
                    ) : (
                      "Submit Task"
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Task Timeline */}
            <div className="lg:col-span-1 animate-fade-in">
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Your Progress</h2>
                  
                  <div className="space-y-6">
                    <div className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">✓</div>
                        <div className="flex-1 w-px bg-green-500 my-1"></div>
                      </div>
                      <div>
                        <h3 className="font-medium">Started Task</h3>
                        <p className="text-sm text-muted-foreground">You've begun this task</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">✓</div>
                        <div className="flex-1 w-px bg-green-500 my-1"></div>
                      </div>
                      <div>
                        <h3 className="font-medium">Watched Video</h3>
                        <p className="text-sm text-muted-foreground">Video tutorial completed</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSubmitted ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                          {isSubmitted ? "✓" : "3"}
                        </div>
                        <div className={`flex-1 w-px my-1 ${isSubmitted ? "bg-green-500" : "bg-gray-200"}`}></div>
                      </div>
                      <div>
                        <h3 className="font-medium">Submit Your Work</h3>
                        <p className="text-sm text-muted-foreground">Upload your project file</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">4</div>
                      </div>
                      <div>
                        <h3 className="font-medium">Receive Feedback</h3>
                        <p className="text-sm text-muted-foreground">Wait for instructor review</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-4">Next Up</h2>
                <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-all">
                  <div className="h-20 bg-gradient-card-alt flex items-center justify-center">
                    <span className="text-white font-medium">Advanced CSS Techniques</span>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
