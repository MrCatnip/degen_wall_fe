import { createTheme } from "@mui/material";

const THEME_KEY = "themeIndex";
const DEFAULT_INDEX = 1;

export const changeTheme = (index: number | string) => {
  localStorage.setItem(THEME_KEY, `${index}`);
  document
    .querySelector("html")
    ?.setAttribute("data-theme", `theme${index || DEFAULT_INDEX}`);
};

export const setTheme = () => {
  const index = localStorage.getItem(THEME_KEY);
  document
    .querySelector("html")
    ?.setAttribute("data-theme", `theme${index || DEFAULT_INDEX}`);
};

export const muiTheme = createTheme({
  components: {
    MuiSwitch: {
      styleOverrides: {
        thumb: {
          "&$checked": {
            color: "var(--color1)",
          },
        },
      },
    },
  },
});
