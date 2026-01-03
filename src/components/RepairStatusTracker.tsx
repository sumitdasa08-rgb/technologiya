import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertCircle,
  Plus,
  Phone, 
  Wrench, 
  CheckCircle2, 
  ThumbsUp, 
  LogOut,
  RefreshCw,
  Calendar,
  IndianRupee,
  XCircle,
  CreditCard,
  Clock,
  Home
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CustomerInfo, clearCustomerCookie } from '@/lib/cookies';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Booking {
  id: string;
  name: string;
  phone: string;
  issue: string;
  description: string | null;
  amount: number;
  payment_status: string;
  repair_status: string;
  created_at: string;
  razorpay_order_id: string | null;
}

interface RepairStatusTrackerProps {
  customerInfo: CustomerInfo;
  onLogout: () => void;
}

const REPAIR_STAGES = [
  { key: 'problem_raised', label: 'Problem Raised', icon: AlertCircle, description: 'Your repair request has been received', estimatedHours: 0 },
  { key: 'technician_called', label: 'Technician Assigned', icon: Phone, description: 'A technician will contact you soon', estimatedHours: 2 },
  { key: 'technician_fixing', label: 'Repair In Progress', icon: Wrench, description: 'Our technician is working on your device', estimatedHours: 24 },
  { key: 'fixed', label: 'Repair Complete', icon: CheckCircle2, description: 'Your device has been fixed', estimatedHours: 48 },
  { key: 'customer_satisfied', label: 'Completed', icon: ThumbsUp, description: 'Thank you for choosing us!', estimatedHours: 72 },
];

const getEstimatedTime = (createdAt: string, stageIndex: number, currentStageIndex: number): string => {
  if (stageIndex <= currentStageIndex) return 'Completed';
  
  const stage = REPAIR_STAGES[stageIndex];
  const bookingDate = new Date(createdAt);
  const estimatedDate = new Date(bookingDate.getTime() + stage.estimatedHours * 60 * 60 * 1000);
  
  const now = new Date();
  if (estimatedDate < now) {
    return 'Soon';
  }
  
  const diffMs = estimatedDate.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `~${diffDays}d ${diffHours % 24}h`;
  }
  return `~${diffHours}h`;
};

const RepairStatusTracker = ({ customerInfo, onLogout }: RepairStatusTrackerProps) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      // Fetch bookings via Edge Function for security
      const { data: response, error } = await supabase.functions.invoke('get-customer-bookings', {
        body: { 
          name: customerInfo.name, 
          phone: customerInfo.phone,
          bookingRef: customerInfo.bookingRef 
        }
      });

      if (error) throw error;
      
      // Type assertion since repair_status is now in the table
      setBookings((response?.data || []) as Booking[]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load your bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [customerInfo]);

  // Real-time subscription for booking updates
  useEffect(() => {
    // Subscribe to changes on the bookings table
    const channel = supabase
      .channel('booking-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          
          if (payload.eventType === 'UPDATE') {
            const updatedBooking = payload.new as Booking;
            const oldBooking = payload.old as Booking;
            
            // Only update if this booking belongs to the current customer
            if (updatedBooking.phone === customerInfo.phone && 
                updatedBooking.name === customerInfo.name) {
              setBookings(prev => 
                prev.map(booking => 
                  booking.id === updatedBooking.id ? updatedBooking : booking
                )
              );
              
              // Show appropriate toast based on what changed
              if (oldBooking.payment_status !== updatedBooking.payment_status) {
                if (updatedBooking.payment_status === 'payment_failed') {
                  toast.error('Payment Not Received', {
                    description: 'We haven\'t received your payment. Please retry or contact support.'
                  });
                } else if (updatedBooking.payment_status === 'completed') {
                  toast.success('Payment Confirmed!', {
                    description: 'Your payment has been verified successfully.'
                  });
                }
              } else if (oldBooking.repair_status !== updatedBooking.repair_status) {
                toast.success('Repair status updated!', {
                  description: `Your repair is now: ${REPAIR_STAGES.find(s => s.key === updatedBooking.repair_status)?.label || updatedBooking.repair_status}`
                });
              }
            }
          } else if (payload.eventType === 'INSERT') {
            const newBooking = payload.new as Booking;
            
            // Only add if this booking belongs to the current customer
            if (newBooking.phone === customerInfo.phone && 
                newBooking.name === customerInfo.name) {
              setBookings(prev => [newBooking, ...prev]);
              toast.success('New booking added!');
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [customerInfo]);

  const handleLogout = () => {
    clearCustomerCookie();
    onLogout();
    toast.success('Logged out successfully');
  };

  const getCurrentStageIndex = (status: string) => {
    return REPAIR_STAGES.findIndex(stage => stage.key === status);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Welcome, {customerInfo.name}</h2>
          <p className="text-muted-foreground">Track your repair status below</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchBookings}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">No bookings found</p>
            <Button 
              onClick={() => navigate('/#contact')}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New Booking
            </Button>
          </CardContent>
        </Card>
      ) : (
        bookings.map((booking) => {
          const currentStageIndex = getCurrentStageIndex(booking.repair_status);
          const isPaymentPending = booking.payment_status === 'pending_verification' || booking.payment_status === 'pending';
          const isPaymentFailed = booking.payment_status === 'payment_failed';
          const isPaymentConfirmed = booking.payment_status === 'completed' || booking.payment_status === 'paid';
          
          // If payment failed, show rebook option prominently
          if (isPaymentFailed) {
            return (
              <Card key={booking.id} className="overflow-hidden border-red-500/30">
                <CardHeader className="bg-red-500/10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg text-red-400">{booking.issue}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(booking.created_at), 'dd MMM yyyy, hh:mm a')}
                        </span>
                        <span className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          {booking.amount}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      <XCircle className="h-3 w-3 mr-1" />
                      Payment Not Received
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                      <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">Payment Not Received</h3>
                      <p className="text-muted-foreground">
                        We haven't received your payment of ₹{booking.amount}. Please create a new booking to proceed with your repair.
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button 
                        onClick={() => navigate('/#booking')}
                        className="gap-2"
                      >
                        <Home className="h-4 w-4" />
                        Create New Booking
                      </Button>
                      <Button 
                        variant="outline"
                        asChild
                      >
                        <a href="tel:8812910655" className="gap-2">
                          <Phone className="h-4 w-4" />
                          Call Support
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }

          // If payment is pending verification, show processing status
          if (isPaymentPending) {
            return (
              <Card key={booking.id} className="overflow-hidden border-amber-500/30">
                <CardHeader className="bg-amber-500/10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{booking.issue}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(booking.created_at), 'dd MMM yyyy, hh:mm a')}
                        </span>
                        <span className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          {booking.amount}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse">
                      <Clock className="h-3 w-3 mr-1 animate-spin" />
                      Payment Processing
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                      <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">Verifying Your Payment</h3>
                      <p className="text-muted-foreground">
                        Please wait while we verify your payment. This usually takes 15-30 minutes.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        You'll receive a notification once your payment is confirmed.
                      </p>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        <strong>Booking Reference:</strong> {booking.razorpay_order_id}
                      </p>
                    </div>

                    <Button 
                      variant="outline"
                      onClick={fetchBookings}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Check Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          }
          
          // Payment confirmed - show repair tracking
          return (
            <Card key={booking.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{booking.issue}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(booking.created_at), 'dd MMM yyyy, hh:mm a')}
                      </span>
                      <span className="flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        {booking.amount}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Payment Confirmed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {booking.description && (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">{booking.description}</p>
                    <Separator className="mb-6" />
                  </>
                )}
                
                {/* Status Timeline */}
                <div className="relative">
                  {REPAIR_STAGES.map((stage, index) => {
                    const Icon = stage.icon;
                    const isCompleted = index <= currentStageIndex;
                    const isCurrent = index === currentStageIndex;
                    const eta = getEstimatedTime(booking.created_at, index, currentStageIndex);
                    
                    return (
                      <div key={stage.key} className="flex gap-4 pb-6 last:pb-0">
                        {/* Timeline Line */}
                        <div className="flex flex-col items-center">
                          <div 
                            className={`
                              w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                              ${isCompleted 
                                ? 'bg-primary border-primary text-primary-foreground' 
                                : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                              }
                              ${isCurrent ? 'ring-4 ring-primary/20' : ''}
                            `}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          {index < REPAIR_STAGES.length - 1 && (
                            <div 
                              className={`
                                w-0.5 flex-1 mt-2
                                ${index < currentStageIndex ? 'bg-primary' : 'bg-muted-foreground/30'}
                              `}
                            />
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 pt-1">
                          <div className="flex items-center justify-between">
                            <h4 
                              className={`
                                font-medium
                                ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}
                              `}
                            >
                              {stage.label}
                              {isCurrent && (
                                <Badge variant="outline" className="ml-2 text-xs">Current</Badge>
                              )}
                            </h4>
                            {!isCompleted && (
                              <Badge variant="secondary" className="text-xs">
                                ETA: {eta}
                              </Badge>
                            )}
                            {isCompleted && index < currentStageIndex && (
                              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                                ✓ Done
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {stage.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default RepairStatusTracker;
