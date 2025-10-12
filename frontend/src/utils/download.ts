import {
  ipfsUriToHttp,
  tryMultipleGateways,
  getOriginalFilenameFromPinata,
} from "../services/pinata";

export const downloadFile = async (uri: string, fileName: string) => {
  try {
    console.log("🔄 Starting download process...");
    console.log("📁 URI:", uri);
    console.log("📄 File name:", fileName);

    // Validate URI
    if (!uri || uri.trim() === "") {
      throw new Error("No URI provided for download");
    }

    let response: Response;

    // Handle different URI types
    if (uri.startsWith("ipfs://")) {
      console.log("🌐 IPFS URI detected, trying multiple gateways...");
      response = await tryMultipleGateways(uri);
    } else if (uri.startsWith("http://") || uri.startsWith("https://")) {
      console.log("🌐 HTTP URI detected");
      response = await fetch(uri);
    } else {
      // Try to convert to HTTP URL
      const httpUrl = ipfsUriToHttp(uri);
      if (!httpUrl) {
        throw new Error("Invalid URI format - cannot convert to HTTP URL");
      }
      console.log("🌐 Converted to HTTP URL:", httpUrl);
      response = await fetch(httpUrl);
    }

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

export const extractOriginalFilename = (description: string): string | null => {
  console.log("🔍 Extracting filename from description:", description);

  // Try new format first: [FILENAME:filename.ext]
  let match = description.match(/\[FILENAME:([^\]]+)\]/);
  if (match) {
    console.log("✅ Found filename in new format:", match[1]);
    return match[1];
  }

  // Try old format: Original filename: filename.ext
  match = description.match(/Original filename: (.+)/);
  if (match) {
    console.log("✅ Found filename in old format:", match[1]);
    return match[1];
  }

  console.log("❌ No filename found in description");
  return null;
};

export const getFileNameFromUri = async (
  uri: string,
  fallbackName: string = "download",
  originalFileName?: string
): Promise<string> => {
  // If we have the original filename, use it
  if (originalFileName) {
    console.log("✅ Using provided original filename:", originalFileName);
    return originalFileName;
  }

  if (uri.startsWith("ipfs://")) {
    // Try to get original filename from Pinata metadata as fallback
    const cid = uri.replace("ipfs://", "");
    const pinataFilename = await getOriginalFilenameFromPinata(cid);
    if (pinataFilename) {
      console.log("✅ Found original filename from Pinata:", pinataFilename);
      return pinataFilename;
    }

    // Fallback: try to extract filename from the fallback name
    // If fallback has extension, use it; otherwise add a generic extension
    if (fallbackName.includes(".")) {
      console.log("✅ Using fallback name with extension:", fallbackName);
      return fallbackName;
    }
    // If no extension, try to detect from URI or use generic
    console.log(
      "⚠️ No extension found, using .bin fallback:",
      `${fallbackName}.bin`
    );
    return `${fallbackName}.bin`;
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
