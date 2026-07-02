import { http, createConfig } from "wagmi";
import { filecoinCalibration } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const rpcUrl = import.meta.env.VITE_FILECOIN_RPC_URL;

export const wagmiConfig = createConfig({
  chains: [filecoinCalibration],
  connectors: [injected()],
  transports: {
    [filecoinCalibration.id]: http(rpcUrl)
  }
});
