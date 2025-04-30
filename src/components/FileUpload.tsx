
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { File, Upload } from "lucide-react";

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  className?: string;
  disabled?: boolean;
  submitted?: boolean;
}

export function FileUpload({
  onFileSelect,
  className,
  disabled = false,
  submitted = false,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (onFileSelect) onFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      if (onFileSelect) onFileSelect(selectedFile);
    }
  };

  return (
    <div 
      className={cn(
        "border-2 border-dashed rounded-lg p-6 transition-all",
        isDragging ? "border-purple bg-purple-light/20" : "border-border",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        submitted ? "border-green-500 bg-green-50" : "",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        {submitted ? (
          <>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-500">
              ✓
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-green-600">Submitted!</p>
              <p className="text-sm text-muted-foreground">Your file has been submitted successfully.</p>
            </div>
          </>
        ) : file ? (
          <>
            <div className="w-12 h-12 rounded-full bg-purple-light/50 flex items-center justify-center text-purple">
              <File size={24} />
            </div>
            <div className="text-center">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <input
              type="file"
              id="fileUpload"
              className="hidden"
              onChange={handleFileChange}
              disabled={disabled}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null);
                if (onFileSelect) onFileSelect(null as any);
              }}
              disabled={disabled}
            >
              Choose Another File
            </Button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
              <Upload size={24} />
            </div>
            <div className="text-center">
              <p className="font-medium">
                Drop your file here, or{" "}
                <label className="text-purple cursor-pointer hover:text-purple-dark">
                  browse
                  <input
                    type="file"
                    id="fileUpload"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={disabled}
                  />
                </label>
              </p>
              <p className="text-sm text-muted-foreground">
                Support documents, PDFs, and images up to 10MB
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
