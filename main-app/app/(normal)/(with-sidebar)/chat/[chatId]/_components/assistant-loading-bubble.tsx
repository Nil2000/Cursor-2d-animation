import React from "react";
import AnimationFrame from "@/components/animation-frame";
import AssistantRow from "./assistant-row";

const AssistantLoadingBubble = React.memo(function AssistantLoadingBubble() {
  return (
    <AssistantRow>
      <AnimationFrame stage="writing" />
    </AssistantRow>
  );
});

export default AssistantLoadingBubble;
