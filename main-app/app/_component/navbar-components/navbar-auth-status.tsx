"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import React from "react";

export default function NavbarAuthStatus() {
  const { data: session } = authClient.useSession();

  if (!session || !session.user) {
    return (
      <div className="flex items-center gap-2">
        <Link href={"/login"}>
          <Button variant={"outline"}>Signin</Button>
        </Link>
        <Link href={"/signup"}>
          <Button>Signup</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Button
        variant={"destructive"}
        onClick={async () => {
          await authClient.signOut();
        }}
      >
        SignOut
      </Button>
    </div>
  );
}
