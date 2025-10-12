import React, { useState, useEffect } from "react";
import { IPFS_GATEWAYS } from "../services/pinata";

interface IpfsImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackComponent?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

const IpfsImage: React.FC<IpfsImageProps> = ({
  src,
  alt,
  className = "",
  fallbackComponent,
  onLoad,
  onError,
}) => {
  const [currentGatewayIndex, setCurrentGatewayIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setHasError(true);
      setIsLoading(false);
      setCurrentSrc(null);
      return;
    }

    // Reset state when src changes
    setCurrentGatewayIndex(0);
    setHasError(false);
    setIsLoading(true);

    // If it's not an IPFS URI, use it directly
    if (!src.startsWith("ipfs://")) {
      setCurrentSrc(src);
      return;
    }

    // Try the first gateway
    tryNextGateway();
  }, [src]);

  const tryNextGateway = () => {
    if (!src.startsWith("ipfs://")) {
      setCurrentSrc(src);
      return;
    }

    const cidAndPath = src.replace("ipfs://", "");
    const gateway = IPFS_GATEWAYS[currentGatewayIndex];

    if (!gateway) {
      // All gateways failed
      setHasError(true);
      setIsLoading(false);
      onError?.();
      return;
    }

    const url = `${gateway}/${cidAndPath}`;
    setCurrentSrc(url);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleImageError = () => {
    const currentGateway = IPFS_GATEWAYS[currentGatewayIndex];
    console.warn(`❌ Gateway failed: ${currentGateway}`);

    // Try next gateway
    const nextIndex = currentGatewayIndex + 1;
    if (nextIndex < IPFS_GATEWAYS.length) {
      setCurrentGatewayIndex(nextIndex);
      // Longer delay for rate-limited gateways
      const delay = currentGateway?.includes("pinata") ? 2000 : 500;
      setTimeout(() => tryNextGateway(), delay);
    } else {
      // All gateways failed
      setHasError(true);
      setIsLoading(false);
      setCurrentSrc(null);
      onError?.();
    }
  };

  // Show loading state while trying gateways
  if (isLoading && !currentSrc) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-slate-700 ${className}`}
      >
        <div className="text-slate-400 text-center">
          <div className="text-2xl mb-2 animate-pulse">⏳</div>
          <div className="text-sm">Loading image...</div>
        </div>
      </div>
    );
  }

  // Don't render img if no src or if we're in error state
  if (!currentSrc || hasError) {
    return (
      <>
        {fallbackComponent || (
          <div
            className={`w-full h-full flex items-center justify-center bg-slate-700 ${className}`}
          >
            <div className="text-slate-400 text-center">
              <div className="text-2xl mb-2">🖼️</div>
              <div className="text-sm">Image unavailable</div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onLoad={handleImageLoad}
      onError={handleImageError}
      loading="lazy"
    />
  );
};

export default IpfsImage;
