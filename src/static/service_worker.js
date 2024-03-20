(async () => {
  chrome.runtime.onInstalled.addListener(() => {
    createAlarm();
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
      const res = await fetch(
        `https://api.basescan.org/api?module=account&action=tokentx&contractaddress=0x833589fcd6edb6e08f4c7c32d4f71b54bda02913&page=1&offset=10&startblock=0&endblock=99999999&sort=desc`,
      );

      if (!res.ok) {
        throw new Error(
          `Fetch error, token txs info: ${res.status} ${res.statusText}`,
        );
      }
      const response = await res.json();
      const gasPriceFirstTx = response.result[0]?.gasPrice;
      let totalGasPrice = 0;
      let counter = 0;

      // get average gas price from the txs
      response.result.forEach((tx) => {
        console.log(tx.gasPrice);
        totalGasPrice += parseInt(tx.gasPrice);
        counter++;
      });

      let averageGasPrice = totalGasPrice / counter;

      // Display in Mwei, rounded down.
      let averageGasPriceInMwei = Math.floor(
        parseInt(averageGasPrice) / 100_000,
      );
      if (!averageGasPriceInMwei) {
        throw new Error("Gas price not found");
      }

      chrome.action.setBadgeBackgroundColor({ color: [0, 79, 246, 255] });

      if (averageGasPriceInMwei > 1000) {
        averageGasPriceInMwei = `${(averageGasPriceInMwei / 1000).toFixed(1)}k`;
      }

      chrome.action.setBadgeText({ text: `${averageGasPriceInMwei}` });
    } catch (error) {
      console.error("Error fetching base txs: ", error);
      // Consider handling errors in a user-visible way, such as resetting the badge.
    }
  }
})();
