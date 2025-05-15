"use client";
import React from "react";
import NavbarAuthStatus from "./navbar-components/navbar-auth-status";
import ThemeButton from "@/components/theme-button";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 w-full h-16">
      <div>AniX</div>
      <div className="flex gap-2">
        <ThemeButton />
        <NavbarAuthStatus />
      </div>
    </nav>
  );
}
