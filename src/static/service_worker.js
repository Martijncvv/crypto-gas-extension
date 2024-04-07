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

  scroll: {
    // ##ffeeda
    name: "Scroll",
    domain: "api.scrollscan.com",
    usdcContractAddress: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
    color: [255, 238, 218, 255],
    src: "images/scrollIcon.png",
  },

  zksync: {
    // ##2e318b
    name: "zkSync",
    domain: "api-era.zksync.network",
    usdcContractAddress: "0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4",
    color: [46, 49, 139, 255],
    src: "images/zksyncIcon.png",
  },
  // linea: {
  //   // #5bd0ed
  //   // https://docs.lineascan.build/getting-started/endpoint-urls
  //   name: "Linea",
  //   domain: "api.lineascan.build",
  //   usdcContractAddress: "",
  //   color: [91, 208, 237, 255],
  //   src: "images/lineaIcon.png",
  //   // TODO convert to 100px, usdc contract
  // },
  // blast: {
  //   // ###FCFC03
  //   // https://docs.blastscan.io/getting-started/endpoint-urls
  //   name: "Blast",
  //   domain: "api.blastscan.io",
  //   usdcContractAddress: "",
  //   color: [252, 252, 3, 255],
  //   src: "images/blastIcon.png",
  //   // TODO convert to 100px, usdc contract
  // },
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
    chrome.alarms.create("fetchLatestGasPrices", {
      delayInMinutes: 0,
      periodInMinutes: 10,
    });
  }

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "fetchLatestGasPrices") {
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

      await new Promise((resolve) => setTimeout(resolve, 3000));
      const res = await fetch(
        `https://${networkConfig.domain}/api?module=account&action=tokentx&contractaddress=${networkConfig.usdcContractAddress}&page=1&offset=30&startblock=0&endblock=99999999&sort=desc`,
      );

      if (!res.ok) {
        throw new Error(
          `Fetch error, token txs, domain: ${networkConfig.domain}, contract${networkConfig.usdcContractAddress}, info: ${res.status} ${res.statusText}`,
        );
      }
      let response = await res.json();

      if (
        response?.result ===
        "Max rate limit reached, please use API Key for higher rate limit"
      ) {
        console.log("Rate limit reached, retrying in 5050ms");
        await new Promise((resolve) => setTimeout(resolve, 5050));
        const res2 = await fetch(
          `https://${networkConfig.domain}/api?module=account&action=tokentx&contractaddress=${networkConfig.usdcContractAddress}&page=1&offset=30&startblock=0&endblock=99999999&sort=desc`,
        );
        response = await res2.json();
      }

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
      let averageGasPriceInMwei = Math.floor(averageGasPrice / 1000_000);
      if (!averageGasPriceInMwei) {
        throw new Error("Gas price not found");
      }

      let formattedGasPrice = averageGasPriceInMwei.toString();
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

      // CHECK NOTIFICATION
      const { gasAmount } = await chrome.storage.local.get("gasAmount");
      if (gasAmount && averageGasPriceInMwei < gasAmount) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: networkConfig.src,
          title: `Crypto Gas Tracker`,
          message: `${networkConfig.name} average gas price: ${formattedGasPrice} Mwei`,
        });
      }
    } catch (error) {
      console.error("Error fetching txs: ", error?.message);
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
