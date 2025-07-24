import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Auth0Provider } from "@auth0/auth0-react";

// Enhanced viewport height function with better mobile support
function setAppHeight() {
  // Get the viewport height and set CSS custom property
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);

  // For bottom bar positioning
  document.documentElement.style.setProperty(
    "--app-height",
    `${window.innerHeight}px`
  );
}

// 3. Better event listeners for main.jsx
let resizeTimeout;
function handleResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    requestAnimationFrame(setAppHeight);
  }, 50);
}

setAppHeight();
window.addEventListener("resize", handleResize, { passive: true });
window.addEventListener(
  "orientationchange",
  () => {
    setTimeout(setAppHeight, 500);
  },
  { passive: true }
);

// Support for Visual Viewport API (mobile browsers)
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", handleResize, {
    passive: true,
  });
}

// Handle page visibility changes (when returning from background)
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    setTimeout(setAppHeight, 100);
  }
});

// Service worker handling
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}

// Cleanup function for development
if (process.env.NODE_ENV === "development") {
  window.refreshViewport = setAppHeight;
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
