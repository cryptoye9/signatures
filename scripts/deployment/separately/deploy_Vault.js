// This is a script for deployment and automatically verification of all the contracts (`contracts/`)
const hre = require("hardhat");
const { ethers } = hre;
const { verify, getAddressSaver } = require("../utilities/helpers");
const path = require("path");
const deploymentAddresses = require("../deploymentAddresses.json")

const ver = async function verifyContracts(address, arguments) {
  await hre
      .run('verify:verify', {
          address: address,
          constructorArguments: arguments,
      }).catch((err) => console.log(err))
}

async function main() {
    const ETHER_INVESTMENT = ethers.utils.parseUnits('0.0001');

    const [deployer] = await ethers.getSigners();

    // Deployed contract address saving functionality
    const network = 'BSCSCAN_TESTNET'; // Getting of the current network
    // Path for saving of addresses of deployed contracts
    const addressesPath = path.join(__dirname, "../deploymentAddresses.json");
    // The function to save an address of a deployed contract to the specified file and to output to console
    const saveAddress = getAddressSaver(addressesPath, network, true);


    const Vault = (await ethers.getContractFactory("Vault")).connect(deployer);
    const vault = await Vault.deploy();
    await vault.deployed();
    saveAddress("Vault", vault.address);

    // Verification of the deployed contract
    await ver(vault.address, []); 

    console.log("Deployment is completed.");
}

// This pattern is recommended to be able to use async/await everywhere and properly handle errors
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
