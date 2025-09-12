import { WavesurferSettingsContext } from "@/contexts/wavesurfer-settings-context";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { FC, ReactNode } from "react";

export interface WavesurferSettingsContextType {
  progressColor: string;
  setProgressColor: (newValue: string) => void;
  waveColor: string;
  setWaveColor: (newValue: string) => void;
  height: number;
  setHeight: (newValue: number) => void;
  barGap: number;
  setBarGap: (newValue: number) => void;
  barWidth: number;
  setBarWidth: (newValue: number) => void;
  barRadius: number;
  setBarRadius: (newValue: number) => void;
}

export const WavesurferSettingsProvider: FC<{ children: ReactNode; }> = ({ children }) => {

  const [height, setHeight] = useLocalStorage<number>('wavesurfer-height', 80);
  const [waveColor, setWaveColor] = useLocalStorage<string>('wavesurfer-wave-color', 'hsla(200, 26%, 49%, 0.25)');
  const [progressColor, setProgressColor] = useLocalStorage<string>('wavesurfer-progress-color', 'oklch(50% 0.2 200.872)');
  const [barWidth, setBarWidth] = useLocalStorage<number>('wavesurfer-bar-gap', 0);
  const [barGap, setBarGap] = useLocalStorage<number>('wavesurfer-bar-gap', 0);
  const [barRadius, setBarRadius] = useLocalStorage<number>('wavesurfer-bar-radius', 0);

  return (
    <WavesurferSettingsContext.Provider value={{
      height,
      setHeight,
      waveColor,
      setWaveColor,
      progressColor,
      setProgressColor,
      barWidth,
      setBarWidth,
      barGap,
      setBarGap,
      barRadius,
      setBarRadius,
    }}>
      {children}
    </WavesurferSettingsContext.Provider>
  );
};
