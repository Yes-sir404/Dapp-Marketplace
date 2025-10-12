import axios from "axios";

export interface PinataUploadResult {
  cid: string;
  uri: string; // ipfs://CID
  originalName: string; // Original filename
}

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT as string | undefined;
const PINATA_BASE_URL = "https://api.pinata.cloud/pinning";

const ensureAuth = () => {
  if (!PINATA_JWT) {
    throw new Error("Missing VITE_PINATA_JWT in environment");
  }
};

export const uploadFileToPinata = async (
  file: File | Blob,
  fileName?: string
): Promise<PinataUploadResult> => {
  ensureAuth();
  const formData = new FormData();
  const name = fileName || (file instanceof File ? file.name : "upload.bin");
  formData.append("file", file, name);

  // Optional: metadata and options
  const metadata = JSON.stringify({ name });
  formData.append("pinataMetadata", metadata);
  const options = JSON.stringify({ cidVersion: 1 });
  formData.append("pinataOptions", options);

  const res = await axios.post(`${PINATA_BASE_URL}/pinFileToIPFS`, formData, {
    maxBodyLength: Infinity,
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
  });

  const cid = res.data?.IpfsHash || res.data?.cid || res.data?.hash;
  if (!cid) throw new Error("Pinata did not return a CID");
  return { cid, uri: `ipfs://${cid}`, originalName: name };
};

export const ipfsUriToHttp = (
  uri?: string,
  gateway?: string
): string | null => {
  if (!uri) return null;
  if (!uri.startsWith("ipfs://")) return uri;
  const cidAndPath = uri.replace("ipfs://", "");
  const gw = gateway || "https://gateway.pinata.cloud/ipfs";
  return `${gw}/${cidAndPath}`;
};

// Multiple IPFS gateways for fallback
// Reordered to prioritize non-Pinata gateways to avoid rate limiting
export const IPFS_GATEWAYS = [
  "https://ipfs.io/ipfs",
  "https://cloudflare-ipfs.com/ipfs",
  "https://dweb.link/ipfs",
  "https://gateway.ipfs.io/ipfs",
  "https://ipfs.fleek.co/ipfs",
  "https://nftstorage.link/ipfs",
  "https://w3s.link/ipfs",
  "https://gateway.pinata.cloud/ipfs", // Pinata last to avoid rate limits
];

export const getIpfsUrl = (uri: string): string | null => {
  if (!uri) return null;
  if (!uri.startsWith("ipfs://")) return uri;

  const cidAndPath = uri.replace("ipfs://", "");
  return `${IPFS_GATEWAYS[0]}/${cidAndPath}`;
};

export const tryMultipleGateways = async (uri: string): Promise<Response> => {
  if (!uri.startsWith("ipfs://")) {
    return fetch(uri);
  }

  const cidAndPath = uri.replace("ipfs://", "");

  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = `${gateway}/${cidAndPath}`;
      console.log(`🔄 Trying gateway: ${gateway}`);
      const response = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (response.ok) {
        console.log(`✅ Gateway working: ${gateway}`);
        return fetch(url);
      }
    } catch (error) {
      console.warn(`❌ Gateway failed: ${gateway}`, error);
      continue;
    }
  }

  throw new Error("All IPFS gateways failed");
};

// Test function to verify IPFS URI conversion
export const testIpfsConversion = (uri: string) => {
  console.log("🧪 Testing IPFS conversion:");
  console.log("Original URI:", uri);
  const converted = ipfsUriToHttp(uri);
  console.log("Converted URL:", converted);
  return converted;
};

// Check if an error is a rate limit error
export const isRateLimitError = (error: any): boolean => {
  if (error?.status === 429) return true;
  if (error?.message?.includes("429")) return true;
  if (error?.message?.includes("Too Many Requests")) return true;
  return false;
};

// Get a random non-Pinata gateway to avoid rate limits
export const getRandomNonPinataGateway = (): string => {
  const nonPinataGateways = IPFS_GATEWAYS.filter(
    (gw) => !gw.includes("pinata")
  );
  return nonPinataGateways[
    Math.floor(Math.random() * nonPinataGateways.length)
  ];
};

export const getOriginalFilenameFromPinata = async (
  cid: string
): Promise<string | null> => {
  try {
    ensureAuth();
    const response = await axios.get(
      `${PINATA_BASE_URL}/data/pinList?hashContains=${cid}`,
      {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      }
    );

    const pins = response.data?.rows || [];
    if (pins.length > 0) {
      const pin = pins[0];
      const metadata = pin.pinataMetadata;
      return metadata?.name || null;
    }
    return null;
  } catch (error) {
    console.warn("Failed to get original filename from Pinata:", error);
    return null;
  }
};
