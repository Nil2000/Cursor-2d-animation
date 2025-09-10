import { Card } from "@/components/ui/card";
import UserAvatar from "@/components/user-avatar";
import Image from "next/image";
import React from "react";

type Props = {
  messageBody: string;
  imgUrl?: string | null;
};

const UserBubble = React.memo(function UserBubble({ messageBody, imgUrl }: Props) {
  return (
    <div className="flex justify-end items-end gap-2">
      <Card className="p-4 sm:max-w-3/4 max-w-full w-max border-none bg-gradient-to-tl dark:from-zinc-700 dark:to-zinc-500 from-zinc-300 to-zinc-100 rounded-md">
        {messageBody}
      </Card>
      <UserAvatar imgUrl={imgUrl} />
    </div>
  );
});

export default UserBubble;
