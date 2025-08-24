const fs = require("fs");
const path = require("path");

async function updateContractConfig() {
  try {
    // Path to compiled contract
    const contractPath = path.join(
      __dirname,
      "../artifacts/contracts/Marketplace.sol/Marketplace.json"
    );

    // Path to your config file
    const configPath = path.join(
      __dirname,
      "../frontend/src/contracts/contractConfig.ts"
    );

    // Check if compiled contract exists
    if (!fs.existsSync(contractPath)) {
      console.log(
        '❌ Contract not compiled yet. Run "npx hardhat compile" first'
      );
      return;
    }

    // Read the compiled contract
    const contractJSON = JSON.parse(fs.readFileSync(contractPath, "utf8"));
    const newABI = contractJSON.abi;

    // Read your current config
    let configContent = fs.readFileSync(configPath, "utf8");

    // Replace the ABI
    const abiString = JSON.stringify(newABI, null, 2);
    const abiPattern = /export const MARKETPLACE_ABI = \[[\s\S]*?\];/;
    const newABIExport = `export const MARKETPLACE_ABI = ${abiString};`;

    configContent = configContent.replace(abiPattern, newABIExport);

    // Write back to file
    fs.writeFileSync(configPath, configContent);

    console.log("✅ Contract config updated successfully");
    console.log("📄 Remember to update CONTRACT_ADDRESS if you redeployed");
  } catch (error) {
    console.error("❌ Error updating contract config:", error);
  }
}

updateContractConfig()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
