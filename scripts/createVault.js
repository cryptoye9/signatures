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

    const assetType = 0
    const tokenId = 0
    const assetAddress = ethers.constants.AddressZero
    const unlockTime = 1671019228

    await vault.connect(deployer).createVault(
        assetType, 
        assetAddress, 
        tokenId, 
        0, 
        unlockTime,
        {  value: '1000000' }
    )
}

// This pattern is recommended to be able to use async/await everywhere and properly handle errors
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});