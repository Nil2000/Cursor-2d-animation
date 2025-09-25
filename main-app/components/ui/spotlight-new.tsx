"use client";
import React from "react";
import { motion } from "motion/react";

type SpotlightProps = {
  theme?: "light" | "dark";
  gradientFirst?: string;
  gradientSecond?: string;
  gradientThird?: string;
  translateY?: number;
  width?: number;
  height?: number;
  smallWidth?: number;
  duration?: number;
  xOffset?: number;
};

export const Spotlight = ({
  theme = "dark",
  gradientFirst,
  gradientSecond,
  gradientThird,
  translateY = -350,
  width = 560,
  height = 1380,
  smallWidth = 240,
  duration = 7,
  xOffset = 100,
}: SpotlightProps = {}) => {
  // Whitish gradients for dark theme
  const darkGradients = {
    first: "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(0, 0%, 95%, .12) 0, hsla(0, 0%, 85%, .06) 50%, hsla(0, 0%, 75%, 0) 80%)",
    second: "radial-gradient(50% 50% at 50% 50%, hsla(0, 0%, 90%, .08) 0, hsla(0, 0%, 80%, .04) 80%, transparent 100%)",
    third: "radial-gradient(50% 50% at 50% 50%, hsla(0, 0%, 85%, .06) 0, hsla(0, 0%, 75%, .03) 80%, transparent 100%)"
  };

  // Brownish gradients for light theme
  const lightGradients = {
    first: "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(30, 40%, 25%, .15) 0, hsla(25, 35%, 20%, .08) 50%, hsla(20, 30%, 15%, 0) 80%)",
    second: "radial-gradient(50% 50% at 50% 50%, hsla(35, 45%, 30%, .10) 0, hsla(30, 40%, 25%, .05) 80%, transparent 100%)",
    third: "radial-gradient(50% 50% at 50% 50%, hsla(25, 35%, 20%, .08) 0, hsla(20, 30%, 15%, .04) 80%, transparent 100%)"
  };

  const currentGradients = theme === "light" ? lightGradients : darkGradients;

  const finalGradientFirst = gradientFirst || currentGradients.first;
  const finalGradientSecond = gradientSecond || currentGradients.second;
  const finalGradientThird = gradientThird || currentGradients.third;
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 1.5,
      }}
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <motion.div
        animate={{
          x: [0, xOffset, 0],
        }}
        transition={{
          duration,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute top-0 left-0 w-screen h-screen z-40 pointer-events-none"
      >
        <div
          style={{
            transform: `translateY(${translateY}px) rotate(-45deg)`,
            background: finalGradientFirst,
            width: `${width}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 left-0`}
        />

        <div
          style={{
            transform: "rotate(-45deg) translate(5%, -50%)",
            background: finalGradientSecond,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 left-0 origin-top-left`}
        />

        <div
          style={{
            transform: "rotate(-45deg) translate(-180%, -70%)",
            background: finalGradientThird,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 left-0 origin-top-left`}
        />
      </motion.div>

      <motion.div
        animate={{
          x: [0, -xOffset, 0],
        }}
        transition={{
          duration,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute top-0 right-0 w-screen h-screen z-40 pointer-events-none"
      >
        <div
          style={{
            transform: `translateY(${translateY}px) rotate(45deg)`,
            background: finalGradientFirst,
            width: `${width}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 right-0`}
        />

        <div
          style={{
            transform: "rotate(45deg) translate(-5%, -50%)",
            background: finalGradientSecond,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 right-0 origin-top-right`}
        />

        <div
          style={{
            transform: "rotate(45deg) translate(180%, -70%)",
            background: finalGradientThird,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 right-0 origin-top-right`}
        />
      </motion.div>
    </motion.div>
  );
};
