import { expect } from "chai";
import { ethers } from "hardhat";

describe("Escrow", function () {
  it("locks funds and releases payment after client receipt confirmation", async function () {
    const [client, provider] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy();

    const timeoutAt = Math.floor(Date.now() / 1000) + 3600;
    await escrow
      .connect(client)
      .createRequest("bafy-phase1-cid", provider.address, timeoutAt, {
        value: ethers.parseEther("1")
      });

    await expect(
      escrow.connect(client).confirmReceipt(0, ethers.keccak256(ethers.toUtf8Bytes("receipt")))
    ).to.changeEtherBalances([escrow, provider], [ethers.parseEther("-1"), ethers.parseEther("1")]);
  });
});
