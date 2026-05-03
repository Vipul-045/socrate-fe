import { Flame } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className=" border-t border-border py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex gap-2">
            <span className="font-bold text-lg">Socrate</span>
            <span className="text-md text-muted-foreground ml-2">
              learning made easy
            </span>
          </div>
          <div className="flex flex-col items-center gap-3 text-md text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms & Conditions
            </Link>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Twitter/X
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              GitHub
            </a>
          </div>
        </div>
        <div className="text-center mt-8 text-xs text-muted-foreground">
          © 2026 Socrate. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
