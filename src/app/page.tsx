"use client";

import { useEffect, useState } from "react";
import { Main, Nav, Footer } from "./components";
import { setTheme } from "./themes";

export default function Home() {
  const [loading, setLoading] = useState(true); // Initialize loading state

  useEffect(() => {
    setTheme(); // Set theme on initial render
    setLoading(false); // Set loading to false after the theme is set
  }, []); // Empty dependency array to run only on mount
  if (loading) {
    return <div>Loading...</div>; // You can customize this loading indicator
  }
  return (
    <>
      <Nav></Nav>
      <Main></Main>
      <Footer></Footer>
    </>
  );
}
