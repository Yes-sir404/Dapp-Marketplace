// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Digital Marketplace...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Check account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Get the contract factory
  const Marketplace = await ethers.getContractFactory("Marketplace");

  console.log("⏳ Deploying contract...");

  // Deploy the contract
  const marketplace = await Marketplace.deploy();

  // Wait for deployment to complete
  await marketplace.waitForDeployment();

  const contractAddress = await marketplace.getAddress();

  console.log("\n✅ Marketplace deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🌐 Network:", (await ethers.provider.getNetwork()).name);
  console.log("⛽ Deployer:", deployer.address);

  console.log("\n🔧 Next Steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Update frontend/src/contracts/contractConfig.ts");
  console.log("3. Replace CONTRACT_ADDRESS with the address above");
  console.log("\n📋 Update this line in contractConfig.ts:");
  console.log(`export const CONTRACT_ADDRESS = "${contractAddress}";`);

  console.log("\n🎯 COPY THIS ADDRESS:");
  console.log("==================================================");
  console.log(contractAddress);
  console.log("==================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
