const { run } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const deployPath = path.join(__dirname, "..", "deployment.json");

  if (!fs.existsSync(deployPath)) {
    throw new Error("deployment.json not found. Run deploy first: npm run deploy");
  }

  const deploy = JSON.parse(fs.readFileSync(deployPath, "utf8"));
  const { contractAddress, deployer } = deploy;

  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║         AGUNNAYA LABS — CONTRACT VERIFY          ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  console.log(`Contract : ${contractAddress}`);
  console.log(`Owner    : ${deployer}`);
  console.log("\n[1/2] Submitting source code to BaseScan...");

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [deployer],
      contract: "contracts/AGLToken.sol:AGLToken",
    });
    console.log("[2/2] Contract verified successfully on BaseScan!");
    console.log(`\nView on BaseScan: https://basescan.org/address/${contractAddress}#code`);

    deploy.verified = true;
    deploy.verifiedAt = new Date().toISOString();
    fs.writeFileSync(deployPath, JSON.stringify(deploy, null, 2));
  } catch (err) {
    if (err.message.includes("Already Verified")) {
      console.log("[2/2] Contract is already verified on BaseScan.");
      deploy.verified = true;
      fs.writeFileSync(deployPath, JSON.stringify(deploy, null, 2));
    } else {
      throw err;
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n[ERROR] Verification failed:", err.message);
    process.exit(1);
  });
