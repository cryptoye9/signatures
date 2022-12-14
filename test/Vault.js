const { time, mine, mineUpTo } = require("@nomicfoundation/hardhat-network-helpers");
const { takeSnapshot } = require("@nomicfoundation/hardhat-network-helpers");

const { utils , BigNumber} = require("ethers");
const { keccak256, toUtf8Bytes } = utils;

const { expect } = require("chai");
const { ethers, upgrades, waffle, network } = require("hardhat");

let owner, user1, user2, user3, hacker

let users = []

describe("Signatures", (accounts) => {
  const DAY = 86400 // 1 day in seconds
  const DEPOSIT_AMOUNT = ethers.utils.parseUnits('1.0')
  let signature;

  beforeEach(async function () {
    [
      tokensDeployer,
      depositor, 
      user1, 
      hacker, 
      user3, 
      hacker1, 
      hacker2,
      hacker3,
      ...users
    ] = await ethers.getSigners();

    Vault = await ethers.getContractFactory("Vault")
    vault = await Vault.deploy();

    ERC20 = await ethers.getContractFactory("ERC20_Token")
    ERC721 = await ethers.getContractFactory("ERC721_Token")
    ERC1155 = await ethers.getContractFactory("ERC1155_Token")

    erc20 = await ERC20.deploy("20Name", "20Symb"); 
    erc721 = await ERC721.deploy(); 
   // erc1155 = await ERC1155.deploy(); 


    await erc20.connect(tokensDeployer).transfer(depositor.address, DEPOSIT_AMOUNT); 
    await erc721.connect(tokensDeployer).safeMint(depositor.address, 1); 
   // await erc1155.connect(tokensDeployer).mint(depositor.address, 0, 1, ""); 
  });

  describe("asset: ERC20", function () {
    describe("vault creating", function () {

      beforeEach(async function () {
        await erc20.connect(depositor).approve(vault.address, DEPOSIT_AMOUNT); 
       // await erc721.connect(depositor).setApprovalForAll(vault.address, true); 
       // await erc1155.connect(depositor).setApprovalForAll(vault.address, true); 
        snapshotA = await takeSnapshot();
        
      });

      afterEach(async () => await snapshotA.restore());

  
      it("# getMessageHash", async function () {  
        const to = user1.address
        const assetId = 0
        const deadline = 1690000000 // 22 July 2023
    
        await vault.getMessageHash(assetId, to, deadline)  
      });
  
      it("# signMessage", async function () {  
        const to = user1.address
        const assetId = 0
        const deadline = 1690000000 // 22 July 2023
  
        const hash = await vault.getMessageHash(assetId, to, deadline)  
        const sig = await depositor.signMessage(ethers.utils.arrayify(hash))
      });
  
      it("# createVault", async function () {  
        const to = erc20.address
        const tokenId = 0
        const assetAddress = erc20.address
        const unlockTime = (await time.latest()) + time.duration.hours(1);
        // 22 July 2023
  
        const balanceBeforeDeposit = await erc20.connect(depositor).balanceOf(depositor.address)
        await vault.connect(depositor).createVault(1, assetAddress, tokenId, DEPOSIT_AMOUNT, unlockTime)
        const balanceAfterDeposit = await erc20.connect(depositor).balanceOf(depositor.address)
  
        expect(balanceBeforeDeposit).to.equal(balanceAfterDeposit.add(DEPOSIT_AMOUNT))
      });
    })
      
    describe("withdrawal", function () {  
      beforeEach(async function () {
        await erc20.connect(depositor).approve(vault.address, DEPOSIT_AMOUNT); 
  
        const to = user1.address
        const assetId = 0
        const deadline = 1690000000 // 22 July 2023
        const tokenId = 0
        const assetAddress = erc20.address
        const unlockTime = (await time.latest()) + time.duration.hours(1);
  
        const hash = await vault.getMessageHash(assetId, to, deadline)  
        signature = await depositor.signMessage(ethers.utils.arrayify(hash))
  
        await vault.connect(depositor).createVault(1, assetAddress, tokenId, DEPOSIT_AMOUNT, unlockTime)
      });

      it("reverts when withdrawing before unlocking", async function () {  
        const to = user1.address
        const assetId = 0
        const deadline = 1690000000 // 22 July 2023

        const tx = vault.connect(user1).withdrawAsset(assetId, to, deadline, signature)
        await expect(tx).to.be.revertedWith("AssetLocked()");
      });
        
      it("# withdraw asset", async function () {  
        const to = user1.address
        const assetId = 0
        const deadline = 1690000000 // 22 July 2023
  
        await time.increase(time.duration.hours(2))
        const balanceBeforeDeposit = await erc20.connect(user1).balanceOf(user1.address)
        await vault.connect(user1).withdrawAsset(assetId, to, deadline, signature)
        const balanceAfterDeposit = await erc20.connect(user1).balanceOf(user1.address)

        expect(balanceBeforeDeposit).to.equal(balanceAfterDeposit.sub(DEPOSIT_AMOUNT))
      });
  
      it("reverts when hacker tries to withdraw", async function () {  
        const to = user1.address
        const assetId = 0
        const deadline = 1690000000 // 22 July 2023
        await time.increase(time.duration.hours(2))

        const tx = vault.connect(hacker).withdrawAsset(assetId, to, deadline, signature)
        await expect(tx).to.be.reverted;
      });
    })
  })


  describe("asset: ERC721", function () {
    describe("vault creating", function () {

      beforeEach(async function () {
       await erc721.connect(depositor).setApprovalForAll(vault.address, true); 
       // await erc1155.connect(depositor).setApprovalForAll(vault.address, true); 
        
      });
  
  
      it("# getMessageHash", async function () {  
        const to = user1.address
        const assetId = 1
        const deadline = 1690000000 // 22 July 2023

        await vault.getMessageHash(assetId, to, deadline)  
      });
  
      it("# signMessage", async function () {  
        const to = user1.address
        const assetId = 0
        const deadline = 1690000000 // 22 July 2023
  
        const hash = await vault.getMessageHash(assetId, to, deadline)  
        const sig = await depositor.signMessage(ethers.utils.arrayify(hash))
      });
  
      it("# createVault", async function () {  
        const tokenId = 1
        const assetAddress = erc721.address
        const unlockTime = (await time.latest()) + time.duration.hours(1);
        // 22 July 2023
  
        const balanceBeforeDeposit = await erc721.connect(depositor).balanceOf(depositor.address)
        await vault.connect(depositor).createVault(2, assetAddress, tokenId, DEPOSIT_AMOUNT, unlockTime)
        const balanceAfterDeposit = await erc721.connect(depositor).balanceOf(depositor.address)
  
        expect(balanceBeforeDeposit).to.equal(balanceAfterDeposit.add(1))
      });
    })
      
    describe("withdrawal", function () {  
      beforeEach(async function () {
        await erc721.connect(depositor).setApprovalForAll(vault.address, true); 
  
        const to = user1.address
        const assetId = 0
        const deadline = 1690000000 // 22 July 2023
        const tokenId = 1
        const assetAddress = erc721.address
        const unlockTime = (await time.latest()) + time.duration.hours(1);
  
        const hash = await vault.getMessageHash(assetId, to, deadline)  
        signature = await depositor.signMessage(ethers.utils.arrayify(hash))
  
        await vault.connect(depositor).createVault(2, assetAddress, tokenId, DEPOSIT_AMOUNT, unlockTime)
      });

      it("reverts when withdrawing before unlocking", async function () {  
        const to = user1.address
        const assetId = 0
        const deadline = 1690000000 // 22 July 2023

        const tx = vault.connect(user1).withdrawAsset(assetId, to, deadline, signature)
        await expect(tx).to.be.revertedWith("AssetLocked()");
      });
        
      it("# withdraw asset", async function () {  
        const to = user1.address
        const assetId = 0
        const deadline = 1690000000 // 22 July 2023
        await time.increase(time.duration.hours(2))

        const balanceBeforeDeposit = await erc721.connect(user1).balanceOf(to)
        await vault.connect(user1).withdrawAsset(assetId, to, deadline, signature)
        const balanceAfterDeposit = await erc721.connect(user1).balanceOf(to)
        expect(await erc721.ownerOf(1)).to.equal(to)

        expect(balanceBeforeDeposit).to.equal(balanceAfterDeposit.sub(1))
      });
  
      it("reverts when hacker tries to withdraw", async function () {  
        const to = user1.address
        const assetId = 0
        const deadline = 1690000000 // 22 July 2023
  
        const tx = vault.connect(hacker).withdrawAsset(assetId, to, deadline, signature)
        await expect(tx).to.be.reverted;
      });
  
    })
  })


});

