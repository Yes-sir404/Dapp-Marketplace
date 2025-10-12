import { IPFS_GATEWAYS } from "../services/pinata";

export const testIpfsUrl = async (
  ipfsUri: string
): Promise<{
  success: boolean;
  workingGateway?: string;
  failedGateways: string[];
  error?: string;
}> => {
  if (!ipfsUri.startsWith("ipfs://")) {
    return {
      success: false,
      failedGateways: [],
      error: "Not an IPFS URI",
    };
  }

  const cidAndPath = ipfsUri.replace("ipfs://", "");
  const failedGateways: string[] = [];
  let workingGateway: string | undefined;

  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = `${gateway}/${cidAndPath}`;
      console.log(`🔄 Testing gateway: ${gateway}`);

      const response = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (response.ok) {
        console.log(`✅ Gateway working: ${gateway}`);
        workingGateway = gateway;
        break;
      } else {
        console.warn(
          `❌ Gateway failed with status: ${response.status} - ${gateway}`
        );
        failedGateways.push(gateway);
      }
    } catch (error) {
      console.warn(`❌ Gateway failed with error: ${error} - ${gateway}`);
      failedGateways.push(gateway);
    }
  }

  return {
    success: !!workingGateway,
    workingGateway,
    failedGateways,
    error: workingGateway ? undefined : "All gateways failed",
  };
};

// Test the specific failing URL
export const testFailingUrl = async () => {
  const failingUrl =
    "ipfs://bafkreigzpwhxwpjjbr3kgw4jw37o44nackk5j32ukb3d732xpshf5qw5sa";
  console.log("🧪 Testing failing IPFS URL:", failingUrl);

  const result = await testIpfsUrl(failingUrl);
  console.log("📊 Test result:", result);

  return result;
};

// Test multiple failing URLs
export const testMultipleUrls = async () => {
  const urls = [
    "ipfs://bafkreigzpwhxwpjjbr3kgw4jw37o44nackk5j32ukb3d732xpshf5qw5sa",
    "ipfs://bafkreiaml5wddagqby6eiapuufosrfkzbun6zp2ihmqoi6hpjc7qht45iy",
    "ipfs://bafkreigrcuju3imebxqvalvv6oflkkjxs75ab22ltltawkrxtodsjibopq",
  ];

  console.log("🧪 Testing multiple failing IPFS URLs...");

  const results = await Promise.allSettled(urls.map((url) => testIpfsUrl(url)));

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      console.log(`✅ URL ${index + 1}:`, result.value);
    } else {
      console.error(`❌ URL ${index + 1} failed:`, result.reason);
    }
  });

  return results;
};
