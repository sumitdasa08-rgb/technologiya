import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerLogin from '@/components/CustomerLogin';
import RepairStatusTracker from '@/components/RepairStatusTracker';
import { getCustomerCookie, CustomerInfo } from '@/lib/cookies';

const TrackRepair = () => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check for saved customer info in cookies
    const savedInfo = getCustomerCookie();
    if (savedInfo) {
      setCustomerInfo(savedInfo);
    }
    setIsLoaded(true);
  }, []);

  const handleLoginSuccess = (info: CustomerInfo) => {
    setCustomerInfo(info);
  };

  const handleLogout = () => {
    setCustomerInfo(null);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Track Your Repair | PC Repair Service</title>
        <meta name="description" content="Track the status of your PC repair. Check real-time updates on your repair progress." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-foreground">Repair Status</h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {customerInfo ? (
            <RepairStatusTracker 
              customerInfo={customerInfo} 
              onLogout={handleLogout} 
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <CustomerLogin onLoginSuccess={handleLoginSuccess} />
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default TrackRepair;
