export interface ThumbnailOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1 for image/jpeg
  mimeType?: "image/jpeg" | "image/png";
}

const DEFAULTS: Required<ThumbnailOptions> = {
  maxWidth: 512,
  maxHeight: 512,
  quality: 0.85,
  mimeType: "image/jpeg",
};

export const generateThumbnail = async (
  file: File,
  opts?: ThumbnailOptions
): Promise<Blob> => {
  const options = {
    ...DEFAULTS,
    ...(opts || {}),
  } as Required<ThumbnailOptions>;

  // If not an image, return a simple placeholder thumbnail with canvas text
  if (!file.type.startsWith("image/")) {
    const blob = await drawPlaceholder(options, file.name);
    return blob;
  }

  const imageBitmap = await createImageBitmap(file);
  const { width, height } = fitWithin(
    imageBitmap.width,
    imageBitmap.height,
    options.maxWidth,
    options.maxHeight
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(imageBitmap, 0, 0, width, height);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      options.mimeType,
      options.quality
    );
  });
  return blob;
};

const fitWithin = (srcW: number, srcH: number, maxW: number, maxH: number) => {
  const ratio = Math.min(maxW / srcW, maxH / srcH, 1);
  return { width: Math.round(srcW * ratio), height: Math.round(srcH * ratio) };
};

const drawPlaceholder = async (
  options: Required<ThumbnailOptions>,
  name: string
): Promise<Blob> => {
  const width = options.maxWidth;
  const height = options.maxHeight;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, "#3b82f6");
  grad.addColorStop(1, "#a855f7");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // File initials
  ctx.fillStyle = "#ffffff";
  ctx.font = `${Math.floor(width * 0.18)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const base = name.split(".")[0] || "FILE";
  const text = base.length > 12 ? base.slice(0, 12) + "…" : base;
  ctx.fillText(text, width / 2, height / 2);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      options.mimeType,
      options.quality
    );
  });
  return blob;
};
