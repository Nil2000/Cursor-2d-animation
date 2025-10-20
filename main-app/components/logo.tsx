import React from "react";
import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/logo.svg"
      alt="Logo"
      width={59}
      height={36}
      className="bg-white rounded-sm p-1"
    />
  );
}
