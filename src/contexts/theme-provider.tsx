import React, { useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ThemeContext } from "@/contexts/theme-context";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>("theme", "light");

  useEffect(() => {
    if (theme == 'dark') {
      document.querySelector('.body-background-gradient')?.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.querySelector('.body-background-gradient')?.classList.remove('dark')
      document.body.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () =>
    (theme == 'light')
      ? setTheme('dark')
      : setTheme('light')

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
