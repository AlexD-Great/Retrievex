// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Escrow {
    enum RequestStatus {
        Pending,
        ReceiptSubmitted,
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

    error EmptyCid();
    error InvalidProvider();
    error MissingPayment();
    error InvalidTimeout();
    error RequestNotPending();
    error EmptyReceiptHash();
    error OnlyAssignedProvider();
    error OnlyClient();
    error RequestTimedOut();
    error RequestNotTimedOut();
    error ReceiptNotSubmitted();
    error PaymentTransferFailed();

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
    event ReceiptSubmitted(uint256 indexed requestId, address indexed provider, bytes32 receiptHash);
    event PaymentReleased(
        uint256 indexed requestId,
        address indexed provider,
        uint256 amount,
        bytes32 receiptHash
    );
    event Refunded(uint256 indexed requestId, address indexed client, uint256 amount);

    function createRequest(
        string calldata cid,
        address payable provider,
        uint256 timeoutAt
    ) external payable returns (uint256 requestId) {
        if (bytes(cid).length == 0) revert EmptyCid();
        if (provider == address(0)) revert InvalidProvider();
        if (msg.value == 0) revert MissingPayment();
        if (timeoutAt <= block.timestamp) revert InvalidTimeout();

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

    function submitReceipt(uint256 requestId, bytes32 receiptHash) external {
        RetrievalRequest storage request = requests[requestId];
        if (request.provider != msg.sender) revert OnlyAssignedProvider();
        if (request.status != RequestStatus.Pending) revert RequestNotPending();
        if (block.timestamp > request.timeoutAt) revert RequestTimedOut();
        if (receiptHash == bytes32(0)) revert EmptyReceiptHash();

        request.status = RequestStatus.ReceiptSubmitted;
        request.receiptHash = receiptHash;

        emit ReceiptSubmitted(requestId, msg.sender, receiptHash);
    }

    function confirmReceipt(uint256 requestId) external {
        RetrievalRequest storage request = requests[requestId];
        if (request.client != msg.sender) revert OnlyClient();
        if (request.status != RequestStatus.ReceiptSubmitted) revert ReceiptNotSubmitted();
        if (request.receiptHash == bytes32(0)) revert EmptyReceiptHash();

        request.status = RequestStatus.Completed;

        uint256 amount = request.amount;
        request.amount = 0;

        (bool sent,) = request.provider.call{value: amount}("");
        if (!sent) revert PaymentTransferFailed();

        emit PaymentReleased(requestId, request.provider, amount, request.receiptHash);
    }

    function refundOnTimeout(uint256 requestId) external {
        RetrievalRequest storage request = requests[requestId];
        if (request.client != msg.sender) revert OnlyClient();
        if (
            request.status != RequestStatus.Pending
                && request.status != RequestStatus.ReceiptSubmitted
        ) revert RequestNotPending();
        if (block.timestamp <= request.timeoutAt) revert RequestNotTimedOut();

        request.status = RequestStatus.Refunded;

        uint256 amount = request.amount;
        request.amount = 0;

        (bool sent,) = request.client.call{value: amount}("");
        if (!sent) revert PaymentTransferFailed();

        emit Refunded(requestId, request.client, amount);
    }
}
