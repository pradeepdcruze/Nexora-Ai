export interface AvatarUploadResult {
  success: boolean;
  avatarUrl?: string;
  error?: string;
}

export const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB limit
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export function validateAvatarFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No image file selected." };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
    return { valid: false, error: "Unsupported image format. Please upload a JPG, PNG, or WebP image." };
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 5MB limit (uploaded: ${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
    };
  }

  return { valid: true };
}

// Convert image File to a compressed base64 data URL for local storage / bucket fallback
export async function processAvatarImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Square crop geometry (take minimum dimension)
        const size = Math.min(img.width, img.height);
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;

        // Target avatar resolution: 256x256
        const TARGET_SIZE = 256;
        canvas.width = TARGET_SIZE;
        canvas.height = TARGET_SIZE;

        if (ctx) {
          ctx.drawImage(img, startX, startY, size, size, 0, 0, TARGET_SIZE, TARGET_SIZE);
        }

        // Compress to webp format at 85% quality
        const dataUrl = canvas.toDataURL("image/webp", 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Corrupted or invalid image file."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}
