import React, { useState, useRef, useCallback } from "react";
import { Upload, Loader2, Check, AlertCircle, X, Crop as CropIcon } from "lucide-react";
import { uploadImageToFirebase } from "../../lib/imageUtils";
import Cropper from "react-easy-crop";
import getCroppedImg, { PixelCrop } from "../../lib/cropImage";
import { motion, AnimatePresence } from "motion/react";

interface ImageUploaderProps {
  id?: string;
  onUploadComplete: (url: string) => void;
  currentUrl?: string;
  pathPrefix?: string;
  maxWidth?: number;
  maxHeight?: number;
  label?: string;
  aspectRatio?: number; // E.g., 21/9 or 1
}

export default function ImageUploader({
  id = "file-uploader",
  onUploadComplete,
  currentUrl = "",
  pathPrefix = "profile",
  maxWidth = 1200,
  maxHeight = 1200,
  label = "Upload Image",
  aspectRatio
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Crop states
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: PixelCrop) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setStatus({ type: "error", message: "Only image files are allowed." });
      return;
    }

    setStatus({ type: "idle", message: "" });
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageToCrop(reader.result?.toString() || null);
    });
    reader.readAsDataURL(file);
    // Reset file input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadCroppedImage = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    setIsUploading(true);
    setImageToCrop(null); // Close cropper modal

    try {
      const croppedFile = await getCroppedImg(imageToCrop, croppedAreaPixels);
      if (!croppedFile) throw new Error("Failed to crop image.");

      const result = await uploadImageToFirebase(croppedFile, pathPrefix, maxWidth, maxHeight);
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
            <p className="text-xs font-mono text-gray-400">Cropping and uploading image...</p>
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

      {/* Cropper Modal */}
      <AnimatePresence>
        {imageToCrop && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-4xl h-[80vh] bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-3">
                  <CropIcon className="w-5 h-5 text-[#d4af37]" />
                  <h3 className="text-sm font-semibold text-white font-serif uppercase tracking-widest">Adjust Image</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setImageToCrop(null)}
                  className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative flex-1 bg-black/60">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectRatio || undefined}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  classes={{
                    containerClassName: "absolute inset-0",
                    mediaClassName: "max-w-none"
                  }}
                  style={{
                    containerStyle: { background: 'transparent' },
                    cropAreaStyle: { border: '2px solid rgba(212, 175, 55, 0.8)', boxShadow: '0 0 0 9999em rgba(0, 0, 0, 0.7)' }
                  }}
                />
              </div>

              <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
                <div className="flex-1 max-w-xs space-y-1 hidden sm:block">
                  <label className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Zoom</label>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-[#d4af37]"
                  />
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setImageToCrop(null)}
                    className="px-4 py-2 text-xs text-gray-300 font-semibold rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={uploadCroppedImage}
                    className="px-6 py-2 text-xs text-black font-semibold rounded-lg bg-[#d4af37] hover:bg-[#ebd179] transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)]"
                  >
                    Confirm & Upload
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
