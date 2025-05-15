"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import React from "react";
import { FcGoogle } from "react-icons/fc";

export default function SingInForm() {
  return (
    <Card className="p-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold mx-auto">Sign in</h1>
      <Button
        variant={"outline"}
        onClick={async () => {
          await authClient.signIn.social({
            provider: "google",
          });
        }}
      >
        <FcGoogle />
        Sign in with Google
      </Button>
    </Card>
  );
}
