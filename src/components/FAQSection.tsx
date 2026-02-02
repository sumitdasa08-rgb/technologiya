import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";

const FAQ_DATA = [{
  question: "How much does Technologiya computer repair cost?",
  answer: "Technologiya computer repair services start at just ₹100. The final cost depends on the issue - simple software fixes are more affordable, while hardware repairs may cost more. Technologiya provides a free diagnosis and quote before any work begins."
}, {
  question: "How long does Technologiya laptop repair take?",
  answer: "Most common Technologiya laptop repairs like screen replacements and battery changes can be completed within 30 minutes to 2 hours. Complex repairs may take 24-48 hours. Technologiya prides itself on quick turnaround times."
}, {
  question: "Does Technologiya offer doorstep repair service?",
  answer: "Yes! Technologiya offers convenient doorstep repair services for both computers and mobile devices. Our Technologiya technicians will come to your location, diagnose the issue, and fix it on the spot whenever possible."
}, {
  question: "Is my data safe during Technologiya repair?",
  answer: "Absolutely. Technologiya prioritizes your privacy and data security. Our Technologiya technicians follow strict protocols to ensure your personal data remains confidential. We recommend backing up your data before any repair as an extra precaution."
}, {
  question: "What types of devices does Technologiya repair?",
  answer: "Technologiya repairs all brands of computers (laptops and desktops), mobile phones (iPhone, Samsung, OnePlus, Xiaomi, etc.), and tablets. Technologiya services include Windows installation, MS Office setup, storage troubleshooting, screen repairs, and more."
}, {
  question: "Does Technologiya provide warranty on repairs?",
  answer: "Yes, Technologiya provides warranty on all repairs. The warranty period varies depending on the type of repair - typically 30 days for software fixes and up to 90 days for hardware replacements."
}, {
  question: "Can Technologiya fix a water damaged phone?",
  answer: "Yes, Technologiya specializes in water damage repair. The success rate depends on how quickly you bring the device to Technologiya after the incident. Turn off your device immediately and avoid charging it - bring it to Technologiya as soon as possible for the best chance of recovery."
}, {
  question: "How can I track my Technologiya repair status?",
  answer: "Technologiya provides a convenient online repair tracking system. Simply log in with your name and phone number on our Track Repair page to see real-time updates on your device's repair status."
}, {
  question: "Do I need to book an appointment with Technologiya?",
  answer: "While walk-ins are welcome at Technologiya, we recommend booking through WhatsApp or calling us at 8812910655 to ensure faster service and reduce wait times."
}, {
  question: "What payment methods does Technologiya accept?",
  answer: "Technologiya accepts all major payment methods including cash, UPI (PhonePe, Google Pay, Paytm), credit/debit cards, and online bank transfers for your convenience."
}];

const generateFAQSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_DATA.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 md:py-24 bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 glow-accent opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
      
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(generateFAQSchema())}
        </script>
      </Helmet>
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            <HelpCircle className="h-4 w-4" />
            Technologiya FAQ
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 font-display">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about Technologiya computer repair, laptop repair, and device troubleshooting services
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-3">
            {FAQ_DATA.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="glass-card rounded-xl px-6 data-[state=open]:shadow-lg transition-all duration-300 border-0"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Still have questions? Contact Technologiya - we're here to help!
          </p>
          <a 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/20" 
            href="tel:+918812910655"
            aria-label="Call Technologiya for support"
          >
            Call Technologiya: +91 88129 10655
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;