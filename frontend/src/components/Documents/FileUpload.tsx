/**
 * FileUpload component - Drag & drop file upload
 */

import React, { useEffect, useRef, useState } from "react";
import { Upload, File, X } from "lucide-react";
import { Button } from "../Common/Button";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  loading?: boolean;
  resetKey?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxFiles = 5,
  maxSize = 50,
  acceptedTypes = [".pdf", ".txt", ".docx", ".doc", ".md"],
  loading = false,
  resetKey = 0,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedFiles([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [resetKey]);

  const validateFiles = (files: FileList) => {
    const errors: string[] = [];

    if (selectedFiles.length + files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
    }

    Array.from(files).forEach((file) => {
      const fileSize = file.size / (1024 * 1024); // Convert to MB
      if (fileSize > maxSize) {
        errors.push(`${file.name} exceeds ${maxSize}MB limit`);
      }

      const hasValidType = acceptedTypes.some((type) =>
        file.name.toLowerCase().endsWith(type)
      );
      if (!hasValidType) {
        errors.push(
          `${file.name} has unsupported file type. Accepted: ${acceptedTypes.join(", ")}`
        );
      }
    });

    if (errors.length > 0) {
      setError(errors.join("; "));
      return false;
    }

    return true;
  };

  const handleFiles = (files: FileList) => {
    if (validateFiles(files)) {
      const newFiles = Array.from(files);
      const combined = [...selectedFiles, ...newFiles];
      setSelectedFiles(combined);
      onFilesSelected(combined);
      setError(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    onFilesSelected(updated);
  };

  return (
    <div className="w-full">
      {/* Upload zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative px-6 py-12 border-2 border-dashed rounded-lg transition-colors ${
          dragActive
            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10"
            : "border-neutral-300 dark:border-secondary-600 bg-neutral-50 dark:bg-secondary-800/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleChange}
          className="hidden"
          accept={acceptedTypes.join(",")}
          disabled={loading}
        />

        <div className="flex flex-col items-center justify-center">
          <Upload className="w-12 h-12 text-primary-500 mb-3" />
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-neutral-100 mb-1">
            Drop files here or click
          </h3>
          <p className="text-sm text-secondary-600 dark:text-neutral-400 mb-4">
            Supported formats: {acceptedTypes.join(", ")} (Max {maxSize}MB each)
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            Select Files
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-secondary-900 dark:text-neutral-100 mb-2">
            Selected files ({selectedFiles.length})
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-secondary-800 border border-neutral-200 dark:border-secondary-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <File
                    size={20}
                    className="text-primary-600 dark:text-primary-400"
                  />
                  <div>
                    <p className="text-sm font-medium text-secondary-900 dark:text-neutral-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-neutral-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(idx)}
                  className="text-secondary-500 dark:text-neutral-400 hover:text-secondary-700 dark:hover:text-neutral-200"
                  disabled={loading}
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
