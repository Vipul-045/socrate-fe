"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/site/primitives";
import { NAV_LINKS } from "@/lib/content";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on route change and lock the body while the panel is open.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    // The panel is `lg:hidden`, so growing past lg would hide it while the
    // scroll lock stayed on. Close it instead.
    const lg = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = () => lg.matches && setOpen(false);
    onBreakpoint();

    window.addEventListener("keydown", onKey);
    lg.addEventListener("change", onBreakpoint);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      lg.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300 ease-calm",
        scrolled || open
          ? "border-line bg-paper/95 backdrop-blur-md supports-[backdrop-filter]:bg-paper/85"
          : "border-transparent bg-paper",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-6 lg:h-[4.5rem]">
        <Link
          href="/"
          className="-my-1 inline-block py-1 text-[1.1875rem] font-bold tracking-[-0.02em] text-ink"
          aria-label="Socrate — home"
        >
          Socrate
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="-my-2 flex items-center gap-8 xl:gap-9">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className={cn(
                    "relative inline-block py-2 text-small transition-colors duration-200",
                    isActive(pathname, link.href)
                      ? "text-ink after:absolute after:bottom-1 after:left-0 after:h-px after:w-full after:bg-ink"
                      : "text-ink-soft hover:text-ink",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {session ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => authClient.signOut()}
              >
                Log out
              </Button>
              <Button size="sm" asChild>
                <Link href="/pricing">Hey {firstName ?? "there"}</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button size="sm" className="px-6" asChild>
                <Link href="/login">Get Started Free</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Button size="sm" className="hidden px-5 sm:inline-flex" asChild>
            <Link href="/login">Get Started Free</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="-mr-2 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-ink transition-colors hover:bg-surface"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {/* Mobile panel: full-height sheet, list-shaped rather than a
          shrunken version of the desktop row. */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-line bg-paper lg:hidden"
      >
        <Container className="flex min-h-full flex-col py-8">
          <nav aria-label="Mobile">
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.label} className="border-b border-line">
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-5 text-[1.375rem] font-medium tracking-[-0.02em] text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto flex flex-col gap-3 pt-10">
            {session ? (
              <>
                <Button size="lg" className="w-full" asChild>
                  <Link href="/pricing">Hey {firstName ?? "there"}</Link>
                </Button>
                <Button
                  size="lg"
                  className="w-full"
                  variant="outline"
                  onClick={() => authClient.signOut()}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" className="w-full" asChild>
                  <Link href="/login">Get Started Free</Link>
                </Button>
                <Button size="lg" className="w-full" variant="outline" asChild>
                  <Link href="/login">Log In</Link>
                </Button>
              </>
            )}
          </div>
        </Container>
      </div>
    </header>
  );
}
