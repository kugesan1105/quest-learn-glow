import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { FileUpload } from "@/components/FileUpload";
import { Confetti } from "@/components/ui/confetti";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { CheckCircle, ChevronLeft, Clock, Eye, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getYoutubeEmbedUrl } from "@/lib/utils";

export default function Task() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Fetch user details from AuthContext
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentTask, setCurrentTask] = useState<any | null>(null);
  const [studentSubmission, setStudentSubmission] = useState<any | null>(null);
  const [isLoadingSubmission, setIsLoadingSubmission] = useState(true);

  // Fetch task details
  useEffect(() => {
    if (taskId) {
      const fetchTaskDetails = async () => {
        try {
          const response = await fetch(`http://localhost:8000/tasks/${taskId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch task details");
          }
          const data = await response.json();
          setCurrentTask(data);
        } catch (error) {
          console.error("Error fetching task:", error);
          toast({
            title: "Error",
            description: "Could not load task details.",
            variant: "destructive",
          });
        }
      };
      fetchTaskDetails();
    }
  }, [taskId]);

  // Fetch student's submission for this task
  useEffect(() => {
    const fetchSubmission = async () => {
      if (!taskId || !user?.email) return;
      setIsLoadingSubmission(true);
      try {
        const res = await fetch(`http://localhost:8000/submissions?taskId=${taskId}&studentId=${user.email}`);
        if (res.ok) {
          const data = await res.json();
          setStudentSubmission(data.length > 0 ? data[0] : null);
        }
      } catch (e) {
        setStudentSubmission(null);
      }
      setIsLoadingSubmission(false);
    };
    fetchSubmission();
  }, [taskId, user?.email, isSubmitted]);

  // For this demo, we'll use mock data if currentTask is null
  const task = currentTask || {
    id: taskId || "1",
    title: "Introduction to Web Development",
    description: "In this task, you will learn the foundations of HTML, CSS, and JavaScript, which are the building blocks of modern web development. Follow along with the video and complete the exercises to gain a solid understanding of these technologies.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    isCompleted: false,
    dueDate: "April 15, 2025",
    estimatedTime: "45 minutes",
    instructions: "Watch the video tutorial and then create a simple webpage using HTML and CSS. Your webpage should include a header, navigation menu, main content section, and footer. Use CSS to style these elements attractively."
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setIsSubmitted(false);
  };

  const handleSubmit = async () => {
    if (!selectedFile || !taskId) {
      toast({
        title: "No file selected",
        description: "Please select a file to submit",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("student_id", user?.email || "unknown_student@example.com");
    formData.append("student_name", user?.name || "Unknown Student");
    if (user?.profileImage) {
      formData.append("student_image", user.profileImage);
    }
    formData.append("task_title", task.title);

    try {
      let url = `http://localhost:8000/tasks/${taskId}/submit`;
      let method = "POST";
      if (studentSubmission) {
        // If already submitted, update/replace
        url = `http://localhost:8000/submissions/${studentSubmission.id}/replace`;
        method = "PUT";
      }
      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Submission failed with status: " + response.status }));
        throw new Error(errorData.detail || "File upload failed");
      }

      setIsSubmitted(true);
      setShowConfetti(true);

      toast({
        title: studentSubmission ? "Submission updated!" : "Task submitted!",
        description: "Your work has been submitted successfully.",
        variant: "default",
      });

      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Error",
        description: error.message || "Could not submit your task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubmission = async () => {
    if (!studentSubmission) return;
    try {
      const res = await fetch(`http://localhost:8000/submissions/${studentSubmission.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete submission");
      setStudentSubmission(null);
      setSelectedFile(null);
      setIsSubmitted(false);
      toast({
        title: "Submission removed",
        description: "You can now upload a new submission.",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Could not remove submission.",
        variant: "destructive",
      });
    }
  };

  if (!currentTask && taskId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading task details...</p>
      </div>
    );
  }

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
                      src={getYoutubeEmbedUrl(task.videoUrl)}
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
                {isLoadingSubmission ? (
                  <p>Loading your submission...</p>
                ) : studentSubmission ? (
                  <div className="border rounded-md p-4 mb-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{studentSubmission.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {new Date(studentSubmission.submissionDate).toLocaleString()}
                        </p>
                        {studentSubmission.status === "graded" && (
                          <div className="mt-2">
                            <span className="font-bold">Grade: {studentSubmission.grade}</span>
                            <p className="text-sm text-muted-foreground">Feedback: {studentSubmission.feedback || "No feedback"}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`http://localhost:8000/submissions/file/${studentSubmission.id}`, "_blank")}
                        >
                          <Eye size={16} className="mr-1" /> View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleDeleteSubmission}
                        >
                          <Trash2 size={16} className="mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Want to update your submission? Upload a new file below:</p>
                    </div>
                  </div>
                ) : null}

                <FileUpload
                  onFileSelect={handleFileSelect}
                  submitted={isSubmitted}
                  disabled={studentSubmission && !selectedFile}
                />

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleSubmit}
                    className={isSubmitted ? "bg-green-500 hover:bg-green-600" : "btn-gradient"}
                    disabled={isSubmitted || !selectedFile}
                  >
                    {studentSubmission
                      ? "Update Submission"
                      : isSubmitted
                        ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle size={16} />
                            Submitted
                          </span>
                        )
                        : "Submit Task"
                    }
                  </Button>
                </div>
              </div>
            </div>

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
