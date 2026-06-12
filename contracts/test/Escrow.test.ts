import { expect } from "chai";
import { ethers } from "hardhat";

describe("Escrow", function () {
  it("locks funds and releases payment after client receipt confirmation", async function () {
    const [client, provider] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy();

    const timeoutAt = Math.floor(Date.now() / 1000) + 3600;
    const receiptHash = ethers.keccak256(ethers.toUtf8Bytes("receipt"));

    await escrow
      .connect(client)
      .createRequest("bafy-phase1-cid", provider.address, timeoutAt, {
        value: ethers.parseEther("1")
      });

    await expect(escrow.connect(provider).submitReceipt(0, receiptHash))
      .to.emit(escrow, "ReceiptSubmitted")
      .withArgs(0, provider.address, receiptHash);

    await expect(
      escrow.connect(client).confirmReceipt(0)
    ).to.changeEtherBalances([escrow, provider], [ethers.parseEther("-1"), ethers.parseEther("1")]);
  });

  it("refunds the client after timeout", async function () {
    const [client, provider] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy();

    const latestBlock = await ethers.provider.getBlock("latest");
    const timeoutAt = Number(latestBlock?.timestamp) + 60;

    await escrow
      .connect(client)
      .createRequest("bafy-phase1-cid", provider.address, timeoutAt, {
        value: ethers.parseEther("1")
      });

    await ethers.provider.send("evm_setNextBlockTimestamp", [timeoutAt + 1]);
    await ethers.provider.send("evm_mine", []);

    await expect(escrow.connect(client).refundOnTimeout(0)).to.changeEtherBalances(
      [escrow, client],
      [ethers.parseEther("-1"), ethers.parseEther("1")]
    );
  });
});
