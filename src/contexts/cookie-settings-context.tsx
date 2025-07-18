import type { CookeSettingsProviderValue } from "@/contexts/cookie-settings-context-provider";
import { createContext, useContext } from "react";

export const CookieSettingsContext = createContext<CookeSettingsProviderValue | undefined>(undefined);

export const useCookieSettingsContext = () => {
  const context = useContext(CookieSettingsContext);
  if (!context) {
    throw new Error('useCookiesSettingsContext must be used within a CookieSettingsProvider');
  }
  return context;
};
