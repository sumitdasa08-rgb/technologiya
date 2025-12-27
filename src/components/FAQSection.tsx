import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";

const FAQ_DATA = [
  {
    question: "How much does computer repair cost?",
    answer: "Our computer repair services start at just ₹250. The final cost depends on the issue - simple software fixes are more affordable, while hardware repairs may cost more. We provide a free diagnosis and quote before any work begins."
  },
  {
    question: "How long does a phone repair take?",
    answer: "Most common repairs like screen replacements and battery changes can be completed within 30 minutes to 2 hours. Complex repairs may take 24-48 hours. We pride ourselves on quick turnaround times."
  },
  {
    question: "Do you offer doorstep repair service?",
    answer: "Yes! We offer convenient doorstep repair services for both computers and mobile devices. Our technicians will come to your location, diagnose the issue, and fix it on the spot whenever possible."
  },
  {
    question: "Is my data safe during repair?",
    answer: "Absolutely. We prioritize your privacy and data security. Our technicians follow strict protocols to ensure your personal data remains confidential. We recommend backing up your data before any repair as an extra precaution."
  },
  {
    question: "What types of devices do you repair?",
    answer: "We repair all brands of computers (laptops and desktops), mobile phones (iPhone, Samsung, OnePlus, Xiaomi, etc.), and tablets. Our services include Windows upgrades, MS Office installation, storage troubleshooting, screen repairs, and more."
  },
  {
    question: "Do you provide warranty on repairs?",
    answer: "Yes, we provide warranty on all our repairs. The warranty period varies depending on the type of repair - typically 30 days for software fixes and up to 90 days for hardware replacements."
  },
  {
    question: "Can you fix a water damaged phone?",
    answer: "Yes, we specialize in water damage repair. The success rate depends on how quickly you bring the device to us after the incident. Turn off your device immediately and avoid charging it - bring it to us as soon as possible for the best chance of recovery."
  },
  {
    question: "How can I track my repair status?",
    answer: "We provide a convenient online repair tracking system. Simply log in with your name and phone number on our Track Repair page to see real-time updates on your device's repair status."
  },
  {
    question: "Do I need to book an appointment?",
    answer: "While walk-ins are welcome, we recommend booking through WhatsApp or calling us at 8812910655 to ensure faster service and reduce wait times."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major payment methods including cash, UPI (PhonePe, Google Pay, Paytm), credit/debit cards, and online bank transfers for your convenience."
  }
];

// Generate JSON-LD structured data for SEO
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
    <section id="faq" className="py-16 md:py-24 bg-muted/30">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(generateFAQSchema())}
        </script>
      </Helmet>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <HelpCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Got Questions? We Have Answers
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about our computer and mobile repair services
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {FAQ_DATA.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6 data-[state=open]:shadow-md transition-shadow"
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

        <div className="text-center mt-10">
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help!
          </p>
          <a 
            href="tel:8812910655" 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Call Us: 8812910655
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
