import React, { useState, useRef } from "react";
import { Upload, File, X, Check } from "lucide-react";

interface FileUploadInterfaceProps {
  onFilesSelected?: (mainFile: File | null) => void;
  className?: string;
}

const FileUploadInterface: React.FC<FileUploadInterfaceProps> = ({
  onFilesSelected,
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const mainFileRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    setMainFile(file);
    // Simulate upload progress
    simulateUpload();
    // Notify parent component
    notifyParent(file);
  };

  const notifyParent = (main: File | null) => {
    if (onFilesSelected) {
      onFilesSelected(main);
    }
  };

  const simulateUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const removeFile = () => {
    setMainFile(null);
    setUploadProgress(0);
    notifyParent(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Main File Upload */}
      <div>
        <h3 className="text-white font-medium mb-4">Digital Product File</h3>
        <input
          ref={mainFileRef}
          type="file"
          accept=".pdf,.zip,.mp3,.mp4,.epub,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.svg,.mp3,.wav,.avi,.mov,.mkv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!mainFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => mainFileRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
              ${
                isDragging
                  ? "border-blue-400 bg-blue-400/10 scale-105"
                  : "border-slate-600 hover:border-slate-500 hover:bg-slate-700/30"
              }
            `}
          >
            <div className="flex flex-col items-center gap-4">
              <div
                className={`
                p-4 rounded-full transition-all duration-300
                ${isDragging ? "bg-blue-400/20 scale-110" : "bg-slate-700/50"}
              `}
              >
                <Upload
                  className={`w-8 h-8 ${
                    isDragging ? "text-blue-400" : "text-slate-400"
                  }`}
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-1">
                  Drop your digital product here
                </h3>
                <p className="text-slate-400 text-sm">or click to browse</p>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Supports: PDF, ZIP, MP3, MP4, EPUB, Images, Documents (Max
                100MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-slate-600 rounded-xl p-4 bg-slate-700/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <File className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    {mainFile.name}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {formatFileSize(mainFile.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="p-1 hover:bg-slate-600 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {Math.round(uploadProgress)}% uploaded
              </span>
              {uploadProgress === 100 && (
                <div className="flex items-center gap-1 text-green-400">
                  <Check className="w-3 h-3" />
                  <span>Complete</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadInterface;
