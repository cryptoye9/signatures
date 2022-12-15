// This is a script for deployment and automatically verification of all the contracts (`contracts/`)

const hre = require("hardhat");
const { ethers } = hre;
const path = require("path");
const deploymentAddresses = require("./deployment/deploymentAddresses.json")
const vaultABI = require("../abi/contracts/Vault.sol/Vault.json")

async function main() {
    const ETHER_INVESTMENT = ethers.utils.parseUnits('0.0001');

    const [deployer] = await ethers.getSigners();


    // Deployed contract address saving functionality
    // Path for saving of addresses of deployed contracts
    // The function to save an address of a deployed contract to the specified file and to output to console

    const Vault_addr = deploymentAddresses.BSCSCAN_TESTNET.new.Vault;

    const vault = new ethers.Contract(Vault_addr, vaultABI, deployer)
   // console.log(await vault.assets(0))

    const to = deployer.address
    const assetId = process.env.ASSET_ID
    const deadline = process.env.SIGNATURE_DEADLINE // 22 July 2023

    const hash = await vault.getMessageHash(assetId, to, deadline)  
    const signature = await deployer.signMessage(ethers.utils.arrayify(hash))

    await vault.connect(deployer).withdrawAsset(assetId, to, deadline, signature)
}

// This pattern is recommended to be able to use async/await everywhere and properly handle errors
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});