import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Auth0Provider } from "@auth0/auth0-react";

function setAppHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--app-vh", `${vh}px`);
}
window.addEventListener("resize", setAppHeight);
setAppHeight();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENTID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_API_URL,
        scope: "openid profile email",
      }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>
);
