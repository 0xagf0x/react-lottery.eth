// TO RUN THIS FILE - node deploy.js
require('dotenv').config({ path: '.env'}); // specify the path to the .env file if deploy.js and .env are not in the same directory.

const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require("web3");
const { interface, bytecode } = require('./compile');

const providerAccount = new HDWalletProvider(
    // include your Metamask nuemonic code + link to the network you want to deploy to 
    // My metamask account
    process.env.MNEMONIC, 'https://rinkeby.infura.io/v3/' + process.env.API_KEY
);

const web3 = new Web3(providerAccount);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log('attemping to deploy from account: ', accounts[0])

    // need to provide ABI
    const result = await new web3.eth.Contract(JSON.parse(interface)) // interface is the ABI 
    .deploy({ 
        data: bytecode
    })
    .send ({
        from: accounts[0],
        gas: '1000000'
    })

    // console.log(result)
    // console.log('-----------------------------------------------------------')
    console.log('Contract deployed to', result.options.address);
    console.log(interface);
};
deploy();