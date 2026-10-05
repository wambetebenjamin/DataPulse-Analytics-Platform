import type { Metadata } from "next";
import Link from "next/link";
import LegalShell from "@/components/marketing/LegalShell";
import styles from "@/components/marketing/legal.module.css";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms governing use of the DataPulse Analytics platform: subscriptions, data ownership, acceptable use, payment and refunds, service levels and governing law.",
  alternates: { canonical: "/legal/terms" },
};

const TOC = [
  { id: "agreement", label: "The Agreement" },
  { id: "saas-usage", label: "SaaS Usage" },
  { id: "accounts", label: "Accounts & Roles" },
  { id: "subscription", label: "Subscription Terms" },
  { id: "data-ownership", label: "Data Ownership" },
  { id: "acceptable-use", label: "Acceptable Use" },
  { id: "payment", label: "Payment & Refunds" },
  { id: "sla", label: "Service Level" },
  { id: "estimates", label: "Forecasts & Estimates" },
  { id: "ip", label: "Intellectual Property" },
  { id: "liability", label: "Liability" },
  { id: "termination", label: "Termination" },
  { id: "governing-law", label: "Governing Law" },
];

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      lede={`The contract between you and ${SITE.legalName} for use of the DataPulse Analytics platform.`}
      updated="1 September 2026"
      effective="2026-09-01"
      toc={TOC}
    >
      <h2 id="agreement">The Agreement</h2>
      <p>
        These Terms of Service form a binding agreement between {SITE.legalName}, a company
        incorporated in Kenya with its registered office at {SITE.address}
        (&ldquo;DataPulse&rdquo;, &ldquo;we&rdquo;), and the person or organisation subscribing to
        the platform (&ldquo;Customer&rdquo;, &ldquo;you&rdquo;). By creating an account, starting
        a free trial, or using the service you accept these terms. If you accept on behalf of an
        organisation, you confirm you have authority to bind it.
      </p>
      <p>
        These terms incorporate our <Link href="/legal/privacy-policy">Privacy Policy</Link> and{" "}
        <Link href="/legal/cookie-policy">Cookie Policy</Link>.
      </p>

      <h2 id="saas-usage">SaaS Usage</h2>
      <p>
        DataPulse is provided as a hosted, subscription software service. We grant you a
        non-exclusive, non-transferable, revocable right to access and use the platform for your
        internal business purposes for the duration of a paid subscription or active trial.
      </p>
      <ul>
        <li>
          The service is delivered over the internet. You are responsible for your own
          connectivity, devices and browser.
        </li>
        <li>
          We may improve, modify or discontinue individual features. Where a change materially
          reduces functionality you rely on, we will give at least 30 days&rsquo; notice.
        </li>
        <li>
          Access is per named user. Credentials must not be shared between individuals; add a seat
          instead.
        </li>
        <li>
          You may not resell, sublicense, white-label or provide the platform as a service to third
          parties without a written reseller agreement with us.
        </li>
        <li>
          You may not reverse engineer, decompile, scrape, or attempt to derive the source code or
          underlying models of the platform.
        </li>
      </ul>

      <h2 id="accounts">Accounts &amp; Roles</h2>
      <p>
        Workspaces use four roles — <strong>Owner</strong>, <strong>Manager</strong>,{" "}
        <strong>Analyst</strong> and <strong>Viewer</strong> — each with defined permissions. The
        Owner is responsible for who is invited, what role they hold, and removing access promptly
        when someone leaves. You must keep credentials confidential and notify us immediately at{" "}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> if you suspect unauthorised
        access. You are responsible for activity under your account except to the extent it results
        from our breach of these terms.
      </p>

      <h2 id="subscription">Subscription Terms</h2>
      <ul>
        <li>
          <strong>Free trial.</strong> New workspaces may use the platform free for 14 days. No
          payment method is required to start. At the end of the trial the workspace becomes
          read-only unless a plan is selected.
        </li>
        <li>
          <strong>Plans.</strong> Starter at KES 2,999 per month and Business at KES 7,999 per
          month, each billed in Kenyan Shillings. Enterprise is quoted individually.
        </li>
        <li>
          <strong>Annual billing.</strong> Paying annually costs ten months&rsquo; fees for twelve
          months of service.
        </li>
        <li>
          <strong>Renewal.</strong> Subscriptions renew automatically at the end of each term
          unless cancelled before the renewal date.
        </li>
        <li>
          <strong>Upgrades</strong> take effect immediately and are charged pro rata.{" "}
          <strong>Downgrades</strong> take effect at the next renewal.
        </li>
        <li>
          <strong>Price changes</strong> will be notified at least 30 days before they apply to
          your account, and never mid-term.
        </li>
      </ul>

      <h2 id="data-ownership">Data Ownership</h2>
      <div className={styles.callout}>
        <p>
          <strong>You own your data.</strong> All data you upload, connect or generate through the
          platform (&ldquo;Customer Data&rdquo;) remains your exclusive property. Nothing in these
          terms transfers any ownership or intellectual property in Customer Data to DataPulse.
        </p>
      </div>
      <ul>
        <li>
          You grant us only the limited licence necessary to host, process, compute and display
          Customer Data in order to provide the service to you, and to create backups.
        </li>
        <li>
          We will not sell Customer Data, disclose it to third parties except as set out in the
          Privacy Policy, or use it to train models made available to other customers.
        </li>
        <li>
          Any statistics we publish about the platform are derived from irreversibly anonymised,
          aggregated data and never identify a customer or an individual.
        </li>
        <li>
          You may export Customer Data at any time in CSV or PDF form. On termination, you have 30
          days to export, after which we delete it in accordance with the retention schedule in the
          Privacy Policy.
        </li>
        <li>
          You warrant that you have the right to upload the Customer Data and that doing so does
          not breach any law or third-party right.
        </li>
      </ul>

      <h2 id="acceptable-use">Acceptable Use</h2>
      <p>You must not use DataPulse to:</p>
      <ol>
        <li>Break any law of Kenya or of any jurisdiction in which you operate.</li>
        <li>
          Upload personal data without a lawful basis, or in breach of the Data Protection Act
          2019.
        </li>
        <li>
          Upload malicious code, or attempt to probe, scan, overload or disrupt the platform or its
          infrastructure.
        </li>
        <li>
          Circumvent authentication, rate limits, usage quotas or role-based access controls.
        </li>
        <li>Infringe intellectual property or misappropriate confidential information.</li>
        <li>
          Send unsolicited bulk messaging through our WhatsApp or email delivery features, or use
          them in breach of the applicable provider&rsquo;s policies.
        </li>
        <li>
          Build a competing product using benchmarking information obtained from the platform.
        </li>
      </ol>
      <p>
        We may suspend access without notice where use poses a security risk, threatens platform
        stability, or is plainly unlawful. We will tell you why and restore access once resolved.
      </p>

      <h2 id="payment">Payment &amp; Refunds</h2>
      <ul>
        <li>
          Fees are payable in advance by M-Pesa or card. All amounts are in Kenyan Shillings and
          are exclusive of VAT and any other applicable tax, which will be added where required.
        </li>
        <li>
          Invoices are issued on payment and available for download from Settings at any time.
        </li>
        <li>
          <strong>Refunds.</strong> Monthly subscriptions may be cancelled at any time; service
          continues to the end of the paid month and no partial refund is given for the unused
          part. Annual subscriptions may be refunded pro rata for complete unused months if
          cancelled within the first 60 days.
        </li>
        <li>
          <strong>Failed payment.</strong> If a renewal payment fails we will retry and notify you.
          After 14 days the workspace becomes read-only; after 60 days it may be closed and the
          data deleted in line with the retention schedule.
        </li>
        <li>
          Custom analytics engagements are quoted and invoiced separately, on the terms set out in
          the relevant statement of work.
        </li>
      </ul>

      <h2 id="sla">Service Level</h2>
      <p>
        We target <strong>99.9% monthly availability</strong> of the dashboard application,
        measured excluding scheduled maintenance and events outside our reasonable control.
      </p>
      <ul>
        <li>
          <strong>Scheduled maintenance</strong> is announced at least 48 hours in advance and is
          normally performed between 23:00 and 04:00 East Africa Time.
        </li>
        <li>
          <strong>Support response targets:</strong> Starter — two business days by email; Business
          — one business day by email and WhatsApp; Enterprise — four business hours with a named
          contact.
        </li>
        <li>
          <strong>Service credits.</strong> If monthly availability falls below 99.9% we will on
          request credit 10% of that month&rsquo;s fee, rising to 25% below 99.0% and 50% below
          95.0%. Credits are the sole remedy for availability failures and must be claimed within
          30 days.
        </li>
        <li>
          Availability of third-party integrations (M-Pesa Daraja, Google Sheets, WhatsApp Cloud
          API, e-commerce platforms) is outside our control and is excluded from this commitment.
        </li>
        <li>
          Current status is published at{" "}
          <a href={SITE.statusUrl} rel="noopener noreferrer" target="_blank">
            {SITE.statusUrl.replace("https://", "")}
          </a>
          .
        </li>
      </ul>

      <h2 id="estimates">Forecasts &amp; Estimates</h2>
      <p>
        The platform produces forecasts, projections, churn-risk scores, stock-out predictions and
        similar derived figures using statistical methods applied to your historical data. These
        are <strong>estimates</strong>, are labelled as such throughout the product, and are
        presented with confidence bands where applicable. They are provided for guidance only, do
        not constitute financial, investment, legal or professional advice, and must not be relied
        upon as a guarantee of future outcomes. You remain solely responsible for decisions you
        take.
      </p>

      <h2 id="ip">Intellectual Property</h2>
      <p>
        The platform, its software, design, documentation, models and brand remain the exclusive
        property of {SITE.legalName} and its licensors. Feedback you give us may be used to improve
        the product without obligation or compensation, but we will not identify you as its source
        without consent.
      </p>

      <h2 id="liability">Liability</h2>
      <p>
        Nothing in these terms excludes liability for death or personal injury caused by
        negligence, for fraud, or for any liability that cannot lawfully be excluded under Kenyan
        law.
      </p>
      <p>
        Subject to that, the service is provided on an &ldquo;as is&rdquo; basis; we do not warrant
        that it will be uninterrupted or error-free. Neither party is liable for indirect or
        consequential loss, loss of profit, loss of anticipated savings, or loss of goodwill. Our
        total aggregate liability arising out of or in connection with this agreement in any twelve
        month period is limited to the fees you paid us in that period.
      </p>

      <h2 id="termination">Termination</h2>
      <p>
        You may cancel at any time from Settings, effective at the end of the current paid term. We
        may terminate for material breach that is not remedied within 14 days of written notice, or
        immediately for the serious misuse described under Acceptable Use. On termination your
        right to use the platform ends, you may export your data for 30 days, and accrued fees
        remain payable.
      </p>

      <h2 id="governing-law">Governing Law</h2>
      <p>
        This agreement is governed by and construed in accordance with the{" "}
        <strong>laws of the Republic of Kenya</strong>. The parties submit to the exclusive
        jurisdiction of the courts of Kenya sitting at Nairobi.
      </p>
      <p>
        Before commencing proceedings the parties will attempt in good faith to resolve any dispute
        through discussion between senior representatives for 30 days, and may agree to refer the
        matter to mediation under the rules of the Nairobi Centre for International Arbitration.
      </p>
      <p>
        If any provision is held unenforceable, the remainder continues in force. Our failure to
        enforce a provision is not a waiver of it. These terms, together with any order form or
        statement of work, are the entire agreement between the parties.
      </p>
    </LegalShell>
  );
}
