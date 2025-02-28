import { createContext, useContext, useEffect, ReactNode } from "react";
import { useSelector } from 'react-redux';
import { RootState } from "../infrastructure/redux/store";

interface ThemeContextType {
  theme: string;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'light' });

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme = useSelector((state : RootState) => state.auth.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);