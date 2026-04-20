import { Mail, MessageSquareText } from "lucide-react";
import type { CampaignSummary } from "@repo/api-contracts";
import { channelLabel } from "@repo/marketing";
import { Badge } from "@/components/ui/badge";

type Props = { channel: CampaignSummary["channel"] };

export function ChannelBadge({ channel }: Props) {
  return (
    <Badge variant="secondary" className="gap-1.5">
      {channel === "EMAIL" ? (
        <Mail className="h-3.5 w-3.5" />
      ) : (
        <MessageSquareText className="h-3.5 w-3.5" />
      )}
      {channelLabel(channel)}
    </Badge>
  );
}
