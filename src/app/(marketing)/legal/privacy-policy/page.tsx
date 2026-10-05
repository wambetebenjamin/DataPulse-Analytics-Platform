import type { Metadata } from "next";
import Link from "next/link";
import LegalShell from "@/components/marketing/LegalShell";
import styles from "@/components/marketing/legal.module.css";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How DataPulse Analytics collects, uses, stores and protects personal and business data, in line with the Kenya Data Protection Act 2019.",
  alternates: { canonical: "/legal/privacy-policy" },
  robots: { index: true, follow: true },
};

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "dashboard-data", label: "Dashboard Data" },
  { id: "business-data", label: "Business Data You Upload" },
  { id: "analytics-partners", label: "Analytics Partners" },
  { id: "legal-basis", label: "Lawful Basis" },
  { id: "retention", label: "Data Retention" },
  { id: "security", label: "Security" },
  { id: "your-rights", label: "Your Rights" },
  { id: "transfers", label: "International Transfers" },
  { id: "children", label: "Children's Data" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "controller", label: "Data Controller" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      lede={`How ${SITE.legalName} collects, uses and protects your personal information and the business data you entrust to the platform.`}
      updated="1 September 2026"
      effective="2026-09-01"
      toc={TOC}
    >
      <h2 id="overview">Overview</h2>
      <p>
        {SITE.legalName} (&ldquo;DataPulse&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) provides a
        business intelligence platform that turns your operational data into dashboards, reports
        and forecasts. This policy explains what we collect, why, how long we keep it, and the
        rights you have over it.
      </p>
      <p>
        It is written to meet our obligations under the{" "}
        <strong>Kenya Data Protection Act, 2019</strong> and the regulations made under it. Where
        we act as a data controller we decide why and how data is processed. Where we handle data
        on behalf of a customer, we act as a data processor and follow that customer&rsquo;s
        documented instructions.
      </p>

      <div className={styles.callout}>
        <p>
          <strong>The short version.</strong> We collect the minimum we need to run your account
          and your dashboards. We never sell your data. The business data you upload belongs to
          you, and you can export or delete it at any time.
        </p>
      </div>

      <h2 id="dashboard-data">Dashboard Data</h2>
      <p>
        To create and operate your DataPulse account we process the following categories of
        personal data about you and your team members:
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Examples</th>
              <th scope="col">Why we process it</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Account identity</td>
              <td>Name, work email, password hash, role (Owner, Manager, Analyst, Viewer)</td>
              <td>Authentication, access control, audit of who changed what</td>
            </tr>
            <tr>
              <td>Organisation profile</td>
              <td>Business name, industry, county, phone number, logo</td>
              <td>Configuring the workspace and branding your reports</td>
            </tr>
            <tr>
              <td>Billing</td>
              <td>Plan, billing cycle, M-Pesa or card payment references, invoices</td>
              <td>Taking payment and meeting tax and accounting obligations</td>
            </tr>
            <tr>
              <td>Usage and device</td>
              <td>Pages viewed, features used, IP address, browser and device type, timestamps</td>
              <td>Security monitoring, rate limiting, diagnosing faults, improving the product</td>
            </tr>
            <tr>
              <td>Communications</td>
              <td>Support messages, demo requests, enquiry forms, WhatsApp conversations</td>
              <td>Answering you and keeping a record of what was agreed</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="business-data">Business Data You Upload</h2>
      <p>
        This is the operational data you connect or upload: transactions, products, stock levels,
        customer records, staff records, donor and grant records, bookings, attendance and similar
        material from your own systems.
      </p>
      <ul>
        <li>
          <strong>You own it.</strong> Uploading data to DataPulse does not transfer any ownership
          or intellectual property in it to us.
        </li>
        <li>
          <strong>We process it only to provide the service.</strong> That means computing your
          metrics, rendering your dashboards, generating your reports and running the forecasting
          models you have enabled.
        </li>
        <li>
          <strong>We do not sell it, rent it, or use it to train models for other customers.</strong>{" "}
          Any aggregate benchmarking we publish is derived from fully anonymised, irreversibly
          aggregated statistics across many organisations, and never identifies a customer.
        </li>
        <li>
          <strong>Access is restricted.</strong> Our staff access customer data only where needed
          to provide support you have requested, to investigate a security incident, or where the
          law requires it. Such access is logged.
        </li>
        <li>
          <strong>You can export it.</strong> CSV and PDF export is available on every plan, at any
          time, without asking us.
        </li>
      </ul>
      <p>
        Where your uploaded data contains personal data about <em>your</em> customers, staff or
        beneficiaries, <strong>you are the data controller</strong> and we are your processor. You
        are responsible for having a lawful basis to collect that data and for giving those people
        the notices they are entitled to. We will process it only on your instructions, and will
        return or delete it when our agreement ends.
      </p>

      <h2 id="analytics-partners">Analytics Partners</h2>
      <p>
        We use a small number of third-party processors to run the service. Each is bound by a
        written agreement limiting use of data to providing their service to us.
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Partner</th>
              <th scope="col">Purpose</th>
              <th scope="col">Data involved</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Vercel</td>
              <td>Application hosting, edge delivery, platform logs</td>
              <td>Request metadata, IP address, account and business data in transit</td>
            </tr>
            <tr>
              <td>Google (reCAPTCHA)</td>
              <td>Bot and abuse protection on forms and sign-in</td>
              <td>IP address, browser signals, interaction score</td>
            </tr>
            <tr>
              <td>Google (Sheets API)</td>
              <td>Optional integration you explicitly authorise</td>
              <td>Only the spreadsheets you connect</td>
            </tr>
            <tr>
              <td>Safaricom (M-Pesa Daraja)</td>
              <td>Optional transaction integration and subscription payment</td>
              <td>Transaction records for your own till or paybill</td>
            </tr>
            <tr>
              <td>Meta (WhatsApp Cloud API)</td>
              <td>Delivering scheduled reports and alerts you have configured</td>
              <td>Recipient phone number and message content</td>
            </tr>
            <tr>
              <td>Email delivery provider</td>
              <td>Transactional email: sign-in, alerts, scheduled reports</td>
              <td>Recipient address and message content</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Product analytics within DataPulse itself are privacy-preserving and are only loaded where
        you have accepted the Analytics category in our{" "}
        <Link href="/legal/cookie-policy">Cookie Policy</Link>.
      </p>

      <h2 id="legal-basis">Lawful Basis</h2>
      <ul>
        <li>
          <strong>Performance of a contract</strong> — operating your account, processing your
          data, taking payment.
        </li>
        <li>
          <strong>Legitimate interests</strong> — securing the platform, preventing abuse,
          improving the product, and contacting existing customers about service changes. We
          balance these against your rights and you may object at any time.
        </li>
        <li>
          <strong>Consent</strong> — marketing emails, the newsletter, and non-essential cookies.
          You may withdraw consent at any time without affecting prior processing.
        </li>
        <li>
          <strong>Legal obligation</strong> — tax, accounting and lawful requests from a competent
          authority.
        </li>
      </ul>

      <h2 id="retention">Data Retention</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Data</th>
              <th scope="col">Retention period</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Account and profile data</td>
              <td>For the life of the account, then 90 days after closure</td>
            </tr>
            <tr>
              <td>Business data you uploaded</td>
              <td>
                For the life of the account. Deleted within 30 days of a written deletion request
                or account closure, unless you ask us to retain it longer
              </td>
            </tr>
            <tr>
              <td>Invoices and payment records</td>
              <td>Seven years, as required by Kenyan tax law</td>
            </tr>
            <tr>
              <td>Security and access logs</td>
              <td>12 months</td>
            </tr>
            <tr>
              <td>Support and enquiry correspondence</td>
              <td>24 months from last contact</td>
            </tr>
            <tr>
              <td>Newsletter subscription</td>
              <td>Until you unsubscribe</td>
            </tr>
            <tr>
              <td>Backups</td>
              <td>Rolling 35-day cycle, after which deleted data is irrecoverable</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="security">Security</h2>
      <p>
        We apply technical and organisational measures appropriate to the risk, including TLS
        encryption of all data in transit, encryption at rest, hashed and salted passwords,
        role-based access control enforced on every API route, rate limiting at the network edge,
        least-privilege access for staff, logged administrative actions, and regular dependency and
        configuration review.
      </p>
      <p>
        No system is perfectly secure. If a breach occurs that is likely to result in a risk to
        affected individuals, we will notify the Office of the Data Protection Commissioner within
        72 hours of becoming aware of it, and notify affected people without undue delay where the
        risk is high.
      </p>

      <h2 id="your-rights">Your Rights</h2>
      <p>Under the Data Protection Act 2019 you have the right to:</p>
      <ol>
        <li>Be informed of the use to which your personal data is put.</li>
        <li>Access your personal data held by us and obtain a copy.</li>
        <li>Request correction of inaccurate, outdated or misleading data.</li>
        <li>Request deletion of false or misleading data, or data we no longer need.</li>
        <li>Object to processing of all or part of your personal data.</li>
        <li>Receive your data in a structured, commonly used, machine-readable format.</li>
        <li>Withdraw consent where processing is based on consent.</li>
      </ol>
      <p>
        To exercise any of these, email <a href={`mailto:${SITE.dpoEmail}`}>{SITE.dpoEmail}</a>. We
        respond within 30 days and will tell you if we need longer. There is no charge for a
        reasonable request. If you are not satisfied with our response you may complain to the
        Office of the Data Protection Commissioner, Kenya.
      </p>

      <h2 id="transfers">International Transfers</h2>
      <p>
        Our infrastructure is hosted on global edge infrastructure, so your data may be processed
        outside Kenya. Where that happens we rely on appropriate safeguards as required by section
        48 of the Act, including contractual commitments from our processors and a documented
        assessment that the receiving jurisdiction provides sufficient protection. You may request
        details of those safeguards.
      </p>

      <h2 id="children">Children&rsquo;s Data</h2>
      <p>
        DataPulse is a business tool and is not directed at children. Where a school customer
        uploads pupil data, that school remains the controller of it and is responsible for the
        parental consent and safeguarding obligations attaching to it. We process such data only to
        produce the school&rsquo;s own dashboards and never for any other purpose.
      </p>

      <h2 id="changes">Changes to This Policy</h2>
      <p>
        We may update this policy as the service changes or the law develops. Material changes will
        be notified by email to account owners and announced in the product at least 14 days before
        they take effect. The &ldquo;last updated&rdquo; date at the top of this page always
        reflects the current version.
      </p>

      <h2 id="controller">Data Controller</h2>
      <p>
        The data controller for personal data described in this policy is {SITE.legalName}, of{" "}
        {SITE.address}. Data protection enquiries, access requests and complaints should be
        addressed to our Data Protection contact at{" "}
        <a href={`mailto:${SITE.dpoEmail}`}>{SITE.dpoEmail}</a>.
      </p>
      <p>
        Supervisory authority: Office of the Data Protection Commissioner, Nairobi, Kenya.
      </p>
    </LegalShell>
  );
}
