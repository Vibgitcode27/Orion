"use client"
import "../../styles/home.css";
import Navbar from "@/app/Component/Navbar";
import { BackgroundBeams } from "@/app/Component/heroBeams";
import GenSeed from "@/app/Component/genSeed";

export default function GenerateSeed() {
  return (
    <>
      <Navbar />
      <div style={{ position: "relative", zIndex: 1 }}>
        <BackgroundBeams className="absolute inset-0 z-0" />
        <GenSeed />
      </div>
</>
)}