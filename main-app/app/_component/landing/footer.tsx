import Link from "next/link";
import Logo from "@/components/logo";
import { navItems } from "./constants";

export function Footer() {
  return (
    <footer className="border-t px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between 2xl:max-w-[88rem]">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <Logo showWordmark className="border border-border" />
        </Link>
        <div className="flex flex-wrap gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
