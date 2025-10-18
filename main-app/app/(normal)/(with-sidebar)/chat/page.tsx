import React from "react";
import Client from "./_components/client";
import { checkAuthentication } from "@/actions/authActions";
import { redirect } from "next/navigation";

export default function page() {
  const session = checkAuthentication();

  if (!session) {
    redirect("/login");
  }

  return <Client />;
}
