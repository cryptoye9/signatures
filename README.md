# Repository setup

Prerequisites: [Node (v16 LTS)](https://nodejs.org/en/download/) plus [Git](https://git-scm.com/downloads)

🚨 If you are using a version < v16 you will need to remove `openssl-legacy-provider` from the `start` script in `package.json`

> clone/fork repo:

```bash/zsh
git clone https://github.com/yehorrudytsia9/signatures.git
```

> installation:

```bash/zsh
cd signatures
npm install
```

> сompilation:

```bash/zsh
npx hardhat compile
```

# Deployment and testing

## Hardhat chain

> deploy and run tests on `hardhat chain`:

```bash/zsh
npx hardhat test
```
tests can be found at `/test/`

## Testnet
commands for deployment and smart contract interaction can be found at `package.json`

### Deployment
> deploy test tokens (assets) to `Binance Smart Chain Testnet`:

```bash/zsh
npm run deploy:tokens
```

> deploy Vault contract to `Binance Smart Chain Testnet`:

```bash/zsh
npm run deploy:vault
```
scripts for smart contracts deployment can be found at `/scripts/deployment/separately`

deployed smart contracts addresses can be found at `/scripts/deployment/deploymentAddresses.json`


### Smart contract interaction
> environment variables should be set in `.env`.
> example of variables initialization for smart contract interactin cab be found in `example.env`.

Variables description:

First Header  | Second Header
------------- | -------------
`BSC_PRIVATE_KEY` |  BSC private key
`BSC_TESTNET_PRIVATE_KEY` |  BSC Testnet private key
`BSCSCANAPIKEY_API_KEY` | Bscscan API key
`BSC_MAINNET` |  BSC Mainnet URL
`BSC_TESTNET` |  BSC Testnet URL
`ASSET_ERC20` |  name of your ERC20 asset from `deploymentAddresses.json` (`string`)
`ASSET_ERC721` |  name of your ERC721 asset from `deploymentAddresses.json` (`string`)
`ASSET_ERC1155` |  name of your ERC1155 asset from `deploymentAddresses.json` (`string`)
`ASSET_TYPE` |  type of asset: `Ether` - 0, `ERC20` - 1, `ERC721` - 2, `ERC1155` - 3 (`uint`)
`ASSET_ID` |  Id of Asset in Vault (`uint`)
`TOKEN_ID` |  relevant if asset is `ERC721` or `ERC1155` (`uint`)
`SIGNATURE_DEADLINE` |  timestamp when signature overdue (`uint`)
`UNLOCK_TIME` |  timestamp when asset becomes available for withdrawing (`uint`)
`SIGNATURE` |  signed message with parameters by the vault creator (`string`)

> сreate vault with Ether:

```bash/zsh
npm run vault:ether
```

> сreate vault with ERC20 token:

```bash/zsh
npm run vault:erc20
```

> сreate vault with ERC721 token:

```bash/zsh
npm run vault:erc721
```
> сreate vault with ERC1155 token:

```bash/zsh
npm run vault:erc1155
```
> signing message (resulting signature will be shown as output):

```bash/zsh
npm run vault:sign
```
> copy the signature and put it to `.env` file to `SIGNATURE=`

> withdraw an asset by signature:

```bash/zsh
npm run vault:withdrawAsset
```
