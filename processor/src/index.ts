import { processMessage } from "./processMessage";
import { startConsumingMessages } from "./queue";

// startConsumingMessages({
//   topic: process.env.KAFKA_TOPIC || "default-topic",
//   onMessage: processMessage,
// }).catch((error) => {
//   console.error("Error starting message consumer:", error.message);
//   console.log(error.stack);
//   process.exit(1);
// });

processMessage(
  JSON.stringify({
    key: "test-key",
    value: `from manim import *

class SquareToCircle(Scene):
    def construct(self):
        # Create a square
        square = Square()
        square.set_fill(BLUE, opacity=0.5)

        # Display the square on screen
        self.play(Create(square))
        self.wait(1)

        # Transform the square into a circle
        circle = Circle()
        circle.set_fill(GREEN, opacity=0.5)

        self.play(Transform(square, circle))
        self.wait(1)

        # Fade out the circle
        self.play(FadeOut(square))`,
  })
);
