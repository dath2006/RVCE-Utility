import React from "react";
import { useWindowContext } from "./WindowContext";
import Window from "./Window";
import MinimizedBar from "./MinimizedBar";
import { Plus } from "lucide-react";

const WindowManager = ({ children }) => {
  const { windows, addWindow, getActiveWindowCount } = useWindowContext();

  // Sample function to add a new window (for demo purposes)
  const handleAddWindow = () => {
    // Check if we already have two active windows
    if (getActiveWindowCount() >= 2) {
      alert(
        "You can only have two windows open at once. Please minimize or close one first."
      );
      return;
    }
  };

  return (
    <>
      {/* Render all non-minimized windows */}
      {windows.map((window) => (
        <Window key={window.id} data={window} />
      ))}

      {/* Render the minimized windows bar */}
      <MinimizedBar />

      {children}
    </>
  );
};

export default WindowManager;
