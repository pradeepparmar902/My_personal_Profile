import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Utility to convert Google Drive sharing links into direct image rendering URLs.
 * Works for formats like:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 */
export function cleanGoogleDriveUrl(url: string | undefined | null): string {
  if (!url) return "";
  
  const cleanUrl = url.trim();

  // Match /file/d/FILE_ID
  const fileDMatch = cleanUrl.match(/(?:drive|docs)\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
  }

  // Match ?id=FILE_ID or &id=FILE_ID
  const idMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if ((cleanUrl.includes("drive.google.com") || cleanUrl.includes("docs.google.com")) && idMatch && idMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  }

  return cleanUrl;
}

/**
 * Compresses an image file using browser Canvas and returns a compressed JPEG Base64 Data URL.
 */
export function compressImage(
  file: File,
  maxWidth: number = 600,
  maxHeight: number = 600,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string); // Fallback to uncompressed
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Converts a data URL to a Blob.
 */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return await res.blob();
}

/**
 * Compresses and uploads an image file to Firebase Storage.
 * If Firebase Storage upload fails (due to missing bucket, configuration, or rules),
 * it seamlessly falls back to saving the compressed Base64 Data URL directly.
 */
export async function uploadImageToFirebase(
  file: File,
  pathPrefix: string = "profile",
  maxWidth: number = 600,
  maxHeight: number = 600
): Promise<{ url: string; fallbackUsed: boolean; error?: string }> {
  try {
    // 1. Compress image to a highly efficient representation (usually 15-30KB)
    const compressedDataUrl = await compressImage(file, maxWidth, maxHeight, 0.8);

    // Enforce a strict timeout of 3.5 seconds for Firebase Storage upload attempt
    const uploadWithTimeout = (): Promise<string> => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Firebase Storage connection timed out. Falling back to secure Base64."));
        }, 3500);

        (async () => {
          try {
            const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
            const storageRef = ref(storage, `${pathPrefix}/${Date.now()}_${cleanFileName}`);
            const blob = await dataUrlToBlob(compressedDataUrl);

            await uploadBytes(storageRef, blob, {
              contentType: "image/jpeg",
            });

            const downloadUrl = await getDownloadURL(storageRef);
            clearTimeout(timeout);
            resolve(downloadUrl);
          } catch (err) {
            clearTimeout(timeout);
            reject(err);
          }
        })();
      });
    };

    try {
      // 2. Try uploading to Firebase Storage
      const downloadUrl = await uploadWithTimeout();
      return { url: downloadUrl, fallbackUsed: false };
    } catch (storageErr: any) {
      console.warn(
        "Firebase Storage upload failed or timed out. Falling back to direct Base64 Firestore storage.",
        storageErr
      );
      // 3. Fallback seamlessly to the compressed Base64 Data URL
      return { 
        url: compressedDataUrl, 
        fallbackUsed: true,
        error: storageErr?.message || String(storageErr)
      };
    }
  } catch (err: any) {
    console.error("Critical error in image upload process:", err);
    throw new Error(err?.message || "Failed to process image file.");
  }
}

