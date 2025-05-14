"use client"

import type React from "react"

import { useState } from "react"
import { X, Upload } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }

    try {
      setIsUploading(true)

      // In a real app, you would upload to a storage service
      // For this example, we'll create a data URL
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    onChange("")
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {value ? (
        <div className="relative w-full h-64 mb-4">
          <Image src={value || "/placeholder.svg"} alt="Event image" fill className="object-cover rounded-md" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label htmlFor="image-upload" className="w-full cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 rounded-md p-12 w-full flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-4">Click to upload an event image</p>
            <Button type="button" variant="secondary" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
          </div>
          <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      )}
    </div>
  )
}
