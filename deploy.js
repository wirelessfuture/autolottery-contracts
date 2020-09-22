const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

// Import our compiled contract
const compile =  require('./compile');
const abi = JSON.stringify(compile['AutoLottery.sol']['AutoLottery']['abi'], null, 2);
const bytecode = '0x' + compile['AutoLottery.sol']['AutoLottery']['evm']['bytecode']['object'];

// Import seed phrase from environment variable
require('dotenv').config();
const seedPhrase = process.env.SEED_PHRASE;
const infuraAPIUrl = process.env.INFURA_API_URL;

// Set provider
const provider = new HDWalletProvider(
    seedPhrase,
    infuraAPIUrl
);

// Create new web3 object
const web3 = new Web3(provider);

// deploy function
async function deploy() {
    // Get the list of accounts
    const accounts = await web3.eth.getAccounts();

    // Print the account at 0
    console.log('Attempting to deploy from ', accounts[0]);

    // Build and deploy the contract
    const result = await new web3.eth.Contract(JSON.parse(abi)).deploy({ data: bytecode }).send({ from: accounts[0] });
    
    // Log the results
    console.log('Contract successfully deployed to ', result.options.address);
    console.log(abi);
    return
};

deploy();
