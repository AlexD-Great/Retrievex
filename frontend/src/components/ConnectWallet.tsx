import { useAccount, useConnect, useDisconnect } from "wagmi";

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const injected = connectors[0];

  if (isConnected && address) {
    return (
      <div className="wallet">
        <span className="wallet-address">{shortAddress(address)}</span>
        <button type="button" className="nav-link" onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="nav-link"
      disabled={isPending || !injected}
      onClick={() => injected && connect({ connector: injected })}
    >
      {isPending ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
