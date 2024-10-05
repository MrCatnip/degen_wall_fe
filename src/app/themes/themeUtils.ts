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
  console.log(index);
  document
    .querySelector("html")
    ?.setAttribute("data-theme", `theme${index || DEFAULT_INDEX}`);
};
