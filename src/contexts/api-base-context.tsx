import type { ApiBaseContextType } from "@/contexts/api-base-context-provider";
import { createContext, useContext } from "react";

export const ApiBaseContext = createContext<ApiBaseContextType | undefined>(undefined);

export const useApiBase = () => {
  const context = useContext(ApiBaseContext);
  if (context === undefined) {
    throw new Error('useApiBase must be used within an ApiBaseProvider');
  }
  return context;
};