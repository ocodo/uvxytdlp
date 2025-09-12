import type { WavesurferSettingsContextType } from "@/contexts/wavesurfer-settings-provider";
import { createContext } from "react";

export const WavesurferSettingsContext = createContext<WavesurferSettingsContextType>({} as WavesurferSettingsContextType);
