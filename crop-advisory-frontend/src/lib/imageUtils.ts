export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      resolve(dataUrl)
    }
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}

export function validateImage(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Only JPG, PNG, and WEBP formats are allowed." }
  }

  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: "File exceeds 10MB limit." }
  }

  return { valid: true }
}

export function compressImage(file: File, maxSizeKB = 500): Promise<File> {
  return new Promise((resolve, reject) => {
    // If the file is already small enough, just return it
    if (file.size <= maxSizeKB * 1024) {
      return resolve(file)
    }

    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      
      let width = img.width
      let height = img.height

      // Basic linear scaling down loop
      const scaleDown = 0.8
      width *= scaleDown
      height *= scaleDown

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) return resolve(file)

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file)
          const newFile = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          })
          
          // Could recursively compress but we just do one pass to simplify.
          // In a real app we'd target the exact compression size.
          resolve(newFile)
        },
        "image/jpeg",
        0.85
      )
    }

    img.onerror = () => reject(new Error("Failed to load image for compression"))
    img.src = url
  })
}
