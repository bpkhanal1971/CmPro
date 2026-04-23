import { createContext, useContext, useState } from "react";

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  language: "English",
  dateFormat: "YYYY-MM-DD",
  currency: "NPR (\u0930\u0942)",
  timezone: "Asia/Kathmandu (UTC+5:45)",
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  function updateSettings(partial) {
    setSettings((prev) => ({ ...prev, ...partial }));
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }
  return context;
}
