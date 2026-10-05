import Link from "next/link";
import { Facebook, Linkedin, Mail, MapPin, MessageCircle, Phone, Twitter } from "lucide-react";
import { SITE, WHATSAPP_LINK } from "@/data/site";
import NewsletterForm from "@/components/forms/NewsletterForm";
import Logo from "./Logo";
import styles from "./footer.module.css";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Live Demo", href: "/demo" },
      { label: "Pricing", href: "/pricing" },
      { label: "Use Cases", href: "/use-cases" },
      { label: "Custom Projects", href: "/custom" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog & Insights", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Book a Demo", href: "/contact?intent=demo" },
      { label: "Service Status", href: SITE.statusUrl },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/legal/privacy-policy" },
      { label: "Terms & Conditions", href: "/legal/terms" },
      { label: "Cookie Policy", href: "/legal/cookie-policy" },
      { label: "Data Protection Act 2019", href: "/legal/privacy-policy#your-rights" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <Logo light />
            <p className={styles.blurb}>
              Business intelligence built in Nairobi for East African SMEs, corporates, NGOs,
              schools and government agencies. Your data, finally making sense.
            </p>

            <ul className={styles.contact}>
              <li>
                <MapPin size={15} aria-hidden="true" />
                <span>{SITE.address}</span>
              </li>
              <li>
                <Mail size={15} aria-hidden="true" />
                <a href={`mailto:${SITE.email}`} className={styles.contactLink}>
                  {SITE.email}
                </a>
              </li>
              <li>
                <Phone size={15} aria-hidden="true" />
                <a href={`tel:+${SITE.phone}`} className={styles.contactLink}>
                  {SITE.phoneDisplay}
                </a>
              </li>
            </ul>

            <div className={styles.socials}>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with DataPulse on WhatsApp"
                className={styles.social}
              >
                <MessageCircle size={16} />
              </a>
              <a
                href="https://www.linkedin.com/company/datapulse-analytics"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DataPulse on LinkedIn"
                className={styles.social}
              >
                <Linkedin size={16} />
              </a>
              <a
                href="https://twitter.com/datapulse_ke"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DataPulse on X"
                className={styles.social}
              >
                <Twitter size={16} />
              </a>
              <a
                href="https://facebook.com/datapulseke"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DataPulse on Facebook"
                className={styles.social}
              >
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} className={styles.col} aria-label={col.title}>
              <h2 className={styles.colTitle}>{col.title}</h2>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        className={styles.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className={styles.link}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className={styles.newsletterCol}>
            <h2 className={styles.colTitle}>Newsletter</h2>
            <p className={styles.newsletterCopy}>
              Monthly data insights for East African businesses. One email, no noise.
            </p>
            <NewsletterForm variant="footer" />
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {year} {SITE.legalName}. All rights reserved. Registered in Nairobi, Kenya.
          </p>
          <p className={styles.meta}>
            Website 25 of the 100 Website Challenge — the first analytics dashboard build.
          </p>
        </div>
      </div>
    </footer>
  );
}
