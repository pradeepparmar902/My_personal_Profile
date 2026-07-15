import React, { useState, useRef } from "react";
import { Upload, ImageIcon, Loader2, Check, AlertCircle } from "lucide-react";
import { uploadImageToFirebase } from "../../lib/imageUtils";

interface ImageUploaderProps {
  id?: string;
  onUploadComplete: (url: string) => void;
  currentUrl?: string;
  pathPrefix?: string;
  maxWidth?: number;
  maxHeight?: number;
  label?: string;
}

export default function ImageUploader({
  id = "file-uploader",
  onUploadComplete,
  currentUrl = "",
  pathPrefix = "profile",
  maxWidth = 600,
  maxHeight = 600,
  label = "Upload Image"
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setStatus({ type: "error", message: "Only image files are allowed." });
      return;
    }

    setIsUploading(true);
    setStatus({ type: "idle", message: "" });

    try {
      const result = await uploadImageToFirebase(file, pathPrefix, maxWidth, maxHeight);
      onUploadComplete(result.url);
      
      if (result.fallbackUsed) {
        setStatus({
          type: "success",
          message: "Saved to Firebase (auto-compressed as Base64)."
        });
      } else {
        setStatus({
          type: "success",
          message: "Uploaded successfully to Firebase Storage!"
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatus({
        type: "error",
        message: err?.message || "Failed to upload image."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all duration-300 ${
          isDragActive
            ? "border-[#d4af37] bg-[#d4af37]/10"
            : isUploading
            ? "border-amber-500/30 bg-neutral-900/50 cursor-not-allowed"
            : "border-white/10 hover:border-white/20 bg-neutral-950/40 hover:bg-neutral-950/80"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          id={id}
          className="hidden"
          accept="image/*"
          onChange={onFileChange}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center space-y-2 text-center">
            <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
            <p className="text-xs font-mono text-gray-400">Processing and uploading image...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-gray-400 border border-white/5">
              <Upload className="w-5 h-5 group-hover:text-white" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-white">
                {label}
              </p>
              <p className="text-[10px] text-gray-500 font-sans">
                Drag and drop or click to upload
              </p>
            </div>
          </div>
        )}
      </div>

      {status.type !== "idle" && (
        <div
          className={`flex items-start gap-2 p-2.5 rounded-lg border text-[11px] leading-relaxed transition-all duration-300 ${
            status.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {status.type === "success" ? (
            <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          )}
          <span className="font-mono">{status.message}</span>
        </div>
      )}
    </div>
  );
}
