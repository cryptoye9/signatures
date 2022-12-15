// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";


contract Vault is ERC721Holder, ERC1155Holder {    
    using ECDSA for bytes32;
    using SafeERC20 for IERC20;

    uint256 private signatureCount;

    enum AssetType { Ether, ERC20, ERC721, ERC1155 }
    struct Asset {
        address depositor;
        AssetType assetType;
        address assetAddress;
        uint256 tokenId;   
        uint256 amount;
        uint256 unlockTime;
        bool withdrawn;
    }

    mapping(uint256 => Asset) public assets;

    error InvalidSignatureOrAlreadyWithdrawn();
    error SignatureOverdue();
    error AssetLocked();
    error UnsupportedAsset();
    error ZeroAmount();

    function createVault(
        AssetType asset, 
        address assetAddress, 
        uint256 tokenId, 
        uint256 amount, 
        uint256 unlockTime
    ) external payable {
        if (asset == AssetType.ERC20) IERC20(assetAddress).safeTransferFrom(msg.sender, address(this), amount);
        else if (asset == AssetType.ERC721) IERC721(assetAddress).safeTransferFrom(msg.sender, address(this), tokenId);
        else if (asset == AssetType.ERC1155) IERC1155(assetAddress).safeTransferFrom(msg.sender, address(this), tokenId, 1, "");
        if (asset == AssetType.Ether && msg.value == 0 || amount == 0) revert ZeroAmount();
        if (asset == AssetType.Ether) {
            assets[signatureCount].amount = msg.value;
        } else assets[signatureCount].amount = amount;

        assets[signatureCount].depositor = msg.sender;
        assets[signatureCount].assetType = asset;
        assets[signatureCount].assetAddress = assetAddress;
        assets[signatureCount].tokenId = tokenId;
        assets[signatureCount].unlockTime = unlockTime;
        signatureCount++;
    }

    function withdrawAsset(uint256 _assetId, address _to, uint256 _deadline, bytes memory signature) external {
        if (verify(assets[_assetId].depositor, _assetId, msg.sender, _deadline, signature) && !assets[_assetId].withdrawn) {
            if (block.timestamp > _deadline) revert SignatureOverdue();
            else if (block.timestamp < assets[_assetId].unlockTime) revert AssetLocked();
            assets[_assetId].withdrawn = true;
            AssetType asset = assets[_assetId].assetType;
            address assetAddress = assets[_assetId].assetAddress;
            if (asset == AssetType.ERC20) {
                IERC20(assetAddress).safeTransfer(_to, assets[_assetId].amount);
            } else if (asset == AssetType.ERC721) {
                IERC721(assetAddress).safeTransferFrom(address(this), _to, assets[_assetId].tokenId);
            } else if (asset == AssetType.ERC1155) {
                IERC1155(assetAddress).safeTransferFrom(address(this), _to, assets[_assetId].tokenId, 1, "");
            } else if (asset == AssetType.Ether) {
                Address.sendValue(payable(_to), assets[_assetId].amount);
            }
        } else revert InvalidSignatureOrAlreadyWithdrawn();
    }

    function verify(
        address _signer,
        uint256 _assetId,
        address _to,
        uint256 _deadline,
        bytes memory signature
    ) public pure returns (bool) {
        bytes32 messageHash = getMessageHash(_assetId, _to, _deadline);
        bytes32 ethSignedMessageHash = ECDSA.toEthSignedMessageHash(messageHash);

        return ECDSA.recover(ethSignedMessageHash, signature) == _signer;
    }

    function getMessageHash(
        uint256 _assetId,
        address _to,
        uint256 _deadline
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_assetId, _to, _deadline));
    }
}
