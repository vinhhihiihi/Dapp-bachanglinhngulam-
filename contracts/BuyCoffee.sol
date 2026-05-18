// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BuyMeACoffee {
    event NewMemo(
        address indexed from,
        address indexed to,
        uint256 timestamp,
        string name,
        string message
    );

    struct Memo {
        address from;
        address to;
        uint256 timestamp;
        string name;
        string message;
    }

    Memo[] public memos;

    address payable public owner;

    constructor() {
        owner = payable(msg.sender);
    }

    // Người ủng hộ gửi tiền và để lại lời nhắn
    function buyCoffee(address payable _to, string memory _name, string memory _message) public payable {
        require(msg.value > 0, "So tien donate phai lon hon 0!");
        require(_to != address(0), "Dia chi nhan khong hop le!");

        memos.push(Memo(
            msg.sender,
            _to,
            block.timestamp,
            _name,
            _message
        ));
        emit NewMemo(msg.sender, _to, block.timestamp, _name, _message);
    }

    // Rút toàn bộ tiền trong contract về ví owner
    function withdrawTips() public {
        require(msg.sender == owner, "Chi chu du an moi co quyen rut tien!");
        
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Rut tien that bai!");
    }

    // Lấy danh sách các lời nhắn để hiển thị lên Web
    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }
}