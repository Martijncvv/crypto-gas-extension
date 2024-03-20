import React from "react";
import { createRoot } from "react-dom/client";

const App: React.FC = () => {
  return <></>;
};

const root = document.createElement("div");
document.body.appendChild(root);
createRoot(root).render(<App />);
