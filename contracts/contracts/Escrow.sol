// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Escrow {
    enum RequestStatus {
        Pending,
        Completed,
        Refunded
    }

    struct RetrievalRequest {
        string cid;
        address payable client;
        address payable provider;
        uint256 amount;
        uint256 timeoutAt;
        bytes32 receiptHash;
        RequestStatus status;
    }

    uint256 public nextRequestId;
    mapping(uint256 => RetrievalRequest) public requests;

    event RetrievalRequested(
        uint256 indexed requestId,
        string cid,
        address indexed client,
        address indexed provider,
        uint256 amount,
        uint256 timeoutAt
    );
    event PaymentReleased(uint256 indexed requestId, address indexed provider, uint256 amount, bytes32 receiptHash);
    event Refunded(uint256 indexed requestId, address indexed client, uint256 amount);

    function createRequest(
        string calldata cid,
        address payable provider,
        uint256 timeoutAt
    ) external payable returns (uint256 requestId) {
        require(bytes(cid).length > 0, "CID required");
        require(provider != address(0), "Provider required");
        require(msg.value > 0, "FIL required");
        require(timeoutAt > block.timestamp, "Timeout must be future");

        requestId = nextRequestId++;
        requests[requestId] = RetrievalRequest({
            cid: cid,
            client: payable(msg.sender),
            provider: provider,
            amount: msg.value,
            timeoutAt: timeoutAt,
            receiptHash: bytes32(0),
            status: RequestStatus.Pending
        });

        emit RetrievalRequested(requestId, cid, msg.sender, provider, msg.value, timeoutAt);
    }

    function confirmReceipt(uint256 requestId, bytes32 receiptHash) external {
        RetrievalRequest storage request = requests[requestId];
        require(request.client == msg.sender, "Only client confirms");
        require(request.status == RequestStatus.Pending, "Request not pending");
        require(block.timestamp <= request.timeoutAt, "Request timed out");
        require(receiptHash != bytes32(0), "Receipt required");

        request.status = RequestStatus.Completed;
        request.receiptHash = receiptHash;

        uint256 amount = request.amount;
        request.amount = 0;
        request.provider.transfer(amount);

        emit PaymentReleased(requestId, request.provider, amount, receiptHash);
    }

    function refundOnTimeout(uint256 requestId) external {
        RetrievalRequest storage request = requests[requestId];
        require(request.client == msg.sender, "Only client refunds");
        require(request.status == RequestStatus.Pending, "Request not pending");
        require(block.timestamp > request.timeoutAt, "Request not timed out");

        request.status = RequestStatus.Refunded;

        uint256 amount = request.amount;
        request.amount = 0;
        request.client.transfer(amount);

        emit Refunded(requestId, request.client, amount);
    }
}
