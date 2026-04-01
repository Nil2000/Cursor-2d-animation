import React from "react";
import Client from "./_components/client";
import { checkAuthentication } from "@/actions/authActions";
import { redirect } from "next/navigation";

export default async function page() {
  const session = await checkAuthentication();

  if (!session) {
    redirect("/login");
  }

  return <Client />;
}
