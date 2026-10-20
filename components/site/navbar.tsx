"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { useMotionValueEvent, useScroll } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/site/primitives";
import { NAV_LINKS } from "@/lib/content";
import { useUser } from "@/components/provider/authoprovider";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  // Same backend session the pricing and checkout pages read, so the nav
  // and the plan buttons always agree on who's signed in.
  const { userInfo, isLoading, logout } = useUser();

  // At the top the bar melts into the page; once content passes under it,
  // it frosts over and picks up its rule. The state only flips when the
  // threshold is crossed, so scrolling doesn't re-render the nav.
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));
  useEffect(() => setScrolled(scrollY.get() > 8), [scrollY]);

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

  const firstName = userInfo?.name?.split(" ")[0];

  // logout() clears the user and membership even if the backend call fails;
  // LogOutUser has already logged the error.
  const handleLogout = async () => {
    setOpen(false);
    try {
      await logout();
    } catch {}
  };

  return (
    <>
      {/* The rule is always 1px wide — only its colour changes — so the
          mobile panel's offset below stays exact. */}
      <header
        className={cn(
          "sticky top-0 z-50 border-b pt-[env(safe-area-inset-top)] transition-[background-color,border-color,box-shadow] duration-200 ease-calm",
          open
            ? "border-line bg-paper"
            : scrolled
              ? "border-line bg-paper/95 shadow-[0_8px_24px_-20px_rgba(26,24,21,0.2)] supports-[backdrop-filter]:bg-paper/[0.82] supports-[backdrop-filter]:backdrop-blur-[18px]"
              : "border-transparent bg-paper",
        )}
      >
        <Container className="flex h-16 items-center gap-3 sm:gap-6 lg:h-[68px]">
          <Link
            href="/"
            className="mr-auto inline-flex h-11 items-center text-[1.0625rem] font-semibold tracking-[-0.02em] text-ink"
            aria-label="Socrate — home"
          >
            Socrate
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="-my-2 flex items-center gap-[clamp(1.125rem,2.4vw,2.125rem)]">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    aria-current={isActive(pathname, link.href) ? "page" : undefined}
                    className={cn(
                      "relative inline-block py-2 text-small transition-colors duration-200",
                      isActive(pathname, link.href)
                        ? "text-ink after:absolute after:-bottom-px after:left-0 after:h-px after:w-full after:bg-ink"
                        : "text-ink-soft hover:text-ink",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Hidden, not removed, while the session check is in flight so the
              row doesn't flash "Log In" at a signed-in reader. */}
          <div
            className={cn(
              "hidden items-center gap-1.5 pl-[clamp(0.375rem,1.6vw,1.25rem)] lg:flex",
              isLoading && "invisible",
            )}
          >
            {userInfo ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
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

          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
            {/* The primary action stays one tap away on phones; the full
                label returns once there's room for it. */}
            {!userInfo ? (
              <Button
                size="sm"
                className={cn(
                  // 40px to sit quietly in the bar; the ::after pads the
                  // tap area out to 44.
                  "relative h-10 rounded-lg px-4 transition-opacity duration-200 after:absolute after:-inset-y-0.5 after:inset-x-0 after:content-[''] sm:px-5",
                  isLoading && "invisible",
                  // The open sheet carries the same action at full size.
                  open && "pointer-events-none opacity-0",
                )}
                tabIndex={open ? -1 : undefined}
                asChild
              >
                <Link href="/login">
                  <span className="sm:hidden">Get started</span>
                  <span className="hidden sm:inline">Get Started Free</span>
                </Link>
              </Button>
            ) : null}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="-mr-3 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-ink transition-colors hover:bg-surface"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile panel: a full-height sheet under the header, list-shaped
          rather than a shrunken version of the desktop row. It lives outside
          <header> on purpose — the header's backdrop-filter would otherwise
          become the containing block for `position: fixed` and collapse the
          panel to the header's own height. While closed it's `invisible`,
          which also takes it out of the tab order and the a11y tree. */}
      <div
        id="mobile-nav"
        className={cn(
          "fixed inset-x-0 bottom-0 top-[calc(4rem_+_1px_+_env(safe-area-inset-top))] z-40 overflow-y-auto overscroll-contain bg-paper transition-[opacity,transform,visibility] duration-200 ease-calm lg:hidden",
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0",
        )}
      >
        <Container className="flex min-h-full flex-col pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3">
          <nav aria-label="Mobile">
            <ul>
              {NAV_LINKS.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.label} className="border-b border-line">
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className="group flex min-h-[3.75rem] items-center justify-between gap-4 text-[1.375rem] font-medium tracking-[-0.02em] text-ink"
                    >
                      {link.label}
                      <ArrowRight
                        aria-hidden
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform duration-200 ease-calm group-hover:translate-x-0.5",
                          active ? "text-ink" : "text-ink-faint",
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto flex flex-col gap-2.5 pt-10 sm:flex-row-reverse sm:[&>*]:flex-1">
            {userInfo ? (
              <>
                <Button size="lg" className="h-12 w-full rounded-lg text-[15px]" asChild>
                  <Link href="/pricing">Hey {firstName ?? "there"}</Link>
                </Button>
                <Button
                  size="lg"
                  className="h-12 w-full rounded-lg text-[15px]"
                  variant="outline"
                  onClick={handleLogout}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" className="h-12 w-full rounded-lg text-[15px]" asChild>
                  <Link href="/login">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  className="h-12 w-full rounded-lg text-[15px]"
                  variant="outline"
                  asChild
                >
                  <Link href="/login">Log In</Link>
                </Button>
              </>
            )}
          </div>
        </Container>
      </div>
    </>
  );
}
