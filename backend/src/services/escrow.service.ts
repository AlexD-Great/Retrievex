import type { CreateRetrievalRequestInput } from "@retrievex/shared";
import { Contract, JsonRpcProvider, Wallet, parseEther } from "ethers";
import type { Log } from "ethers";
import type { BackendConfig } from "../config.js";

export interface EscrowLockResult {
  escrow_request_id: string;
  escrow_status: "pending";
}

const ESCROW_ABI = [
  "event RetrievalRequested(uint256 indexed requestId, string cid, address indexed client, address indexed provider, uint256 amount, uint256 timeoutAt)",
  "function createRequest(string cid, address provider, uint256 timeoutAt) payable returns (uint256 requestId)",
  "function submitReceipt(uint256 requestId, bytes32 receiptHash)",
  "function confirmReceipt(uint256 requestId)"
];

export class EscrowService {
  private readonly provider: JsonRpcProvider;
  private readonly clientWallet: Wallet;
  private readonly spWallet: Wallet;
  private readonly clientContract: Contract;
  private readonly spContract: Contract;

  constructor(private readonly config: BackendConfig) {
    this.provider = new JsonRpcProvider(config.filecoinRpcUrl);
    this.clientWallet = new Wallet(config.clientPrivateKey, this.provider);
    this.spWallet = new Wallet(config.spPrivateKey, this.provider);
    this.clientContract = new Contract(
      config.escrowContractAddress,
      ESCROW_ABI,
      this.clientWallet
    );
    this.spContract = new Contract(config.escrowContractAddress, ESCROW_ABI, this.spWallet);
  }

  getClientAddress(): string {
    return this.clientWallet.address;
  }

  getProviderAddress(): string {
    return this.spWallet.address;
  }

  async lockFunds(input: CreateRetrievalRequestInput): Promise<EscrowLockResult> {
    const timeoutAt = Math.floor(Date.now() / 1000) + this.config.retrievalTimeoutSeconds;
    const transaction = await this.clientContract.createRequest(
      input.cid,
      input.sp_address,
      timeoutAt,
      { value: parseEther(input.amount_fil) }
    );
    const receipt = await transaction.wait();
    const event = receipt.logs
      .map((log: Log) => {
        try {
          return this.clientContract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((parsedLog: { name?: string } | null) => parsedLog?.name === "RetrievalRequested");

    if (!event) {
      throw new Error("RetrievalRequested event not found.");
    }

    return {
      escrow_request_id: event.args.requestId.toString(),
      escrow_status: "pending"
    };
  }

  async releasePayment(retrievalId: string, receiptHash: string): Promise<void> {
    const submitTransaction = await this.spContract.submitReceipt(retrievalId, receiptHash);
    await submitTransaction.wait();

    const confirmTransaction = await this.clientContract.confirmReceipt(retrievalId);
    await confirmTransaction.wait();
  }

  async refundOnTimeout(retrievalId: string): Promise<void> {
    void retrievalId;
    throw new Error("Timeout refund must call the deployed FVM escrow contract.");
  }
}
