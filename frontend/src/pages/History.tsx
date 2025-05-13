import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { Eye, Download, FileText } from "lucide-react";
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

// Consistent Submission interface
interface Submission {
  id: string;
  taskId: string;
  taskTitle: string;
  studentId: string; // Assumed to be the student's email or a unique ID stored in localStorage
  studentName: string;
  studentImage?: string;
  submissionDate: string; // ISO date string
  fileName: string;
  fileSize: number;
  status: "pending" | "graded";
  grade?: string;
  feedback?: string;
}

export default function History() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:8000/submissions");
        if (!response.ok) {
          throw new Error("Failed to fetch submissions");
        }
        const allSubmissions = await response.json() as Submission[];

        // Get student identifier from localStorage
        const studentEmail = localStorage.getItem("userEmail");
        console.log("Student email from localStorage:", studentEmail);
        if (studentEmail) {
          console.log("Student email from localStorage:", studentEmail);
          setCurrentStudentId(studentEmail);
          const studentSubmissions = allSubmissions.filter(
            (sub) => sub.studentId === studentEmail
          );
          setSubmissions(studentSubmissions);
        } else {
          // If no student identifier is found, show an error
          setSubmissions([]);
          setError("Student identifier not found. Please log in again.");
        }
      } catch (err) {
        console.error("Error fetching submissions:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
        toast({
          title: "Error",
          description: `Could not load submission history: ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const handleViewDetails = (submission: Submission) => {
    setSelectedSubmission(submission);
    setViewDialogOpen(true);
  };

  const downloadFile = async (submission: Submission) => {
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
    } catch (downloadError) {
      console.error("Download error:", downloadError);
      toast({
        title: "Download Error",
        description: `Could not download ${submission.fileName}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const formatFileSize = (sizeInBytes: number) => {
    if (!sizeInBytes) return 'N/A';
    return (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="md:pl-24 lg:pl-72 pt-4 pb-20 md:pb-4 md:pt-4">
        <div className="content-container">
          <h1 className="page-heading mb-6">Submission History</h1>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Submitted Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && <p>Loading submission history...</p>}
              {!isLoading && error && <p className="text-red-500">{error}</p>}
              {!isLoading && !error && submissions.length === 0 && (
                <div className="text-center py-10">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-muted-foreground">You haven't submitted any tasks yet.</p>
                </div>
              )}
              {!isLoading && !error && submissions.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task Title</TableHead>
                      <TableHead>Submitted On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.taskTitle}</TableCell>
                        <TableCell>{formatDate(submission.submissionDate)}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              submission.status === 'graded'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {submission.status === 'graded' ? 'Graded' : 'Pending Review'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {submission.status === 'graded' ? (
                            <span className="font-semibold">{submission.grade || 'N/A'}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(submission)}
                          >
                            <Eye size={16} className="mr-1 md:mr-2" />
                            <span className="hidden md:inline">Details</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4 pb-4 border-b">
                <Avatar className="h-12 w-12">
                  {selectedSubmission.studentImage ? (
                    <AvatarImage src={selectedSubmission.studentImage} alt={selectedSubmission.studentName} />
                  ) : (
                    <AvatarFallback>
                      {selectedSubmission.studentName ? selectedSubmission.studentName.slice(0, 2).toUpperCase() : 'SN'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{selectedSubmission.studentName}</p>
                  <p className="text-sm text-muted-foreground">
                    Submitted on {formatDate(selectedSubmission.submissionDate)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Task</p>
                <p className="text-lg">{selectedSubmission.taskTitle}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Submitted File</p>
                <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md mt-1">
                  <span className="truncate" title={selectedSubmission.fileName}>
                    {selectedSubmission.fileName} ({formatFileSize(selectedSubmission.fileSize)})
                  </span>
                  <Button size="sm" variant="outline" onClick={() => downloadFile(selectedSubmission)}>
                    <Download size={16} className="mr-2" /> Download
                  </Button>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className={`font-semibold ${selectedSubmission.status === 'graded' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {selectedSubmission.status === 'graded' ? 'Graded' : 'Pending Review'}
                </p>
              </div>

              {selectedSubmission.status === "graded" && (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Grade</p>
                    <p className="text-xl font-bold">{selectedSubmission.grade || "Not Graded"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Feedback</p>
                    <div className="bg-gray-100 p-3 rounded-md mt-1 min-h-[80px]">
                      <p className="text-sm">{selectedSubmission.feedback || "No feedback provided."}</p>
                    </div>
                  </div>
                </>
              )}
               {selectedSubmission.status === "pending" && (
                 <div>
                    <p className="text-sm font-medium text-muted-foreground">Feedback</p>
                    <div className="bg-gray-100 p-3 rounded-md mt-1 min-h-[80px]">
                      <p className="text-sm text-muted-foreground">Your submission is awaiting review. Feedback will appear here once graded.</p>
                    </div>
                 </div>
               )}


              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
