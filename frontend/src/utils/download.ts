import { ipfsUriToHttp } from "../services/pinata";

export const downloadFile = async (uri: string, fileName: string) => {
  try {
    // Convert IPFS URI to HTTP gateway URL
    const httpUrl = ipfsUriToHttp(uri);
    if (!httpUrl) {
      throw new Error("Invalid URI format");
    }

    // Fetch the file
    const response = await fetch(httpUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    // Get the file as blob
    const blob = await response.blob();

    // Create download link
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    window.URL.revokeObjectURL(downloadUrl);

    return true;
  } catch (error) {
    console.error("Download failed:", error);
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
