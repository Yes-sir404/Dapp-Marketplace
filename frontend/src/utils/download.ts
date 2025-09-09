import { ipfsUriToHttp } from "../services/pinata";

export const downloadFile = async (uri: string, fileName: string) => {
  try {
    console.log("🔄 Starting download process...");
    console.log("📁 URI:", uri);
    console.log("📄 File name:", fileName);

    // Convert IPFS URI to HTTP gateway URL
    const httpUrl = ipfsUriToHttp(uri);
    if (!httpUrl) {
      throw new Error("Invalid URI format - cannot convert to HTTP URL");
    }

    console.log("🌐 HTTP URL:", httpUrl);

    // Fetch the file
    const response = await fetch(httpUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch file: ${response.status} ${response.statusText}`
      );
    }

    console.log("✅ File fetched successfully");

    // Get the file as blob
    const blob = await response.blob();
    console.log("📦 Blob size:", blob.size, "bytes");

    if (blob.size === 0) {
      throw new Error("Downloaded file is empty");
    }

    // Create download link
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    link.style.display = "none";

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    window.URL.revokeObjectURL(downloadUrl);

    console.log("✅ Download completed successfully");
    return true;
  } catch (error) {
    console.error("❌ Download failed:", error);
    throw error;
  }
};

export const getFileNameFromUri = (
  uri: string,
  fallbackName: string = "download"
): string => {
  if (uri.startsWith("ipfs://")) {
    // For IPFS, we can't get the original filename, so use fallback
    return fallbackName;
  }

  // Try to extract filename from URL
  try {
    const url = new URL(uri);
    const pathname = url.pathname;
    const fileName = pathname.split("/").pop();
    return fileName || fallbackName;
  } catch {
    return fallbackName;
  }
};
