import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsAndConditions = () => {
  const terms = [
    // General Terms (1-15)
    "By visiting our website or using our services, you agree to be bound by these Terms and Conditions.",
    "TechFix Pro reserves the right to modify these terms at any time without prior notice.",
    "Users must be at least 18 years old or have parental/guardian consent to use our services.",
    "All services are provided on an 'as-is' basis without any guarantees unless explicitly stated.",
    "We reserve the right to refuse service to anyone at our discretion.",
    "Prices listed on the website are subject to change without prior notice.",
    "All prices are in Indian Rupees (INR) and inclusive of applicable taxes.",
    "Service estimates provided are approximate and may vary based on actual diagnosis.",
    "Users are responsible for backing up their data before handing over devices for repair.",
    "TechFix Pro is not responsible for any data loss during the repair process.",
    "We recommend customers to remove SIM cards and memory cards before submitting devices.",
    "All communication regarding services will be conducted via the phone number provided during booking.",
    "Users must provide accurate contact information for service updates and notifications.",
    "We reserve the right to cancel bookings if fraudulent activity is suspected.",
    "These terms are governed by the laws of India and courts in the local jurisdiction.",

    // Payment Terms (16-30)
    "A minimum service charge of ₹150 (One Hundred Fifty Rupees) is applicable for all consultations and diagnostic services.",
    "The ₹150 service charge is non-refundable under any circumstances as it covers diagnostic and consultation time.",
    "Payment must be made in full at the time of booking through Razorpay payment gateway.",
    "We accept payments via UPI, credit cards, debit cards, and net banking through Razorpay.",
    "All payment transactions are secured and encrypted through Razorpay's payment infrastructure.",
    "Failed payments will not result in service booking; please retry or contact support.",
    "Payment confirmation will be sent to the registered phone number within 24 hours.",
    "In case of payment disputes, users must contact us within 7 days of the transaction.",
    "We do not store any credit/debit card information on our servers.",
    "All payment processing is handled by Razorpay and subject to their terms of service.",
    "Invoices for completed services will be provided upon request.",
    "GST invoices can be generated for business customers with valid GSTIN.",
    "Any additional charges beyond the initial quote will be communicated before proceeding.",
    "Customers must approve additional charges before work continues.",
    "We reserve the right to hold devices until full payment is received for services rendered.",

    // Refund Policy (31-50)
    "NO REFUNDS are available once a service booking is confirmed and payment is processed.",
    "The base service charge of ₹150 is strictly non-refundable as it covers consultation and diagnostic services.",
    "If the issue is diagnosed as not fixable by our technicians, any amount paid BEYOND ₹150 will be refunded.",
    "Refunds for amounts beyond ₹150 (for unfixable issues) will be processed within 7-10 business days.",
    "Refunds will be credited to the original payment method used during booking.",
    "If the customer declines the repair after diagnosis, only the ₹150 diagnostic fee is retained.",
    "No refund requests will be entertained after the repair work has been completed.",
    "Refund eligibility is determined solely by TechFix Pro's technical assessment.",
    "Partial refunds may be offered at our discretion for partially completed services.",
    "Refund requests must be raised within 48 hours of service completion for consideration.",
    "Chargebacks initiated without prior communication may result in legal action.",
    "We do not offer refunds for customer-requested upgrades or additional services.",
    "Refunds are not available if the device is found to have physical damage not disclosed earlier.",
    "Software-related issues that recur due to customer actions are not eligible for refunds.",
    "Customers abandoning devices for more than 30 days forfeit any refund claims.",
    "Refunds for cancelled bookings (before service begins) may be considered on a case-by-case basis, excluding the ₹150 fee.",
    "Exchange or re-service may be offered instead of refunds where applicable.",
    "Promotional or discounted services are non-refundable under any circumstances.",
    "Gift card or voucher payments are non-refundable but may be transferred.",
    "Any refund processing fees charged by payment gateways will be borne by the customer.",

    // Service Terms (51-70)
    "Service timelines provided are estimates and may vary based on parts availability and complexity.",
    "We aim to complete most software repairs within 24-48 hours.",
    "Hardware repairs may take 3-7 business days depending on parts availability.",
    "Customers will be notified of any delays via phone or WhatsApp.",
    "Priority service is available at additional cost for urgent repairs.",
    "We use original or high-quality compatible parts for all hardware repairs.",
    "Warranty on replaced parts varies from 30 days to 1 year depending on the component.",
    "Software installations and updates do not carry warranty for third-party software issues.",
    "We reserve the right to outsource specialized repairs to authorized service partners.",
    "On-site service availability depends on location and technician availability.",
    "Remote support services are provided for software-related issues where applicable.",
    "Customers must be available for device pickup/delivery at scheduled times.",
    "Missed appointments may result in rescheduling delays.",
    "We are not responsible for issues arising from unauthorized modifications made after our service.",
    "Jailbroken, rooted, or modified devices may have limited service options.",
    "Data recovery services do not guarantee 100% recovery of all files.",
    "We reserve the right to decline service for devices with illegal content.",
    "Devices with activation locks or unpaid carrier dues may not be serviced.",
    "Customers must provide proof of ownership for devices when requested.",
    "We may require device passwords for software repairs with customer consent.",

    // Liability Terms (71-85)
    "TechFix Pro's liability is limited to the service fee paid for the specific repair.",
    "We are not liable for any indirect, incidental, or consequential damages.",
    "Loss of business, data, or revenue claims are not covered under our liability.",
    "Pre-existing device conditions may affect repair outcomes; we are not liable for such issues.",
    "Devices damaged during shipping to/from our facility are covered by courier insurance only.",
    "We recommend device insurance for expensive electronics before repair submission.",
    "Customers assume all risks for devices not picked up within 30 days of service completion.",
    "Abandoned devices may be disposed of or sold to recover storage and service costs.",
    "We are not responsible for compatibility issues with third-party software or accessories.",
    "Liquid damage repairs have variable success rates; no guarantee is provided.",
    "Devices with previous unauthorized repairs may have voided manufacturer warranties.",
    "We advise customers to check manufacturer warranty status before third-party repairs.",
    "Force majeure events (natural disasters, pandemics, etc.) may affect service delivery timelines.",
    "Our maximum liability for any claim will not exceed the amount paid for the service.",
    "Indemnification: Customers agree to indemnify TechFix Pro against third-party claims.",

    // Privacy & Data (86-95)
    "We collect minimal personal information necessary for service delivery.",
    "Customer data is stored securely and not shared with third parties without consent.",
    "We may access device data only to the extent necessary for repairs.",
    "Customers should remove sensitive personal data before submitting devices when possible.",
    "We use encryption for all digital communications and data storage.",
    "Our privacy practices comply with applicable Indian data protection laws.",
    "Marketing communications are opt-in only; customers can unsubscribe anytime.",
    "We retain service records for a minimum of 2 years for warranty purposes.",
    "Customer feedback may be used anonymously for service improvement.",
    "Data breach notifications will be sent within 72 hours if customer data is compromised.",

    // Miscellaneous (96-100)
    "Promotional offers and discounts cannot be combined unless explicitly stated.",
    "Corporate and bulk service contracts are subject to separate terms and conditions.",
    "Disputes will be resolved through arbitration in accordance with Indian Arbitration Act.",
    "If any provision of these terms is found invalid, other provisions remain in full effect.",
    "These Terms and Conditions constitute the entire agreement between customers and TechFix Pro regarding service use.",
  ];

  return (
    <>
      <Helmet>
        <title>Terms and Conditions - TechFix Pro</title>
        <meta name="description" content="Read the complete terms and conditions for TechFix Pro services including refund policy, payment terms, and service agreements." />
      </Helmet>
      
      <main className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-foreground text-background py-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                  <span className="text-foreground font-bold text-lg">TF</span>
                </div>
                <span className="text-xl font-semibold">TechFix Pro</span>
              </Link>
              <a 
                href="tel:8812910655"
                className="flex items-center gap-2 bg-background text-foreground px-4 py-2 rounded-full font-medium hover:opacity-90 transition-opacity text-sm"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">8812910655</span>
              </a>
            </div>
          </div>
        </header>

        {/* Back Button */}
        <div className="container mx-auto px-4 py-6">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Terms Content */}
        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Terms and Conditions</h1>
            <p className="text-muted-foreground mb-8">Last updated: December 2024</p>

            {/* Important Refund Notice */}
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-destructive mb-3">Important: Refund Policy Summary</h2>
              <ul className="space-y-2 text-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">•</span>
                  <span><strong>No refunds available</strong> once service booking is confirmed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">•</span>
                  <span><strong>₹150 service charge is always retained</strong> as consultation/diagnostic fee.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">•</span>
                  <span><strong>If issue is not fixable:</strong> Any amount paid beyond ₹150 will be refunded.</span>
                </li>
              </ul>
            </div>

            {/* Section Headers */}
            <div className="space-y-8">
              {/* General Terms */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">General Terms (1-15)</h2>
                <ol className="space-y-3" start={1}>
                  {terms.slice(0, 15).map((term, index) => (
                    <li key={index} className="flex gap-3 text-muted-foreground">
                      <span className="font-semibold text-foreground min-w-8">{index + 1}.</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Payment Terms */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">Payment Terms (16-30)</h2>
                <ol className="space-y-3" start={16}>
                  {terms.slice(15, 30).map((term, index) => (
                    <li key={index} className="flex gap-3 text-muted-foreground">
                      <span className="font-semibold text-foreground min-w-8">{index + 16}.</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Refund Policy */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">Refund Policy (31-50)</h2>
                <ol className="space-y-3" start={31}>
                  {terms.slice(30, 50).map((term, index) => (
                    <li key={index} className="flex gap-3 text-muted-foreground">
                      <span className="font-semibold text-foreground min-w-8">{index + 31}.</span>
                      <span className={index < 4 ? "font-medium text-foreground" : ""}>{term}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Service Terms */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">Service Terms (51-70)</h2>
                <ol className="space-y-3" start={51}>
                  {terms.slice(50, 70).map((term, index) => (
                    <li key={index} className="flex gap-3 text-muted-foreground">
                      <span className="font-semibold text-foreground min-w-8">{index + 51}.</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Liability Terms */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">Liability Terms (71-85)</h2>
                <ol className="space-y-3" start={71}>
                  {terms.slice(70, 85).map((term, index) => (
                    <li key={index} className="flex gap-3 text-muted-foreground">
                      <span className="font-semibold text-foreground min-w-8">{index + 71}.</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Privacy & Data */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">Privacy & Data (86-95)</h2>
                <ol className="space-y-3" start={86}>
                  {terms.slice(85, 95).map((term, index) => (
                    <li key={index} className="flex gap-3 text-muted-foreground">
                      <span className="font-semibold text-foreground min-w-8">{index + 86}.</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Miscellaneous */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">Miscellaneous (96-100)</h2>
                <ol className="space-y-3" start={96}>
                  {terms.slice(95, 100).map((term, index) => (
                    <li key={index} className="flex gap-3 text-muted-foreground">
                      <span className="font-semibold text-foreground min-w-8">{index + 96}.</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            {/* Contact Section */}
            <div className="mt-12 bg-muted rounded-lg p-6">
              <h2 className="text-xl font-bold text-foreground mb-3">Questions About Our Terms?</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="space-y-2">
                <p className="text-foreground">
                  <strong>Phone:</strong> <a href="tel:8812910655" className="text-primary hover:underline">8812910655</a>
                </p>
                <p className="text-foreground">
                  <strong>Email:</strong> <a href="mailto:support@techfixpro.in" className="text-primary hover:underline">support@techfixpro.in</a>
                </p>
                <p className="text-foreground">
                  <strong>WhatsApp:</strong> <a href="https://wa.me/918812910655" className="text-primary hover:underline">+91 8812910655</a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-foreground text-background py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-background/60">© 2024 TechFix Pro. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </>
  );
};

export default TermsAndConditions;
