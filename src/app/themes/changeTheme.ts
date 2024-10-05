const changeTheme = (index: number) => {
  document.querySelector("html")?.setAttribute("data-theme", `theme${index}`);
};

export default changeTheme;
