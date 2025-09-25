"use client";
import React from "react";
import { motion } from "framer-motion";
import TextInputContainer from "@/app/_component/text-input-container";

export default function HeroSection({
  authenticated,
  name,
}: {
  authenticated: boolean;
  name?: string;
}) {
  return (
    <motion.div
      className="flex items-center justify-center flex-col h-screen space-y-6 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {authenticated ? (
        // Authenticated User Content
        <>
          {/* Welcome Badge */}
          <motion.div
            className="bg-primary/10 flex items-center rounded-full border border-primary/20 p-3 shadow-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary text-lg">👋</span>
              </div>
              <p className="text-primary font-medium text-sm">
                Welcome back{name ? `, ${name}` : ""}!
              </p>
            </div>
          </motion.div>

          {/* Welcome Message */}
          <motion.h1
            className="sm:text-5xl text-3xl font-bold font-dm_serif mt-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease: [0.2, 0.8, 0.2, 1],
            }}
          >
            Ready to Create Amazing <span className="text-primary">✨</span>
            <br /> 2D Animations?
          </motion.h1>
          {/* Welcome Description */}
          <motion.p
            className="sm:text-lg text-center text-base text-black/70 dark:text-white/70 max-w-2xl px-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.4,
              ease: [0.2, 0.8, 0.2, 1],
            }}
          >
            Start typing your ideas below and watch them come to life with
            smooth,
            <br />
            professional 2D animations powered by AI.
          </motion.p>
          <TextInputContainer />
        </>
      ) : (
        // Non-authenticated User Content (Original Setup)
        <>
          {/* Top Badge */}
          <motion.div
            className="bg-background flex items-center rounded-full border p-1 shadow-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex -space-x-1.5">
              <img
                className="ring-background rounded-full ring-1"
                src="https://originui.com/avatar-80-03.jpg"
                width={20}
                height={20}
                alt="Avatar 01"
              />
              <img
                className="ring-background rounded-full ring-1"
                src="https://originui.com/avatar-80-04.jpg"
                width={20}
                height={20}
                alt="Avatar 02"
              />
              <img
                className="ring-background rounded-full ring-1"
                src="https://originui.com/avatar-80-05.jpg"
                width={20}
                height={20}
                alt="Avatar 03"
              />
              <img
                className="ring-background rounded-full ring-1"
                src="https://originui.com/avatar-80-06.jpg"
                width={20}
                height={20}
                alt="Avatar 04"
              />
            </div>
            <p className="text-muted-foreground px-2 text-xs">
              Trusted by{" "}
              <strong className="text-foreground font-medium">60K+</strong>{" "}
              users.
            </p>
          </motion.div>

          {/* Primary text */}
          <motion.h1
            className="sm:text-5xl text-3xl font-bold font-dm_serif mt-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease: [0.2, 0.8, 0.2, 1],
            }}
          >
            Turn Customer Love <span className="text-primary">💖</span>
            <br /> into Trust-Driving Testimonials{" "}
            <span className="text-primary">⭐</span>
          </motion.h1>

          {/* Secondary text */}
          <motion.p
            className="sm:text-lg text-center text-base text-black/70 dark:text-white/70 max-w-2xl px-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.4,
              ease: [0.2, 0.8, 0.2, 1],
            }}
          >
            Effortlessly collect, manage, and showcase testimonials with
            beautiful,
            <br />
            customizable pages that boost your product's credibility.
          </motion.p>
        </>
      )}
    </motion.div>
  );
}
