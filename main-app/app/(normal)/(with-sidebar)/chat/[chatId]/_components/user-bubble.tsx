import { Card } from "@/components/ui/card";
import UserAvatar from "@/components/user-avatar";
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
  return (
    <div className="flex justify-end items-start group">
      {retry && (
        <div className="flex gap-2 -mr-2 px-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
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
      <Card className="sm:max-w-[75%] rounded-md shadow-none bg-primary text-primary-foreground mr-2 px-3 py-2">
        {messageBody}
      </Card>
      <UserAvatar imgUrl={imgUrl} />
    </div>
  );
});

export default UserBubble;
