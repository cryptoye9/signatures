// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";


contract Vault is Ownable, ERC721Holder, ERC1155Holder {    
    using ECDSA for bytes32;
    using SafeERC20 for IERC20;

    uint256 private signatureCount;

    enum AssetType { Ether, ERC20, ERC721, ERC1155 }
    struct Asset {
        bytes32 signature;
        AssetType assetType;
        address assetAddress;
        uint256 tokenId;
        uint256 amount;
        uint256 deadline;
        bool withdrawn;
    }

    mapping(uint256 => Asset) assets;

    error InvalidSignatureOrAlreadyWithdrawn();
    error SignatureOverdue();

    function createVault(
        AssetType asset, 
        address assetAddress, 
        uint256 tokenId, 
        uint256 amount, 
        uint256 deadline,
        bytes32 signature
    ) external payable {
        if (asset == AssetType.ERC20) IERC20(assetAddress).safeTransferFrom(msg.sender, address(this), amount);
        else if (asset == AssetType.ERC721) IERC721(assetAddress).safeTransferFrom(msg.sender, address(this), tokenId);
        else if (asset == AssetType.ERC1155) IERC1155(assetAddress).safeTransferFrom(msg.sender, address(this), tokenId, 1, "");
        assets[signatureCount].signature = signature;
        assets[signatureCount].assetType = asset;
        assets[signatureCount].assetAddress = assetAddress;
        assets[signatureCount].tokenId = tokenId;
        assets[signatureCount].amount = amount;
        assets[signatureCount].deadline = deadline;
    }

    function withdrawAsset(uint256 sigId) external {
        if (isSignatureValid(sigId, msg.sender, assets[sigId].deadline) && !assets[signatureCount].withdrawn) {
            AssetType asset = assets[signatureCount].assetType;
            address assetAddress = assets[signatureCount].assetAddress;
            if (asset == AssetType.ERC20) IERC20(assetAddress).safeTransfer(msg.sender, assets[signatureCount].amount);
            else if (asset == AssetType.ERC721) {
                IERC721(assetAddress).safeTransferFrom(address(this), msg.sender, assets[signatureCount].tokenId);
            } else if (asset == AssetType.ERC1155) {
                IERC1155(assetAddress).safeTransferFrom(address(this), msg.sender, assets[signatureCount].tokenId, 1, "");
            }
            assets[signatureCount].withdrawn = true;
        } else revert InvalidSignatureOrAlreadyWithdrawn();
    }

    function isSignatureValid(uint256 sigId, address authority, uint256 deadline) private view returns (bool)
    {
        bytes32 messagehash = keccak256(
            abi.encodePacked(sigId, authority, deadline)
        );

        if (block.timestamp > deadline) revert SignatureOverdue();

        if (messagehash == assets[signatureCount].signature) return true;
        else return false;
    }
}
