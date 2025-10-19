import { Card } from "@/components/ui/card";
import UserAvatar from "@/components/user-avatar";
import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

type Props = {
  messageBody: string;
  imgUrl?: string | null;
  retry?: boolean;
  retryHandler?: () => void;
};

const UserBubble = React.memo(function UserBubble({
  messageBody,
  imgUrl,
  retry,
  retryHandler,
}: Props) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div className="flex justify-end items-center">
      {retry && hovered && (
        <div
          className="flex gap-2 -mr-2 px-4"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Button
            size={"icon"}
            variant="outline"
            onClick={retryHandler}
            title="Retry last response"
          >
            <RotateCcw size={16} />
          </Button>
        </div>
      )}
      <Card
        className="p-4 sm:max-w-3/4 max-w-full w-max rounded-md shadow-none bg-primary text-primary-foreground mr-2"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {messageBody}
      </Card>
      <UserAvatar imgUrl={imgUrl} />
    </div>
  );
});

export default UserBubble;
