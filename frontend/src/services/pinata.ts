import axios from "axios";

export interface PinataUploadResult {
  cid: string;
  uri: string; // ipfs://CID
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
  return { cid, uri: `ipfs://${cid}` };
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
