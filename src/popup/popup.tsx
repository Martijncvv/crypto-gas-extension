import React from "react";
import "./popup.css";
import { createRoot } from "react-dom/client";
import { NetworkPrefOptionButton } from "../components/NetwerkPrefOptionButton";
import { NETWORKS } from "../static/constants";

const App: React.FC = () => {
  const formattedNetworks = Object.keys(NETWORKS).map((network) => {
    return {
      networkPref: network,
      name: NETWORKS[network].name,
      domain: NETWORKS[network].domain,
      usdcContractAddress: NETWORKS[network].usdcContractAddress,
      color: NETWORKS[network].color,
      src: NETWORKS[network].src,
    };
  });

  return (
    <>
      {formattedNetworks.map((networkInfo) => (
        <NetworkPrefOptionButton
          networkInfo={networkInfo}
          key={networkInfo.networkPref}
        />
      ))}
    </>
  );
};

const root = document.createElement("div");
document.body.appendChild(root);
createRoot(root).render(<App />);
