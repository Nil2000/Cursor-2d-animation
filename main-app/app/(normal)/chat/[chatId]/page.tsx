import React from "react";

export default async function page(
  params: Promise<{
    chatId: string;
  }>
) {
  const { chatId } = await params;
  return <div>page ${chatId}</div>;
}
