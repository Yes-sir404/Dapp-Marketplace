const fs = require("fs");
const path = require("path");

async function updateABI() {
  try {
    // Path to compiled contract
    const contractPath = path.join(
      __dirname,
      "../artifacts/contracts/Marketplace.sol/Marketplace.json"
    );

    // Path to ABI file
    const abiPath = path.join(__dirname, "../frontend/src/ABI.ts");

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

    // Create the new ABI content
    const abiContent = `export const MARKETPLACE_ABI_VAR = ${JSON.stringify(
      newABI,
      null,
      2
    )} as const;
`;

    // Write to ABI file
    fs.writeFileSync(abiPath, abiContent);

    console.log("✅ ABI.ts updated successfully");
    console.log("📄 ABI now matches the compiled contract");
  } catch (error) {
    console.error("❌ Error updating ABI:", error);
  }
}

updateABI()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
