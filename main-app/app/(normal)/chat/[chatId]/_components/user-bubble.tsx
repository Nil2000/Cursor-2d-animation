import { Card } from "@/components/ui/card";
import UserAvatar from "@/components/user-avatar";
import Image from "next/image";
import React from "react";

type Props = {
  messageBody: string;
  imgUrl?: string | null;
};

const UserBubble = React.memo(function UserBubble({
  messageBody,
  imgUrl,
}: Props) {
  return (
    <div className="flex justify-end items-end gap-2">
      <Card className="p-4 sm:max-w-3/4 max-w-full w-max rounded-md shadow-none bg-primary text-primary-foreground">
        {messageBody}
      </Card>
      <UserAvatar imgUrl={imgUrl} />
    </div>
  );
});

export default UserBubble;
