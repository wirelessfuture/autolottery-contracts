const path = require('path');
const fs = require('fs');
const solc = require('solc');

const contractsPath = './contracts';
const contractName = 'AutoLottery.sol';
const contractPath = path.resolve(contractsPath, contractName);
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        'AutoLottery.sol' : {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

module.exports = output.contracts;