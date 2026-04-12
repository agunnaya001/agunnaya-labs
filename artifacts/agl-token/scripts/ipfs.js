const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs";

if (!PINATA_JWT) {
  console.error("[ERROR] PINATA_JWT env var not set. Get yours from https://app.pinata.cloud/keys");
  process.exit(1);
}

const METADATA = {
  name: "Agunnaya Labs",
  symbol: "AGL",
  description: "AI-powered smart contract security research token on Base. Agunnaya Labs builds transparent, audit-friendly Web3 security tooling.",
  external_url: "https://x.com/agunnaya001",
  github: "https://github.com/agunnaya001",
  decimals: 18,
  chainId: 8453,
  chain: "Base",
  tags: ["AI", "security", "DeFi", "Base", "research"],
};

async function uploadFileToPinata(filePath, pinataName) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("pinataMetadata", JSON.stringify({ name: pinataName }));
  form.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

  const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", form, {
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      ...form.getHeaders(),
    },
    maxBodyLength: Infinity,
  });

  return res.data.IpfsHash;
}

async function uploadJsonToPinata(jsonData, pinataName) {
  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    {
      pinataMetadata: { name: pinataName },
      pinataOptions: { cidVersion: 1 },
      pinataContent: jsonData,
    },
    {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.IpfsHash;
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║         AGUNNAYA LABS — IPFS UPLOAD              ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  const logoPath = path.join(__dirname, "..", "src", "logo.png");
  let logoHash = null;

  if (fs.existsSync(logoPath)) {
    console.log("[1/3] Uploading token logo to IPFS via Pinata...");
    logoHash = await uploadFileToPinata(logoPath, "AGL-Token-Logo");
    console.log(`      Logo IPFS Hash : ipfs://${logoHash}`);
    console.log(`      Gateway URL    : ${PINATA_GATEWAY}/${logoHash}`);
  } else {
    console.log("[1/3] No logo.png found in src/. Skipping logo upload.");
    console.log("      Place a 512x512 PNG at src/logo.png and re-run to upload.");
    console.log("      Design prompt: Futuristic AI blockchain logo, neon blue/green palette,");
    console.log('      "AGL" monogram, cyber lab theme, circuit board elements, dark background.');
    logoHash = "PLACEHOLDER_UPLOAD_logo_to_ipfs";
  }

  let contractAddress = "PLACEHOLDER_CONTRACT_ADDRESS";
  const deployPath = path.join(__dirname, "..", "deployment.json");
  if (fs.existsSync(deployPath)) {
    const deploy = JSON.parse(fs.readFileSync(deployPath, "utf8"));
    contractAddress = deploy.contractAddress;
  }

  console.log("\n[2/3] Building token metadata JSON...");
  const metadata = {
    ...METADATA,
    image: `ipfs://${logoHash}`,
    address: contractAddress,
  };

  console.log("\n[3/3] Uploading metadata JSON to IPFS...");
  const metadataHash = await uploadJsonToPinata(metadata, "AGL-Token-Metadata");
  console.log(`      Metadata IPFS Hash : ipfs://${metadataHash}`);
  console.log(`      Gateway URL        : ${PINATA_GATEWAY}/${metadataHash}`);

  const ipfsInfo = {
    logoHash,
    logoUrl: `ipfs://${logoHash}`,
    logoGateway: `${PINATA_GATEWAY}/${logoHash}`,
    metadataHash,
    metadataUrl: `ipfs://${metadataHash}`,
    metadataGateway: `${PINATA_GATEWAY}/${metadataHash}`,
    uploadedAt: new Date().toISOString(),
  };

  const ipfsPath = path.join(__dirname, "..", "ipfs.json");
  fs.writeFileSync(ipfsPath, JSON.stringify(ipfsInfo, null, 2));
  console.log("\nIPFS info saved to: ipfs.json");

  if (fs.existsSync(deployPath)) {
    const deploy = JSON.parse(fs.readFileSync(deployPath, "utf8"));
    deploy.ipfs = ipfsInfo;
    fs.writeFileSync(deployPath, JSON.stringify(deploy, null, 2));
  }

  return ipfsInfo;
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n[ERROR] IPFS upload failed:", err.message);
    process.exit(1);
  });
