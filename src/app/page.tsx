"use client"
import "./styles/home.css"
import Page0 from "./Component/page0";
import Navbar from "./Component/Navbar";
import { BackgroundBeams } from "./Component/heroBeams";

export default function Home() {
  return (
    <>
      <Navbar />
      <div style={{ position: "relative", zIndex: 1 }}>
        <BackgroundBeams className="absolute inset-0 z-0" />
          <Page0/>
      </div>
    </>
  );
}
