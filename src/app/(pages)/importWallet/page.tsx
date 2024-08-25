"use client"

import { useState } from "react";
import "../../styles/home.css";
import Navbar from "@/app/Component/Navbar";
import { BackgroundBeams } from "@/app/Component/heroBeams";
import RecoverWallets from "@/app/(workflow)/recoverWallets";
export default function GenerateSeed() {
  return (
    <>
      <Navbar />
      <div style={{ position: "relative", zIndex: 1 }}>
        <BackgroundBeams className="absolute inset-0 z-0" />
        <RecoverWallets/>
      </div>
</>
)}