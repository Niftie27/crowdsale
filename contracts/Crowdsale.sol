// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Token.sol";

contract Crowdsale {
    address public owner;
    Token public token;
    uint256 public price;
    uint256 public maxTokens;
    uint256 public tokensSold;

    // ✅ Added: Time-based control
    uint256 public openingTime; // ✅
    uint256 public closingTime; // ✅

    // ✅ ← deployment time
    uint256 public deploymentTime;

    // ✅ Added: Min/Max contribution tracking
    uint256 public minContribution = 0.1 ether; // ✅
    uint256 public maxContribution = 5 ether;   // ✅
    mapping(address => uint256) public contributions; // ✅

    // ✅ Added: Whitelist
    mapping(address => bool) public whitelist; // ✅

    // ✅ New Event
    event Whitelisted(address indexed investor); // ✅

    event Buy(uint256 amount, address buyer);
    event Finalize(uint256 tokensSold, uint256 ethRaised);

    // ✅ Constructor now takes opening/closing time
    constructor(
        Token _token,
        uint256 _price,
        uint256 _maxTokens,
        uint256 _openingTime,
        uint256 _closingTime
    ) {
        require(_openingTime < _closingTime, "Invalid time range"); // ✅

        owner = msg.sender;
        token = _token;
        price = _price;
        maxTokens = _maxTokens;
        openingTime = _openingTime; // ✅
        closingTime = _closingTime; // ✅
        deploymentTime = block.timestamp; // ✅ Set deployment timestamp
    }

    modifier onlyOwner() {
        require(msg.sender == owner, 'caller must be owner');
        _;
    }

    // ✅ Modifier to enforce crowdsale timing
    modifier onlyWhileOpen() {
        require(block.timestamp >= openingTime && block.timestamp <= closingTime, "Crowdsale closed");
        _;
    }

    receive() external payable {
        uint256 amount = msg.value / price;
        buyTokens(amount * 1e18);
    }
    
    // ✅ New function: whitelist control
    function addToWhitelist(address _investor) external onlyOwner {
        whitelist[_investor] = true;
        emit Whitelisted(_investor);
    }

    function buyTokens(uint256 _amount) public payable {
        require(block.timestamp >= deploymentTime + 30 minutes, "Token sale not started yet");
        // variable pricing
        // timestamp required here !!!
        // require(block.timestamp + 30 minutes) **
        require(msg.value == (_amount /1e18) * price);
        require(token.balanceOf(address(this)) >= _amount);
        require(token.transfer(msg.sender, _amount));

        tokensSold += _amount;

        emit Buy(_amount, msg.sender);
    }

    function buyWhitelist(uint256 _amount) public payable {
        // variable pricing
        // make new buttons for this one on the frontend ..onClick, buyhandler
        require(whitelist[msg.sender] == true, "user not whitelisted");
        require(msg.value == (_amount /1e18) * price);
        require(token.balanceOf(address(this)) >= _amount);
        require(token.transfer(msg.sender, _amount));

        tokensSold += _amount;

        emit Buy(_amount, msg.sender);
    }

    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }

    function finalize() public onlyOwner {
        // Send remaining tokens to crowdsale creator
        require(token.transfer(owner, token.balanceOf(address(this))));
        // Send Ether to crowdsale creator
        uint256 value = address(this).balance;
        (bool sent, ) = owner.call{value: value }("");
        require(sent);

        emit Finalize(tokensSold, value);
    }
}