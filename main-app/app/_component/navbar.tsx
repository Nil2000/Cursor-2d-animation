"use client";
import React from "react";
import NavbarAuthStatus from "./navbar-components/navbar-auth-status";
import ThemeButton from "@/components/theme-button";
import Logo from "@/components/logo";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 w-full h-16 absolute top-0 left-0 right-0">
      <div className="flex items-center gap-2">
        <Logo />
        {/* <div>AniX</div> */}
      </div>
      <div className="flex gap-2">
        <ThemeButton />
        <NavbarAuthStatus />
      </div>
    </nav>
  );
}
