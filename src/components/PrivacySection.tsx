import { Eye, Shield, Lock, CheckCircle } from "lucide-react";

const PrivacySection = () => {
  return (
    <section id="privacy" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Your Privacy Matters</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              100% Transparent Service
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We understand how valuable your data is. That's why we ensure complete transparency in everything we do.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 rounded-xl border border-border bg-card">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Eye className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Work In Your Presence</h3>
              <p className="text-sm text-muted-foreground">Every repair is done right in front of you. No hidden processes.</p>
            </div>
            <div className="text-center p-6 rounded-xl border border-border bg-card">
              <div className="w-14 h-14 mx-auto rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Data Protection</h3>
              <p className="text-sm text-muted-foreground">Your files and personal data remain untouched and secure.</p>
            </div>
            <div className="text-center p-6 rounded-xl border border-border bg-card">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No Snooping</h3>
              <p className="text-sm text-muted-foreground">We never access your personal files without your explicit permission.</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 border border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Our Promise</h3>
                <p className="text-muted-foreground leading-relaxed">
                  <span className="text-foreground font-medium">"We know your privacy is important."</span> That's why we do everything in front of you. 
                  Watch us work, ask questions, and stay informed throughout the entire repair process. 
                  Your trust is our top priority, and we go above and beyond to earn it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacySection;
