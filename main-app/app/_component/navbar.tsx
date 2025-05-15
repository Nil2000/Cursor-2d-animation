import React from "react";
import NavbarAuthStatus from "./navbar-components/navbar-auth-status";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 w-full lg:w-[1000px] mx-auto h-16">
      <div>AniX</div>
      <div>
        <NavbarAuthStatus />
      </div>
    </nav>
  );
}
