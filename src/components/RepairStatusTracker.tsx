import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  Phone, 
  Wrench, 
  CheckCircle2, 
  ThumbsUp, 
  LogOut,
  RefreshCw,
  Calendar,
  IndianRupee
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      // Fetch bookings via Edge Function for security
      const { data: response, error } = await supabase.functions.invoke('get-customer-bookings', {
        body: { name: customerInfo.name, phone: customerInfo.phone }
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
            
            // Only update if this booking belongs to the current customer
            if (updatedBooking.phone === customerInfo.phone && 
                updatedBooking.name === customerInfo.name) {
              setBookings(prev => 
                prev.map(booking => 
                  booking.id === updatedBooking.id ? updatedBooking : booking
                )
              );
              toast.success('Repair status updated!', {
                description: `Your repair is now: ${REPAIR_STAGES.find(s => s.key === updatedBooking.repair_status)?.label || updatedBooking.repair_status}`
              });
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

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Paid</Badge>;
      case 'pending_verification':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending Verification</Badge>;
      default:
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Pending</Badge>;
    }
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
            <p className="text-muted-foreground">No bookings found</p>
          </CardContent>
        </Card>
      ) : (
        bookings.map((booking) => {
          const currentStageIndex = getCurrentStageIndex(booking.repair_status);
          
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
                  {getPaymentBadge(booking.payment_status)}
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
