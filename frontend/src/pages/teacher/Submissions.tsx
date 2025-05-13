import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { CheckCircle, Download, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Submission {
  id: string;
  taskId: string;
  taskTitle: string;
  studentId: string;
  studentName: string;
  studentImage?: string;
  submissionDate: string;
  fileName: string;
  fileSize: number;
  status: "pending" | "graded";
  grade?: string;
  feedback?: string;
}

export default function Submissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [grade, setGrade] = useState("A");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch("http://localhost:8000/submissions");
        if (!response.ok) {
          throw new Error("Failed to fetch submissions");
        }
        const data = await response.json();
        setSubmissions(data as Submission[]);
      } catch (error) {
        console.error("Error fetching submissions:", error);
        toast({
          title: "Error",
          description: "Could not load submissions.",
          variant: "destructive",
        });
      }
    };
    fetchSubmissions();
  }, []);

  const pendingSubmissions = submissions.filter(s => s.status === "pending");
  const gradedSubmissions = submissions.filter(s => s.status === "graded");

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setViewDialogOpen(true);
  };

  const handleGradeSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setFeedbackText(submission.feedback || "");
    setGrade(submission.grade || "A");
    setFeedbackDialogOpen(true);
  };

  const submitFeedback = async () => {
    if (selectedSubmission) {
      try {
        const response = await fetch(`http://localhost:8000/submissions/${selectedSubmission.id}/grade`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            feedback: feedbackText,
            grade: grade,
            status: "graded",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to submit feedback");
        }

        const updatedSubmission = await response.json();

        setSubmissions(prevSubmissions =>
          prevSubmissions.map(s =>
            s.id === selectedSubmission.id ? { ...s, ...updatedSubmission } : s
          )
        );
        setFeedbackDialogOpen(false);

        toast({
          title: "Feedback submitted",
          description: "The feedback has been saved successfully.",
        });

      } catch (error) {
        console.error("Error submitting feedback:", error);
        toast({
          title: "Error",
          description: "Could not submit feedback. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const downloadSubmission = async (submission: Submission) => {
    try {
      const response = await fetch(`http://localhost:8000/submissions/file/${submission.id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = submission.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: `Downloading ${submission.fileName}`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Error",
        description: `Could not download ${submission.fileName}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="md:pl-24 lg:pl-72 pt-4 pb-20 md:pb-4 md:pt-4">
        <div className="content-container">
          <h1 className="page-heading mb-6">Student Submissions</h1>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending Review</TabsTrigger>
              <TabsTrigger value="graded">Graded</TabsTrigger>
              <TabsTrigger value="all">All Submissions</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Submissions Awaiting Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>File</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingSubmissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                {submission.studentImage ? (
                                  <AvatarImage src={submission.studentImage} />
                                ) : (
                                  <AvatarFallback>{submission.studentName.slice(0, 2)}</AvatarFallback>
                                )}
                              </Avatar>
                              <span>{submission.studentName || "Unknown Student"}</span>
                            </div>
                          </TableCell>
                          <TableCell>{submission.taskTitle}</TableCell>
                          <TableCell>{submission.submissionDate}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <span>{submission.fileName}</span>
                              <span className="text-xs text-muted-foreground">
                                ({submission.fileSize ? (submission.fileSize / (1024 * 1024)).toFixed(2) + ' MB' : 'N/A'})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleViewSubmission(submission)}>
                                <Eye size={16} />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => downloadSubmission(submission)}>
                                <Download size={16} />
                              </Button>
                              <Button size="sm" onClick={() => handleGradeSubmission(submission)}>
                                Grade
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {pendingSubmissions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10">
                            <p className="text-muted-foreground">No pending submissions</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="graded" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Graded Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gradedSubmissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                {submission.studentImage ? (
                                  <AvatarImage src={submission.studentImage} />
                                ) : (
                                  <AvatarFallback>{submission.studentName.slice(0, 2)}</AvatarFallback>
                                )}
                              </Avatar>
                              <span>{submission.studentName || "Unknown Student"}</span>
                            </div>
                          </TableCell>
                          <TableCell>{submission.taskTitle}</TableCell>
                          <TableCell>{submission.submissionDate}</TableCell>
                          <TableCell>
                            <span className="font-medium">{submission.grade}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleViewSubmission(submission)}>
                                <Eye size={16} />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => downloadSubmission(submission)}>
                                <Download size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {gradedSubmissions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10">
                            <p className="text-muted-foreground">No graded submissions</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">All Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                {submission.studentImage ? (
                                  <AvatarImage src={submission.studentImage} />
                                ) : (
                                  <AvatarFallback>{submission.studentName.slice(0, 2)}</AvatarFallback>
                                )}
                              </Avatar>
                              <span>{submission.studentName || "Unknown Student"}</span>
                            </div>
                          </TableCell>
                          <TableCell>{submission.taskTitle}</TableCell>
                          <TableCell>{submission.submissionDate}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                submission.status === 'graded'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {submission.status === "graded" ? "Graded" : "Pending"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleViewSubmission(submission)}>
                                <Eye size={16} />
                              </Button>
                              {submission.status === "pending" && (
                                <Button size="sm" onClick={() => handleGradeSubmission(submission)}>
                                  Grade
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {submissions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10">
                            <p className="text-muted-foreground">No submissions found</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 pb-4 border-b">
                <Avatar className="h-10 w-10">
                  {selectedSubmission.studentImage ? (
                    <AvatarImage src={selectedSubmission.studentImage} />
                  ) : (
                    <AvatarFallback>{selectedSubmission.studentName ? selectedSubmission.studentName.slice(0, 2).toUpperCase() : 'SN'}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium">{selectedSubmission.studentName}</p>
                  <p className="text-sm text-muted-foreground">Submitted on {new Date(selectedSubmission.submissionDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Task</p>
                <p>{selectedSubmission.taskTitle}</p>
              </div>

              <div>
                <p className="text-sm font-medium">Submitted File</p>
                <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md">
                  <span>
                    {selectedSubmission.fileName}
                    ({selectedSubmission.fileSize ? (selectedSubmission.fileSize / (1024 * 1024)).toFixed(2) + ' MB' : 'N/A'})
                  </span>
                  <Button size="sm" variant="outline" onClick={() => downloadSubmission(selectedSubmission)}>
                    <Download size={16} className="mr-2" /> Download
                  </Button>
                </div>
              </div>

              {selectedSubmission.status === "graded" && (
                <div>
                  <p className="text-sm font-medium">Feedback</p>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <p>{selectedSubmission.feedback || "No feedback provided yet."}</p>
                  </div>
                  <div className="mt-2 flex items-center">
                    <p className="text-sm font-medium mr-2">Grade:</p>
                    <span className="font-bold">{selectedSubmission.grade}</span>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
                {selectedSubmission.status === "pending" && (
                  <Button onClick={() => {
                    setViewDialogOpen(false);
                    handleGradeSubmission(selectedSubmission);
                  }}>
                    Provide Feedback
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Student</p>
                <p>{selectedSubmission.studentName}</p>
              </div>

              <div>
                <p className="text-sm font-medium">Task</p>
                <p>{selectedSubmission.taskTitle}</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="feedback" className="text-sm font-medium">Feedback</label>
                <Textarea
                  id="feedback"
                  className="w-full min-h-[150px] p-3 border rounded-md"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Provide feedback on the submission..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="grade" className="text-sm font-medium">Grade</label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger className="w-full p-2 border rounded-md">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submitFeedback} className="bg-gradient-main">
                  <CheckCircle size={16} className="mr-2" />
                  Submit Feedback
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
