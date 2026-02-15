/**
 * Image utilities for GreenMason
 * Converts any image format (HEIC, WEBP, PNG, etc.) to compressed JPEG
 * Works on all devices including iPhone
 */

/**
 * Convert any image file to a compressed JPEG Blob.
 * Uses Canvas API — works in all browsers, handles HEIC on iOS Safari.
 * @param file - Original image file from camera or file picker
 * @param maxDimension - Max width or height (default 1024px — good for AI classification)
 * @param quality - JPEG quality 0-1 (default 0.85)
 * @returns Object with JPEG blob and base64 data URL
 */
export async function compressImage(
  file: File,
  maxDimension: number = 1024,
  quality: number = 0.85
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    // Timeout after 10 seconds
    const timeout = setTimeout(() => reject(new Error("Image processing timed out")), 10000);

    const img = document.createElement("img");
    img.crossOrigin = "anonymous";

    img.onload = () => {
      clearTimeout(timeout);
      try {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Could not convert image"));
              return;
            }
            const dataUrl = canvas.toDataURL("image/jpeg", quality);
            resolve({ blob, dataUrl });
          },
          "image/jpeg",
          quality
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("Could not load image"));
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("Could not read file"));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Convert a Blob to a File object with a proper name
 */
export function blobToFile(blob: Blob, filename: string = "photo.jpg"): File {
  return new File([blob], filename, { type: "image/jpeg" });
}
