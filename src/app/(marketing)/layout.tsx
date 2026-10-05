import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import WhatsAppButton from "@/components/marketing/WhatsAppButton";

/**
 * Marketing shell.
 * The floating WhatsApp button lives here only — the authenticated /app
 * dashboard deliberately omits it to avoid clutter (brief).
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
