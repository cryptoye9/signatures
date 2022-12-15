// This is a script for deployment and automatically verification of all the contracts (`contracts/`)

const hre = require("hardhat");
const { ethers } = hre;
const path = require("path");
const deploymentAddresses = require("./deployment/deploymentAddresses.json")
const vaultABI = require("../abi/contracts/Vault.sol/Vault.json")
const erc1155ABI = require("../abi/contracts/erc1155.sol/erc1155_Token.json")

async function main() {
    const [deployer] = await ethers.getSigners();

    // Deployed contract address saving functionality
    // Path for saving of addresses of deployed contracts
    // The function to save an address of a deployed contract to the specified file and to output to console

    const vaultAddress = deploymentAddresses.BSCSCAN_TESTNET.new.Vault;

    const vault = new ethers.Contract(vaultAddress, vaultABI, deployer)
    const assetName = process.env.ASSET_ERC1155
    const assetType = process.env.ASSET_TYPE
    const tokenId = process.env.TOKEN_ID
    const unlockTime = process.env.UNLOCK_TIME
    const amount = ethers.utils.parseUnits(process.env.ASSET_AMOUNT)

    const assetAddress = deploymentAddresses.BSCSCAN_TESTNET.new[assetName];
    const erc1155 = new ethers.Contract(assetAddress, erc1155ABI, deployer)

    await erc1155.connect(deployer).mint(deployer.address, tokenId, 1, "0x"); 
    await erc1155.connect(deployer).setApprovalForAll(vaultAddress, true)


    await vault.connect(deployer).createVault(
        assetType, 
        assetAddress,
        tokenId, 
        amount,
        unlockTime    
    )
}

// This pattern is recommended to be able to use async/await everywhere and properly handle errors
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});