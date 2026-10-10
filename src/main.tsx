import React from "react";
import ReactDOM from "react-dom/client";
import "./assets/fonts/misans.css";
import "./material/registry";
import { styles as typescaleStyles } from "@material/web/typography/md-typescale-styles.js";
import { Md3eProvider } from "./component";
import App from "./App";

const typeStyles = typescaleStyles.styleSheet;
if (typeStyles) {
  document.adoptedStyleSheets.push(typeStyles);
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Md3eProvider palette="purple">
      <App />
    </Md3eProvider>
  </React.StrictMode>,
);
