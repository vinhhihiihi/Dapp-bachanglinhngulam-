// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BuyMeACoffee {
    event NewMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string message
    );

    struct Memo {
        address from;      
        uint256 timestamp; 
        string name;        
        string message; 
    }

    Memo[] public memos;

    address payable public owner;

    constructor() {
        owner = payable(msg.sender);
    }

    //người ủng hộ gửi tiền và để lại lời nhắn
    function buyCoffee(string memory _name, string memory _message) public payable {
        require(msg.value > 0, "So tien donate phai lon hon 0!");
        memos.push(Memo(
            msg.sender,
            block.timestamp,
            _name,
            _message
        ));
        emit NewMemo(msg.sender, block.timestamp, _name, _message);
    }

    //rút toàn bộ tiền trong Contract về ví owner
    function withdrawTips() public {
        require(msg.sender == owner, "Chi chu du an moi co quyen rut tien!");
        
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Rut tien that bai!");
    }

    //lấy danh sách các lời nhắn để hiển thị lên Web
    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }
}