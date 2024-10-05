"use client";

import { Main, Nav, Footer } from "./components";
import PageTheme from "./page-theme";

export default function Home() {
  return (
    <PageTheme>
      <Nav></Nav>
      <Main></Main>
      <Footer></Footer>
    </PageTheme>
  );
}
