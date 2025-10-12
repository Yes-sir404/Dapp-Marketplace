import React, { useState, useRef } from "react";
import { Image, X, Check } from "lucide-react";

interface ThumbnailUploadProps {
  onFileSelected?: (file: File | null) => void;
  className?: string;
  currentThumbnail?: string;
}

const ThumbnailUpload: React.FC<ThumbnailUploadProps> = ({
  onFileSelected,
  className = "",
  currentThumbnail,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

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
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      handleFile(imageFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    // Simulate upload progress
    simulateUpload();
    // Notify parent component
    notifyParent(file);
  };

  const notifyParent = (file: File | null) => {
    if (onFileSelected) {
      onFileSelected(file);
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
    setSelectedFile(null);
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
      <h4 className="text-white font-medium mb-3">Thumbnail Image</h4>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300
            ${
              isDragging
                ? "border-blue-400 bg-blue-400/10 scale-105"
                : "border-slate-600 hover:border-slate-500 hover:bg-slate-700/30"
            }
          `}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className={`
                p-3 rounded-full transition-all duration-300
                ${isDragging ? "bg-blue-400/20 scale-110" : "bg-slate-700/50"}
              `}
            >
              <Image
                className={`w-6 h-6 ${
                  isDragging ? "text-blue-400" : "text-slate-400"
                }`}
              />
            </div>
            <div>
              <h5 className="text-sm font-medium text-white mb-1">
                Drop thumbnail image here
              </h5>
              <p className="text-slate-400 text-xs">or click to browse</p>
            </div>
            <p className="text-xs text-slate-500">
              Supports: JPG, PNG, GIF, WebP (Max 10MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-slate-600 rounded-lg p-4 bg-slate-700/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Image className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  {selectedFile.name}
                </p>
                <p className="text-slate-400 text-xs">
                  {formatFileSize(selectedFile.size)}
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
              {Math.round(uploadProgress)}% ready
            </span>
            {uploadProgress === 100 && (
              <div className="flex items-center gap-1 text-green-400">
                <Check className="w-3 h-3" />
                <span>Ready</span>
              </div>
            )}
          </div>
        </div>
      )}

      {currentThumbnail && !selectedFile && (
        <div className="mt-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-sm mb-2">Current thumbnail:</p>
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 text-sm">
              {currentThumbnail.split("/").pop()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThumbnailUpload;
