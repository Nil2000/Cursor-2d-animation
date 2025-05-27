import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRoundIcon } from "lucide-react";
type Props = {
  imgUrl?: string | null;
};

export default function UserAvatar({ imgUrl }: Props = { imgUrl: undefined }) {
  return (
    <Avatar className="rounded-md">
      <AvatarImage src={imgUrl!} alt="Kelly King" />
      <AvatarFallback>
        <UserRoundIcon size={16} className="opacity-60" aria-hidden="true" />
      </AvatarFallback>
    </Avatar>
  );
}
