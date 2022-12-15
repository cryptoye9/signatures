const hre = require("hardhat");
const { ethers } = hre;
const { verify, getAddressSaver } = require("../utilities/helpers");
const path = require("path");

async function main() {
    const [deployer] = await ethers.getSigners();

    // Deployed contract address saving functionality
    const network = 'BSCSCAN_TESTNET'; // Getting of the current network
    // Path for saving of addresses of deployed contracts
    const addressesPath = path.join(__dirname, "../deploymentAddresses.json");
    // The function to save an address of a deployed contract to the specified file and to output to console
    const saveAddress = getAddressSaver(addressesPath, network, true);

    const ERC20 = (await ethers.getContractFactory("ERC20_Token")).connect(deployer);
    const erc20 = await ERC20.deploy("ERC20", "E20");
    await erc20.deployed();

    const ERC721 = (await ethers.getContractFactory("ERC721_Token")).connect(deployer);
    const erc721 = await ERC721.deploy();
    await erc721.deployed();
    
    const ERC1155 = (await ethers.getContractFactory("ERC1155_Token")).connect(deployer);
    const erc1155 = await ERC1155.deploy();
    await erc1155.deployed();    

    // Saving of an address of the deployed contract to the file
    saveAddress("ERC20_Token", erc20.address);
    saveAddress("ERC721_Token", erc721.address);
    saveAddress("ERC1155_Token", erc1155.address);

    // Verification of the deployed contract
    await verify(erc20.address, ["ERC20", "E20"]); 
    await verify(erc721.address, []); 
    await verify(erc1155.address, []);

    console.log("Deployment is completed.");
}

// This pattern is recommended to be able to use async/await everywhere and properly handle errors
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});