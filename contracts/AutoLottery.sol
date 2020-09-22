// SPDX-License-Identifier: UNLICENSED
//     _____          __         .____           __    __                       
//    /  _  \  __ ___/  |_  ____ |    |    _____/  |__/  |_  ___________ ___.__.
//   /  /_\  \|  |  \   __\/  _ \|    |   /  _ \   __\   __\/ __ \_  __ <   |  |
//  /    |    \  |  /|  | (  <_> )    |__(  <_> )  |  |  | \  ___/|  | \/\___  |
//  \____|__  /____/ |__|  \____/|_______ \____/|__|  |__|  \___  >__|   / ____|
//         \/                           \/                     \/       \/     
// Created by Jack Stryder fron Seyda Neen
// Automatically draws a winner once the payout threshold is met

pragma solidity ^0.7.0;

contract AutoLottery {
    address[] public players;
    uint256 public totalPayoutValue;
    uint256 public currentPrizePool;
    address public lastWinner;
    uint256 public lastPayout;
    address public owner;

    constructor() {
        totalPayoutValue = 0 ether;
        currentPrizePool = 0 ether;
        lastPayout = 0 ether;
        owner = msg.sender;
    }
    
    // Allow a player to enter, value entered must be 0.01 or greater
    function enter() public payable {
        require(msg.value >= 0.01 ether, "You must enter 0.01 or more Ether!");
        players.push(msg.sender);
        currentPrizePool += msg.value;
        if (address(this).balance >= 1.00 ether) {
            winner();
        }
    }

    // Choose a winner at random
    function winner() internal {
        require(address(this).balance >= 1.00 ether, "Not enough eth in prize pool!");

        uint index = random() % players.length;
        
        totalPayoutValue += address(this).balance;
        lastWinner = players[index];
        lastPayout = address(this).balance;
        
        payable(players[index]).transfer(address(this).balance);
        
        delete players;
    }

    // Creates a random number
    function random() private view returns (uint) {
        return uint(keccak256(abi.encode(block.difficulty, block.timestamp, players)));
    }

    // Returns a list of all currently entered players
    function getPlayers() public view returns (address[] memory) {
        return players;
    }
    
    // The owner of the contract can force a draw if its been too long since the last draw
    function emergencyDraw() public {
        require(msg.sender == owner, "Only the owner can call this method!");
        
        uint index = random() % players.length;
        
        totalPayoutValue += address(this).balance;
        lastWinner = players[index];
        lastPayout = address(this).balance;
        
        payable(players[index]).transfer(address(this).balance);
        
        delete players;
    }

}