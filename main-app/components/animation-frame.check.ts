import { stageFromReply } from "./animation-frame";

const cases: Array<
  [string | undefined, { status: string; url?: string } | undefined, string]
> = [
  [undefined, { status: "pending", url: "" }, "rendering"],
  [undefined, { status: "completed", url: "https://cdn.example/v.mp4" }, "ready"],
  [undefined, { status: "completed", url: "" }, "failed"],
  [undefined, { status: "failed" }, "failed"],
  ["The model returned an unexpected response.", undefined, "failed"],
  [undefined, undefined, "failed"],
];

for (const [error, video, want] of cases) {
  const got = stageFromReply(error, video);
  if (got !== want) {
    throw new Error(
      `stageFromReply(${JSON.stringify(error)}, ${JSON.stringify(video)}) = ${got}, want ${want}`,
    );
  }
}

console.log("animation-frame stage check ok");
