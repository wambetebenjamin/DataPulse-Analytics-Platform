import type { Metadata } from "next";
import Link from "next/link";
import LegalShell from "@/components/marketing/LegalShell";
import ManagePreferencesButton from "@/components/chrome/ManagePreferencesButton";
import styles from "@/components/marketing/legal.module.css";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Which cookies DataPulse Analytics sets, what each category does, how long they last, and how to change your preferences at any time.",
  alternates: { canonical: "/legal/cookie-policy" },
};

const TOC = [
  { id: "what", label: "What Cookies Are" },
  { id: "categories", label: "Categories We Use" },
  { id: "necessary", label: "Strictly Necessary" },
  { id: "functional", label: "Functional" },
  { id: "analytics", label: "Analytics" },
  { id: "marketing", label: "Marketing" },
  { id: "managing", label: "Managing Your Choices" },
  { id: "browser", label: "Browser Controls" },
  { id: "changes", label: "Changes" },
];

export default function CookiePolicyPage() {
  return (
    <LegalShell
      title="Cookie Policy"
      lede="Exactly which cookies and similar technologies DataPulse uses, what each one does, and how to change your mind at any time."
      updated="1 September 2026"
      effective="2026-09-01"
      toc={TOC}
    >
      <h2 id="what">What Cookies Are</h2>
      <p>
        Cookies are small text files a site stores on your device. We also use closely related
        technologies — <code>localStorage</code>, <code>sessionStorage</code> and pixel requests —
        and refer to all of them as &ldquo;cookies&rdquo; in this policy.
      </p>
      <p>
        Under the Kenya Data Protection Act 2019, cookies that are not strictly necessary require
        your consent. We therefore set <strong>nothing beyond the strictly necessary</strong> until
        you tell us otherwise through the banner shown on your first visit.
      </p>

      <h2 id="categories">Categories We Use</h2>
      <p>
        Your choices are recorded in your browser under the key{" "}
        <code>datapulse_cookie_consent</code> and respected on every subsequent visit. We do not
        treat continued browsing as consent, and we do not use pre-ticked boxes.
      </p>

      <h2 id="necessary">Strictly Necessary</h2>
      <p>
        Always on. These are required for the site to function and cannot be switched off, because
        without them you could not sign in or stay signed in.
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Purpose</th>
              <th scope="col">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>next-auth.session-token</code>
              </td>
              <td>Keeps you signed in to your dashboard</td>
              <td>30 days</td>
            </tr>
            <tr>
              <td>
                <code>next-auth.csrf-token</code>
              </td>
              <td>Protects sign-in forms against cross-site request forgery</td>
              <td>Session</td>
            </tr>
            <tr>
              <td>
                <code>datapulse_cookie_consent</code>
              </td>
              <td>Remembers the preferences you set here, so we stop asking</td>
              <td>12 months</td>
            </tr>
            <tr>
              <td>
                <code>__Host-rate-limit</code>
              </td>
              <td>Edge rate limiting and abuse prevention</td>
              <td>1 hour</td>
            </tr>
            <tr>
              <td>reCAPTCHA</td>
              <td>
                Google sets cookies to distinguish humans from bots on our forms and sign-in. Loaded
                on form pages only
              </td>
              <td>Up to 6 months</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="functional">Functional</h2>
      <p>
        Optional. These remember choices you have made so the product behaves the way you left it.
        Declining them costs you convenience, not access.
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Purpose</th>
              <th scope="col">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>dp_sidenav</code>
              </td>
              <td>Whether your dashboard sidebar is expanded or collapsed</td>
              <td>12 months</td>
            </tr>
            <tr>
              <td>
                <code>dp_range</code>
              </td>
              <td>Your last selected date range, so dashboards reopen where you left them</td>
              <td>90 days</td>
            </tr>
            <tr>
              <td>
                <code>dp_dismissed</code>
              </td>
              <td>Which product notices and banners you have already closed</td>
              <td>12 months</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="analytics">Analytics</h2>
      <p>
        Optional. Aggregate measurement of how the site and product are used, so we know which
        features earn their place. IP addresses are truncated before storage and we do not attempt
        to identify individuals from this data.
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Purpose</th>
              <th scope="col">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>dp_analytics_id</code>
              </td>
              <td>Anonymous visit identifier used to count unique sessions</td>
              <td>13 months</td>
            </tr>
            <tr>
              <td>
                <code>dp_pageviews</code>
              </td>
              <td>Page and feature usage counts within a session</td>
              <td>Session</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="marketing">Marketing</h2>
      <p>
        Optional, and off unless you turn them on. Used to measure whether a campaign actually
        brought anyone to the site, and to avoid showing you the same message repeatedly.
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Purpose</th>
              <th scope="col">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>dp_src</code>
              </td>
              <td>Records the campaign or referrer that brought you here</td>
              <td>90 days</td>
            </tr>
            <tr>
              <td>
                <code>dp_conv</code>
              </td>
              <td>Attributes a trial signup to its originating campaign</td>
              <td>90 days</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="managing">Managing Your Choices</h2>
      <div className={styles.callout}>
        <p>
          You can change your cookie preferences at any time, for any category except Strictly
          Necessary.
        </p>
        <ManagePreferencesButton />
      </div>
      <p>
        Withdrawing consent stops future processing in that category; it does not undo processing
        that already took place lawfully. Clearing your browser storage also clears your recorded
        preference, in which case the banner will appear again on your next visit.
      </p>

      <h2 id="browser">Browser Controls</h2>
      <p>
        Every major browser lets you block or delete cookies from its settings or privacy menu.
        Blocking strictly necessary cookies will prevent you from signing in to the dashboard. Most
        browsers also offer a &ldquo;Do Not Track&rdquo; signal; where we receive one we treat it
        as a refusal of Analytics and Marketing cookies.
      </p>

      <h2 id="changes">Changes</h2>
      <p>
        If we add or remove a cookie we will update this page and, where the change is material,
        ask for your consent again. See our{" "}
        <Link href="/legal/privacy-policy">Privacy Policy</Link> for how the resulting data is
        handled, or write to <a href={`mailto:${SITE.dpoEmail}`}>{SITE.dpoEmail}</a> with any
        question.
      </p>
    </LegalShell>
  );
}
