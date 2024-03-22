import React, { CSSProperties, useState } from "react";
import { setStorageNetworkPref } from "../utils/storage";

export const NetworkPrefOptionButton = ({
  networkInfo: { networkPref, name, src },
}) => {
  const [focused, setFocused] = useState<boolean>(false);

  const styles: { [key: string]: CSSProperties } = {
    buttonContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 20,
      color: "white",
      paddingRight: 30,
      paddingLeft: 10,
      paddingBottom: 4,
      paddingTop: 4,
      cursor: "pointer",
    },

    networkPrefFocus: {
      boxShadow: `inset 0 0 4px 3px rgba(255, 255, 255, 0.5)`,
      outline: "none",
    } as any,

    mainLogo: {
      width: 26,
      height: 26,
      borderRadius: 2,
    },
  };

  const handleOnclick = (networkPref: string) => {
    setStorageNetworkPref(networkPref);
    chrome.runtime.sendMessage({ action: "setIcon", networkPref });
    console.log("Network Pref set to: ", networkPref);
  };

  return (
    <div
      onClick={() => handleOnclick(networkPref)}
      style={{
        ...styles.buttonContainer,
        ...(focused ? styles.networkPrefFocus : {}),
      }}
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
    >
      <img
        style={styles.mainLogo}
        src={
          src ||
          "https://assets.coingecko.com/coins/images/5/small/dogecoin.png?1547792256"
        }
        alt="Main Logo"
      />
      <p>{name}</p>
    </div>
  );
};
