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

export default function Submissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    // In a real app with Supabase, we'd fetch submissions from the database
    // For now, submissions will be empty until a backend is integrated.
    setSubmissions([]);
  }, []);

  const pendingSubmissions = submissions.filter(s => s.status === "pending");
  const gradedSubmissions = submissions.filter(s => s.status === "graded");

  const handleViewSubmission = (submission: any) => {
    setSelectedSubmission(submission);
    setViewDialogOpen(true);
  };

  const handleGradeSubmission = (submission: any) => {
    setSelectedSubmission(submission);
    setFeedback(submission.feedback || "");
    setFeedbackDialogOpen(true);
  };

  const submitFeedback = () => {
    if (selectedSubmission) {
      // Update the submission with feedback
      const updatedSubmissions = submissions.map(s => {
        if (s.id === selectedSubmission.id) {
          return {
            ...s,
            feedback,
            status: "graded",
            grade: "A" // In a real app, you would have a grade input
          };
        }
        return s;
      });
      
      setSubmissions(updatedSubmissions);
      setFeedbackDialogOpen(false);
      
      // In a real app, this would be saved to the database
      toast({
        title: "Feedback submitted",
        description: "The feedback has been saved successfully.",
      });
    }
  };

  const downloadSubmission = (submission: any) => {
    // In a real app, this would download the actual file
    toast({
      title: "Download started",
      description: `Downloading ${submission.fileName}`,
    });
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
                              <span>{submission.studentName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{submission.taskTitle}</TableCell>
                          <TableCell>{submission.submissionDate}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <span>{submission.fileName}</span>
                              <span className="text-xs text-muted-foreground">({submission.fileSize})</span>
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
                              <span>{submission.studentName}</span>
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
                              <span>{submission.studentName}</span>
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

      {/* View Submission Dialog */}
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
                    <AvatarFallback>{selectedSubmission.studentName.slice(0, 2)}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium">{selectedSubmission.studentName}</p>
                  <p className="text-sm text-muted-foreground">Submitted on {selectedSubmission.submissionDate}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Task</p>
                <p>{selectedSubmission.taskTitle}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Submitted File</p>
                <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md">
                  <span>{selectedSubmission.fileName} ({selectedSubmission.fileSize})</span>
                  <Button size="sm" variant="outline" onClick={() => downloadSubmission(selectedSubmission)}>
                    <Download size={16} className="mr-2" /> Download
                  </Button>
                </div>
              </div>
              
              {selectedSubmission.status === "graded" && (
                <div>
                  <p className="text-sm font-medium">Feedback</p>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <p>{selectedSubmission.feedback}</p>
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

      {/* Feedback Dialog */}
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
                <textarea
                  id="feedback"
                  className="w-full min-h-[150px] p-3 border rounded-md"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback on the submission..."
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="grade" className="text-sm font-medium">Grade</label>
                <select
                  id="grade"
                  className="w-full p-2 border rounded-md"
                  defaultValue="A"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="F">F</option>
                </select>
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
