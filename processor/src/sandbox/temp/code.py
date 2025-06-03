from manim import *

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
        self.play(FadeOut(square))