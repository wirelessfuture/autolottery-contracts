const assert = require('assert');
const ganache = require('ganache-cli');
const { default: Web3 } = require('web3');
const TestWeb3 = require('web3');

// Create a new web3 instance and use ganache as the provider
const testProvider = ganache.provider();
const testWeb3 = new TestWeb3(testProvider);

// Import our compiled contract
const testCompile = require('../compile');
const testInterface = JSON.stringify(testCompile['AutoLottery.sol']['AutoLottery']['abi'], null, 2);
const testBytecode = '0x' + testCompile['AutoLottery.sol']['AutoLottery']['evm']['bytecode']['object'];

let testAccounts;
let lottery;

beforeEach(async () => {
    // Get the accounts from the ganache test instance
    testAccounts = await testWeb3.eth.getAccounts();

    // Use one of the accounts to deploy the contract
    lottery = await new testWeb3.eth.Contract(JSON.parse(testInterface))
        .deploy({ data: testBytecode })
        .send({ from: testAccounts[0], gas: '1000000' });

    lottery.setProvider(testProvider);
});

describe('AutoLottery', () => {
    // Check if the contract is deployed by asserting that the address is present
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });

    // Enter into lottery and assert that players address appears in players array
    it('allows a single account to enter', async () => {
        await lottery.methods.enter().send({
            from: testAccounts[0],
            value: testWeb3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: testAccounts[0]
        });

        assert.strictEqual(testAccounts[0], players[0]);
        assert.strictEqual(1, players.length);
    });

    // Multiple accounts are able to enter the lottery
    it('allows multiple accounts to enter', async () => {
        await lottery.methods.enter().send({
            from: testAccounts[0],
            value: testWeb3.utils.toWei('0.02', 'ether')
        });
        await lottery.methods.enter().send({
            from: testAccounts[1],
            value: testWeb3.utils.toWei('0.03', 'ether')
        });
        await lottery.methods.enter().send({
            from: testAccounts[2],
            value: testWeb3.utils.toWei('0.04', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: testAccounts[0]
        });

        assert.strictEqual(testAccounts[0], players[0]);
        assert.strictEqual(testAccounts[1], players[1]);
        assert.strictEqual(testAccounts[2], players[2]);
        assert.strictEqual(3, players.length);
    })

    // Requires that a minimum amount of ether is used to enter
    it('requires a minimum amount of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from: testAccounts[0],
                value: 200
            });
            assert(false)
        } catch (err) {
            assert(err)
        };
    });

    // Only the manager can call emergencyDraw()
    it('only the manager can call emergencyDraw()', async () => {
        try {
            await lottery.methods.emergencyDraw().send({
                from: testAccounts[1]
            });
            assert(false);
        } catch (err) {
            assert(err);
        };
    });

    // Check the winner receives the full prize
    it('the winner receives the full prize', async () => {
        await lottery.methods.enter().send({
            from: testAccounts[0],
            value: testWeb3.utils.toWei('0.5', 'ether'),
            gas: '1000000'
        });

        const initialBalance = await testWeb3.eth.getBalance(testAccounts[0]);
        await lottery.methods.emergencyDraw().send({
            from: testAccounts[0],
            gas: '1000000'
        });
        const finalBalance = await testWeb3.eth.getBalance(testAccounts[0]);
        const difference = finalBalance - initialBalance;

        assert(difference > testWeb3.utils.toWei('0.3', 'ether'));
    });

    // Check that the players array is reset at end
    it('the players array is reset after winner is chosen', async () => {
        await lottery.methods.enter().send({
            from: testAccounts[0],
            value: testWeb3.utils.toWei('0.01', 'ether')
        });

        await lottery.methods.emergencyDraw().send({
            from: testAccounts[0],
            gas: '1000000'
        });
        
        const players = await lottery.methods.getPlayers().call({
            from: testAccounts[0]
        });

        assert.strictEqual(0, players.length);
    });

    // Check that the balance of the contract is zero after winner
    it('contract balance is zero after winner chosen', async () => {
        await lottery.methods.enter().send({
            from: testAccounts[0],
            value: testWeb3.utils.toWei('0.10', 'ether')
        });

        await lottery.methods.emergencyDraw().send({
            from: testAccounts[0],
            gas: '3000000'
        });
        
        const finalBalance = await testWeb3.eth.getBalance(lottery.options.address);
        assert.strictEqual(finalBalance, '0');
    });
});