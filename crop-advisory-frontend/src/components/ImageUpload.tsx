"use client"
import React, { useState, useRef, useCallback } from "react"
import { ImagePlus, X, Camera, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import { fileToBase64, validateImage, compressImage } from "@/lib/imageUtils"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onImageSelect: (base64: string, file: File) => void
  onImageClear: () => void
  label?: string
  required?: boolean
  error?: string
}

export function ImageUpload({ onImageSelect, onImageClear, label = "CROP IMAGE ANALYSIS", required = false, error }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toastError, toastSuccess } = useToast()

  const handleFile = async (file: File) => {
    const { valid, error: validationError } = validateImage(file)
    if (!valid) {
      toastError(validationError || "Invalid image")
      return
    }

    try {
      const compressedFile = await compressImage(file)
      const base64 = await fileToBase64(compressedFile)
      
      const objectUrl = URL.createObjectURL(compressedFile)
      setPreviewUrl(objectUrl)
      
      const sizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2)
      setFileDetails({ name: compressedFile.name, size: `${sizeMB} MB` })
      
      onImageSelect(base64, compressedFile)
      toastSuccess("Image ready for analysis")
    } catch (e) {
      toastError("Failed to process image")
      console.error(e)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const onButtonClick = () => {
    inputRef.current?.click()
  }

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreviewUrl(null)
    setFileDetails(null)
    if (inputRef.current) inputRef.current.value = ""
    onImageClear()
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-baseline">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] font-mono flex items-center gap-2">
          {label} {required && <span className="text-red-500">*</span>}
          {!required && <span className="text-muted-foreground opacity-50">(OPTIONAL)</span>}
        </label>
      </div>
      
      <p className="text-xs text-muted-foreground mt-[-8px]">
        Upload a photo of the affected crop for visual diagnosis assistance
      </p>

      <div 
        className={cn(
          "relative w-full rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer flex items-center justify-center min-h-[260px] ring-1 ring-emerald-500/10",
          !previewUrl && "border-2 border-dashed bg-emerald-950/20 backdrop-blur-md",
          !previewUrl && !dragActive && "border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/5",
          !previewUrl && dragActive && "border-emerald-500 bg-emerald-500/10 scale-[1.01]",
          previewUrl && "border border-emerald-500/20"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={previewUrl ? undefined : onButtonClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg, image/png, image/webp"
          capture="environment"
          onChange={handleChange}
          className="hidden"
        />

        {!previewUrl ? (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 pointer-events-none">
            <div className={cn("p-4 rounded-full bg-secondary transition-transform duration-300", dragActive && "scale-110 -translate-y-2 bg-primary/20")}>
              <ImagePlus className={cn("w-10 h-10", dragActive ? "text-primary" : "text-primary/70")} />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase tracking-widest text-primary hidden md:block">
                {dragActive ? "DROP IMAGE HERE" : "UPLOAD CROP IMAGE"}
              </h3>
              <h3 className="text-lg font-black uppercase tracking-widest text-primary md:hidden">
                TAP TO CAPTURE OR UPLOAD
              </h3>
              <p className="text-xs font-medium text-muted-foreground hidden md:block">
                Drag & drop or click to browse
              </p>
            </div>
            
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
              JPG, PNG, WEBP — MAX 10MB
            </p>
          </div>
        ) : (
          <div className="relative w-full h-[280px] group">
            <img 
              src={previewUrl} 
              alt="Crop preview" 
              className="w-full h-full object-cover rounded-xl"
            />
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center rounded-xl">
              <button 
                onClick={clearImage}
                className="absolute top-4 right-4 p-2 bg-black/80 hover:bg-destructive rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div 
                onClick={onButtonClick}
                className="flex flex-col items-center gap-2 cursor-pointer p-4 rounded-full hover:bg-white/10 transition-colors"
              >
                <Camera className="w-8 h-8 text-white" />
                <span className="text-xs font-black uppercase tracking-widest text-white">CHANGE IMAGE</span>
              </div>
            </div>

            {/* Bottom Strip */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/80 backdrop-blur-md rounded-b-xl flex justify-between items-center">
              <div className="flex items-center gap-3 overflow-hidden">
                <p className="text-xs font-medium text-white truncate max-w-[200px]">
                  {fileDetails?.name}
                </p>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {fileDetails?.size}
                </span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            </div>
          </div>
        )}
      </div>

      {previewUrl && (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full animate-in fade-in slide-in-from-bottom-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">IMAGE READY FOR ANALYSIS</span>
        </div>
      )}

      {error && (
        <p className="text-xs font-bold text-destructive uppercase tracking-widest">{error}</p>
      )}
    </div>
  )
}
