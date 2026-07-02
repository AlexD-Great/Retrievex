import { ESCROW_ABI, EscrowRequestStatus } from "@retrievex/shared";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import type { BackendConfig } from "../config.js";

export interface OnChainRequest {
  cid: string;
  client: string;
  provider: string;
  amount: bigint;
  timeoutAt: bigint;
  status: EscrowRequestStatus;
}

/**
 * Backend-side view of the escrow. In the wallet model the CLIENT deposits and
 * releases funds from their own wallet, so the backend only:
 *  - reads on-chain requests to verify a client actually locked funds, and
 *  - submits the receipt hash as the SP operator (holds the SP key).
 */
export class EscrowService {
  private readonly provider: JsonRpcProvider;
  private readonly spWallet: Wallet;
  private readonly readContract: Contract;
  private readonly spContract: Contract;

  constructor(private readonly config: BackendConfig) {
    this.provider = new JsonRpcProvider(config.filecoinRpcUrl);
    this.spWallet = new Wallet(config.spPrivateKey, this.provider);
    this.readContract = new Contract(config.escrowContractAddress, ESCROW_ABI, this.provider);
    this.spContract = new Contract(config.escrowContractAddress, ESCROW_ABI, this.spWallet);
  }

  getProviderAddress(): string {
    return this.spWallet.address;
  }

  async getOnChainRequest(requestId: string): Promise<OnChainRequest> {
    const result = await this.readContract.requests(requestId);
    return {
      cid: result.cid,
      client: result.client,
      provider: result.provider,
      amount: result.amount,
      timeoutAt: result.timeoutAt,
      status: Number(result.status) as EscrowRequestStatus
    };
  }

  async submitReceipt(requestId: string, receiptHash: string): Promise<void> {
    const transaction = await this.spContract.submitReceipt(requestId, receiptHash);
    await transaction.wait();
  }

  /** Signs a receipt payload as the SP operator, producing the stored receipt signature. */
  async signAsProvider(message: string): Promise<string> {
    return this.spWallet.signMessage(message);
  }
}
