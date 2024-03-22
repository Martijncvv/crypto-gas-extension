const NETWORKS = {
  base: {
    name: "Base",
    domain: "api.basescan.org",
    usdcContractAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    color: [0, 79, 247, 255],
    src: "images/baseIcon.png",
  },
  ethereum: {
    name: "Ethereum",
    domain: "api.etherscan.io",
    usdcContractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    color: [95, 88, 131, 255],
    src: "images/ethereumIcon.png",
  },
  "arbitrum-one": {
    name: "Arbitrum",
    domain: "api.arbiscan.io",
    usdcContractAddress: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    color: [17, 165, 247, 255],
    src: "images/arbitrumIcon.png",
  },
  "optimistic-ethereum": {
    // #f7041f
    name: "Optimism",
    domain: "api-optimistic.etherscan.io",
    usdcContractAddress: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
    color: [247, 4, 31, 255],
    src: "images/optimismIcon.png",
  },
  // avalanche: {
  //   name: "Avalanche",
  //   domain: "api.snowtrace.io",
  //   usdcContractAddress: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
  //   color: [225, 63, 64, 255],
  //   src: "images/avalancheIcon.png",
  // },
  // "binance-smart-chain": {
  //   name: "BSC",
  //   domain: "api.bscscan.com",
  //   usdcContractAddress: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
  //   color: [232, 178, 8, 255],
  //   src: "images/binanceSmartChainIcon.png",
  // },
  // celo: {
  //   name: "Celo",
  //   domain: "api.celoscan.io",
  //   usdcContractAddress: "0xceba9300f2b948710d2653dd7b07f33a8b32118c",
  //   color: [51, 201, 123, 255],
  //   src: "images/celoIcon.png",
  // },
  // cronos: {
  //   name: "Cronos",
  //   domain: "api.cronoscan.com",
  //   usdcContractAddress: "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59",
  //   color: [1, 44, 112, 255],
  //   src: "images/cronosIcon.png",
  // },

  // fantom: {
  //   name: "Fantom",
  //   domain: "api.ftmscan.com",
  //   usdcContractAddress: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
  //   color: [18, 175, 229, 255],
  //   src: "images/fantomIcon.png",
  // },
  // "polygon-pos": {
  //   name: "Polygon",
  //   domain: "api.polygonscan.com",
  //   usdcContractAddress: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
  //   color: [126, 69, 222, 255],
  //   src: "images/polygonIcon.png",
  // },
};

(async () => {
  chrome.runtime.onInstalled.addListener(() => {
    createAlarm();
    fetchAndDisplayGasPrice();
  });

  chrome.runtime.onStartup.addListener(() => {
    fetchAndDisplayGasPrice();
  });

  function createAlarm() {
    chrome.alarms.create("fetchLatestBaseGas", {
      delayInMinutes: 0,
      periodInMinutes: 10,
    });
  }

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "fetchLatestBaseGas") {
      fetchAndDisplayGasPrice();
    }
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

      // get average gas price from the txs
      response?.result?.forEach((tx) => {
        console.log(tx.gasPrice);
        totalGasPrice += parseInt(tx.gasPrice);
        counter++;
      });

      let averageGasPrice = totalGasPrice / counter;

      // Display in Mwei, rounded down.
      let averageGasPriceInMwei = Math.floor(
        parseInt(averageGasPrice) / 1000_000,
      );
      if (!averageGasPriceInMwei) {
        throw new Error("Gas price not found");
      }

      console.log("averageGasPriceInMwei: ", averageGasPriceInMwei);

      if (averageGasPriceInMwei > 9999) {
        averageGasPriceInMwei = `${Math.round(averageGasPriceInMwei / 1000)}k`;
      } else if (averageGasPriceInMwei > 999) {
        let formattedPrice = (averageGasPriceInMwei / 1000).toFixed(1);
        if (formattedPrice.length > 3) {
          averageGasPriceInMwei = `${Math.round(
            averageGasPriceInMwei / 1000,
          )}k`;
        } else {
          averageGasPriceInMwei = `${formattedPrice}k`;
        }
      }

      chrome.action.setBadgeText({ text: `${averageGasPriceInMwei}` });
      chrome.action.setBadgeBackgroundColor({ color: networkConfig.color });
    } catch (error) {
      console.error("Error fetching base txs: ", error?.message);
    }
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "setIcon") {
      const { networkPref } = message;
      const networkConfig = NETWORKS[networkPref];
      if (networkConfig && networkConfig.src) {
        chrome.action.setIcon({ path: networkConfig.src });
      } else {
        console.error(
          "Network not found or icon path not defined for:",
          networkPref,
        );
      }
      chrome.action.setBadgeText({ text: `...` });
      chrome.action.setBadgeBackgroundColor({ color: networkConfig.color });
      fetchAndDisplayGasPrice();
    }
  });
})();
