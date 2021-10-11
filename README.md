# DCRYPTO MULTI BEP20 TOKEN SENDER

This project is the website to send multiple BEP20 tokens to users wallets using MetaMask browser extension.

### To compile Multisender smart contract

`$ npm install -g truffle` if you didn't install `truffle` on your PC.

`$ cd smart-contract`

`$ truffle compile`


### To deploy Multisender contract to blockchain network

`$ truffle migrate --network testnet --reset` or `$ truffle migrate --network bsc --reset`


### To start website on localhost

`$ npm install -g yarn` if you didn't install `yarn` on your PC.

`$ yarn install`

`$ yarn start`


### To build website

`$ yarn build`


### Configure .env file

*`.env` file should be created with the following data*

`REACT_APP_MULTISENDER_ADDRESS=0x076FFxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

`REACT_APP_NETWORK_URL=https://testnet.bscscan.com or https://bscscan.com`

