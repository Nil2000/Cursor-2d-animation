"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
          <Link href="/chat">
            <Button className="group">
              Start Creating
              <ArrowRightIcon
                className="-me-1 opacity-60 transition-transform group-hover:translate-x-0.5"
                size={16}
                aria-hidden="true"
              />
            </Button>
          </Link>
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
              <Image
                className="h-8 w-8 rounded-full object-cover object-top"
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXZhdGFyc3xlbnwwfHwwfHx8MA%3D%3D"
                width={100}
                height={100}
                alt="Avatar 01"
              />
              <Image
                className="h-8 w-8 rounded-full object-cover object-top"
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXZhdGFyc3xlbnwwfHwwfHx8MA%3D%3D"
                width={100}
                height={100}
                alt="Avatar 02"
              />
              <Image
                className="h-8 w-8 rounded-full object-cover object-top"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGF2YXRhcnN8ZW58MHx8MHx8fDA%3D"
                width={100}
                height={100}
                alt="Avatar 03"
              />
              <Image
                className="h-8 w-8 rounded-full object-cover object-top"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGF2YXRhcnN8ZW58MHx8MHx8fDA%3D"
                width={100}
                height={100}
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
            customizable pages that boost your product&apos;s credibility.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <Link href="/login">
              <Button className="flex justify-center cursor-pointer">
                Get Started
                <ArrowRightIcon />
              </Button>
            </Link>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
