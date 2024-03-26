export async function setStorageNetworkPref(
  networkPref: string,
): Promise<void> {
  try {
    return new Promise((resolve) => {
      chrome.storage.local.set({ networkPref: networkPref }, () => {
        resolve();
      });
    });
  } catch (error) {
    console.log("setStorageNetworkPref error: ", error);
  }
}

export async function setMweiGasAlarm(gasAmount: number): Promise<void> {
  try {
    return new Promise((resolve) => {
      chrome.storage.local.set({ gasAmount: gasAmount }, () => {
        resolve();
      });
    });
  } catch (error) {
    console.log("setNetworkGasAlarm error: ", error);
  }
}

export async function getStorageNetworkPref(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["networkPref"], (res: any) => {
      if (res?.networkPref) {
        resolve(res.networkPref);
      } else {
        resolve(null);
      }
    });
  });
}

export async function getMweiGasAlarm(): Promise<number> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["gasAmount"], (res: any) => {
      if (res?.gasAmount) {
        resolve(res.gasAmount);
      } else {
        resolve(null);
      }
    });
  });
}
