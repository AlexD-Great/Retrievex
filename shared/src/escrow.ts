export const CALIBRATION_CHAIN_ID = 314159;

/**
 * On-chain status values from Escrow.sol RequestStatus enum.
 * Kept in sync with contracts/contracts/Escrow.sol.
 */
export enum EscrowRequestStatus {
  Pending = 0,
  ReceiptSubmitted = 1,
  Completed = 2,
  Refunded = 3
}

/**
 * Human-readable Escrow ABI shared by the backend (ethers) and frontend
 * (viem/wagmi via parseAbi). Single source of truth for the contract surface.
 */
export const ESCROW_ABI = [
  "function createRequest(string cid, address provider, uint256 timeoutAt) payable returns (uint256 requestId)",
  "function submitReceipt(uint256 requestId, bytes32 receiptHash)",
  "function confirmReceipt(uint256 requestId)",
  "function refundOnTimeout(uint256 requestId)",
  "function requests(uint256) view returns (string cid, address client, address provider, uint256 amount, uint256 timeoutAt, bytes32 receiptHash, uint8 status)",
  "event RetrievalRequested(uint256 indexed requestId, string cid, address indexed client, address indexed provider, uint256 amount, uint256 timeoutAt)",
  "event ReceiptSubmitted(uint256 indexed requestId, address indexed provider, bytes32 receiptHash)",
  "event PaymentReleased(uint256 indexed requestId, address indexed provider, uint256 amount, bytes32 receiptHash)",
  "event Refunded(uint256 indexed requestId, address indexed client, uint256 amount)"
] as const;
