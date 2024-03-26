import React, { CSSProperties, useEffect, useState } from "react";
import "./popup.css";
import { createRoot } from "react-dom/client";
import { NetworkPrefOptionButton } from "../components/NetwerkPrefOptionButton";
import { NETWORKS } from "../static/constants";
import { getMweiGasAlarm, getStorageNetworkPref } from "../utils/storage";

const App: React.FC = () => {
  const [mweiAlarmInput, setMweiAlarmInput] = useState<number | undefined>();
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

  async function fetchAndDisplayGasPrice() {
    try {
      let { networkPref } = await chrome.storage.local.get("networkPref");

      if (!networkPref) {
        networkPref = "base";
        console.log("Network preference not found");
      }

      const networkConfig = NETWORKS[networkPref];

      const res = await fetch(
        `https://${networkConfig.domain}/api?module=account&action=tokentx&contractaddress=${networkConfig.usdcContractAddress}&page=1&offset=30&startblock=0&endblock=99999999&sort=desc`,
      );

      if (!res.ok) {
        throw new Error(
          `Fetch error, token txs, domain: ${networkConfig.domain}, contract${networkConfig.usdcContractAddress}, info: ${res.status} ${res.statusText}`,
        );
      }
      const response = await res.json();

      let totalGasPrice = 0;
      let counter = 0;

      if (response?.result?.length > 0) {
        // get average gas price from the txs
        response?.result?.forEach((tx) => {
          totalGasPrice += parseInt(tx.gasPrice);
          counter++;
        });
      }

      let averageGasPrice = totalGasPrice / counter;

      // Display in Mwei, rounded down.
      let averageGasPriceInMwei: number = Math.floor(
        averageGasPrice / 1000_000,
      );
      if (!averageGasPriceInMwei) {
        throw new Error("Gas price not found");
      }

      let formattedGasPrice: string = averageGasPriceInMwei.toString();
      // FORMAT GAS PRICE
      if (averageGasPriceInMwei > 9999) {
        formattedGasPrice = `${Math.round(averageGasPriceInMwei / 1000)}k`;
      } else if (averageGasPriceInMwei > 999) {
        let formattedPrice = (averageGasPriceInMwei / 1000).toFixed(1);
        if (formattedPrice.length > 3) {
          formattedGasPrice = `${Math.round(averageGasPriceInMwei / 1000)}k`;
        } else {
          formattedGasPrice = `${formattedPrice}k`;
        }
      }

      chrome.action.setBadgeText({ text: formattedGasPrice });
      chrome.action.setBadgeBackgroundColor({ color: networkConfig.color });
      chrome.action.setIcon({ path: networkConfig.src });
    } catch (error) {
      console.error("Error fetching base txs: ", error?.message);
    }
  }

  const setDefaultValueMweiGasAlarm = async () => {
    const gasAmountAlarm = await getMweiGasAlarm();
    if (gasAmountAlarm > 0) {
      setMweiAlarmInput(gasAmountAlarm);
    }
  };

  useEffect(() => {
    fetchAndDisplayGasPrice();
    setDefaultValueMweiGasAlarm();
  }, []);

  const styles: {
    [key: string]: CSSProperties;
  } = {
    mweiAlarmInputField: {
      width: "80%",
      padding: "5px 5px 5px 5px",
      borderRadius: 6,
      fontSize: "12px",
      color: "blue",
      border: "none",
      outline: "none",
    },

    mweiAlarmHelperText: {
      fontSize: "10px",
      color: "white",
      width: "100%",
      textAlign: "center",
    },
  };

  return (
    <>
      {formattedNetworks.map((networkInfo) => (
        <NetworkPrefOptionButton
          networkInfo={networkInfo}
          key={networkInfo.networkPref}
        />
      ))}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <input
          type="number"
          placeholder="Amount in Mwei"
          onChange={(e) => {
            const gasAmount = parseInt(e.target.value);
            chrome.storage.local.set({ gasAmount: gasAmount });
            setMweiAlarmInput(gasAmount);
          }}
          value={mweiAlarmInput}
          style={styles.mweiAlarmInputField}
        />
        <p style={styles.mweiAlarmHelperText}>
          Enter Mwei threshold for notification on low gas price on chosen
          network
        </p>
      </div>
    </>
  );
};

const root = document.createElement("div");
document.body.appendChild(root);
createRoot(root).render(<App />);
