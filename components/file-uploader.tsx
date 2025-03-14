"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { X, Upload, Image as ImageIcon, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploaderProps {
  value: File[]
  onChange: (files: File[]) => void
  maxFiles?: number
  maxSize?: number
  accept?: Record<string, string[]>
  previews?: string[]
  setPreviews?: (previews: string[]) => void
  className?: string
}

export function FileUploader({
  value,
  onChange,
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = {
    'image/jpeg': [],
    'image/png': [],
    'image/webp': [],
    'image/gif': []
  },
  previews = [],
  setPreviews,
  className,
}: FileUploaderProps) {
  const [errors, setErrors] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle accepted files
    if (acceptedFiles?.length) {
      const newFiles = [...value, ...acceptedFiles].slice(0, maxFiles)
      onChange(newFiles)
      
      // Generate previews for new files
      if (setPreviews) {
        const newPreviews = [...previews]
        acceptedFiles.forEach(file => {
          const reader = new FileReader()
          reader.onload = (e) => {
            if (e.target?.result) {
              newPreviews.push(e.target.result as string)
              setPreviews([...newPreviews])
            }
          }
          reader.readAsDataURL(file)
        })
      }
    }
    
    // Handle rejected files
    if (rejectedFiles?.length) {
      const newErrors = rejectedFiles.map(file => {
        const error = file.errors[0]
        if (error.code === 'file-too-large') {
          return `"${file.file.name}" is too large. Max size is ${Math.round(maxSize / 1024 / 1024)}MB.`
        }
        if (error.code === 'file-invalid-type') {
          return `"${file.file.name}" has an invalid file type.`
        }
        return `"${file.file.name}" - ${error.message}`
      })
      setErrors(newErrors)
    }
  }, [value, onChange, maxFiles, maxSize, previews, setPreviews])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept,
  })

  const removeFile = (index: number) => {
    const newFiles = [...value]
    newFiles.splice(index, 1)
    onChange(newFiles)
    
    if (setPreviews) {
      const newPreviews = [...previews]
      newPreviews.splice(index, 1)
      setPreviews(newPreviews)
    }
  }

  const clearErrors = () => {
    setErrors([])
  }

  useEffect(() => {
    // Clear errors after 5 seconds
    if (errors.length > 0) {
      const timer = setTimeout(() => {
        setErrors([])
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [errors])

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2",
          isDragActive && !isDragReject && "border-primary/50 bg-primary/5",
          isDragReject && "border-destructive/50 bg-destructive/5",
          !isDragActive && !isDragReject && "border-muted-foreground/20 hover:border-muted-foreground/30"
        )}
      >
        <input {...getInputProps()} />
        <Upload className={cn(
          "h-10 w-10 mb-2",
          isDragActive && !isDragReject && "text-primary",
          isDragReject && "text-destructive",
          !isDragActive && !isDragReject && "text-muted-foreground"
        )} />
        
        {isDragActive ? (
          isDragReject ? (
            <p className="text-center font-medium text-destructive">Some files are not allowed</p>
          ) : (
            <p className="text-center font-medium text-primary">Drop the files here</p>
          )
        ) : (
          <>
            <p className="text-center font-medium">Drag & drop files here, or click to select files</p>
            <p className="text-center text-sm text-muted-foreground">
              Upload up to {maxFiles} images (max {Math.round(maxSize / 1024 / 1024)}MB each)
            </p>
          </>
        )}
      </div>
      
      {/* Error messages */}
      {errors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 relative">
          <button 
            onClick={clearErrors}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-destructive">The following errors occurred:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Preview of uploaded files */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Uploaded Images ({value.length}/{maxFiles})</h4>
            <button
              type="button"
              onClick={() => {
                onChange([])
                if (setPreviews) setPreviews([])
              }}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Remove All
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {value.map((file, index) => (
              <div key={index} className="group relative aspect-square rounded-md overflow-hidden border bg-muted">
                {previews[index] ? (
                  <img
                    src={previews[index]}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-background/80 hover:bg-destructive hover:text-white rounded-full p-1 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                {index === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-primary-foreground text-xs py-1 text-center">
                    Main Image
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}