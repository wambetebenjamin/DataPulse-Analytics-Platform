"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/data/site";
import { useScrolled } from "@/lib/hooks";
import Logo from "./Logo";
import styles from "./navbar.module.css";

/**
 * Sticky marketing navbar.
 *
 * Scroll treatment reproduces DefaultNavbar from the design source zip:
 *   backgroundColor: rgba(white, 0.8)
 *   backdropFilter: saturate(200%) blur(30px)
 *   boxShadow: shadow "md"
 * (zip: src/examples/Navbars/DefaultNavbar/index.js lines 81–92)
 */
export default function Navbar() {
  const scrolled = useScrolled(24);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={styles.header} data-scrolled={scrolled}>
      <nav className={styles.nav} aria-label="Primary">
        <Link href="/" className={styles.brand} aria-label="DataPulse Analytics home">
          <Logo />
        </Link>

        <ul className={styles.links}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={styles.link}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <Link href="/login" className={styles.loginBtn}>
            Log In
          </Link>
          <Link href="/app/dashboard" className={styles.ctaBtn}>
            Try the Dashboard
          </Link>
        </div>

        <button
          type="button"
          className={styles.burger}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <div className={styles.drawer} data-open={open}>
        <ul className={styles.drawerLinks}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.drawerLink}>
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/demo" className={styles.drawerLink}>
              Live Demo
            </Link>
          </li>
          <li>
            <Link href="/custom" className={styles.drawerLink}>
              Custom Project
            </Link>
          </li>
          <li>
            <Link href="/contact" className={styles.drawerLink}>
              Contact
            </Link>
          </li>
        </ul>
        <div className={styles.drawerActions}>
          <Link href="/login" className={styles.loginBtn}>
            Log In
          </Link>
          <Link href="/app/dashboard" className={styles.ctaBtn}>
            Try the Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
