import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Phone, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { setCustomerCookie, CustomerInfo } from '@/lib/cookies';

interface CustomerLoginProps {
  onLoginSuccess: (customerInfo: CustomerInfo) => void;
}

const CustomerLogin = ({ onLoginSuccess }: CustomerLoginProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim()) {
      toast.error('Please enter both name and phone number');
      return;
    }

    // Validate phone format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      toast.error('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setIsLoading(true);

    try {
      // Check if booking exists with this name and phone via Edge Function
      const { data: response, error } = await supabase.functions.invoke('get-customer-bookings', {
        body: { name: name.trim(), phone: phone.trim() }
      });

      if (error) {
        throw error;
      }

      const data = response?.data;

      if (!data || data.length === 0) {
        toast.error('No booking found with these details. Please check your name and phone number.');
        return;
      }

      const customerInfo: CustomerInfo = { name: name.trim(), phone: phone.trim() };
      
      // Save to cookie
      setCustomerCookie(customerInfo);
      
      toast.success('Login successful!');
      onLoginSuccess(customerInfo);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">Track Your Repair</CardTitle>
        <CardDescription>
          Enter your booking details to check repair status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your 10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              maxLength={10}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              'Checking...'
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Check Status
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomerLogin;
