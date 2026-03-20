// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BuyCoffee {
    address payable owner;

    struct Memo {
        address sender;
        string name;
        string message;
        uint256 timestamp;
    }

    Memo[] memos;

    constructor() {
        owner = payable(msg.sender);
    }

    function buyCoffee(string memory name, string memory message) public payable {
        require(msg.value > 0, "Send ETH > 0");

        memos.push(Memo(msg.sender, name, message, block.timestamp));
    }

    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }

    function withdraw() public {
        require(msg.sender == owner, "Not owner");
        owner.transfer(address(this).balance);
    }
}