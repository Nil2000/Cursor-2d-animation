import Link from "next/link";
import { ArrowRightIcon, MenuIcon } from "lucide-react";
import Logo from "@/components/logo";
import ThemeButton from "@/components/theme-button";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { navItems } from "./constants";

type LandingNavbarProps = {
  authenticated: boolean;
  primaryHref: string;
};

export function LandingNavbar({
  authenticated,
  primaryHref,
}: LandingNavbarProps) {
  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-5 sm:px-6">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between rounded-2xl border bg-background/80 px-3 shadow-sm backdrop-blur-xl 2xl:max-w-[88rem]">
        <Link
          href="/"
          aria-label="Manim AI home"
          className="flex items-center gap-2 rounded-xl transition-opacity hover:opacity-90"
        >
          <Logo
            showWordmark
            className="border border-border"
            wordmarkClassName="text-lg"
          />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeButton />
          {!authenticated && (
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}
          <Button asChild className="group rounded-xl">
            <Link href={primaryHref}>
              {authenticated ? "Open studio" : "Get started"}
              <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeButton />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[min(86vw,24rem)] p-0">
              <SheetHeader className="border-b p-5 text-left">
                <SheetTitle>Manim AI</SheetTitle>
                <SheetDescription>
                  Build polished 2D animations from a clear prompt.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-2 p-5">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="rounded-xl px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
              <SheetFooter className="border-t p-5">
                {!authenticated && (
                  <SheetClose asChild>
                    <Link
                      href="/login"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "h-11 w-full rounded-xl",
                      )}
                    >
                      Sign in
                    </Link>
                  </SheetClose>
                )}
                <SheetClose asChild>
                  <Link
                    href={primaryHref}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "h-11 w-full rounded-xl",
                    )}
                  >
                    {authenticated ? "Open studio" : "Start creating"}
                  </Link>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
