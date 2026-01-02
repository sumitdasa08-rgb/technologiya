import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ServicePrice {
  id: string;
  label: string;
  price: number;
  description: string | null;
  display_order: number;
}

// Currency settings
export const CURRENCY = {
  code: "INR",
  symbol: "₹",
} as const;

// Fallback price if database fetch fails
export const DEFAULT_SERVICE_FEE = 10;

// Format price with currency symbol
export function formatPrice(amount: number): string {
  return `${CURRENCY.symbol}${amount}`;
}

// Fetch all active services from database
async function fetchServices(): Promise<ServicePrice[]> {
  const { data, error } = await supabase
    .from("service_pricing")
    .select("id, label, price, description, display_order")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching pricing:", error);
    throw error;
  }

  return data || [];
}

// React Query hook for fetching pricing
export function usePricing() {
  return useQuery({
    queryKey: ["service-pricing"],
    queryFn: fetchServices,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Get price by service ID from a list
export function getServicePrice(
  services: ServicePrice[],
  serviceId: string
): number {
  const service = services.find((s) => s.id === serviceId);
  return service?.price ?? DEFAULT_SERVICE_FEE;
}

// Get service by ID from a list
export function getServiceById(
  services: ServicePrice[],
  serviceId: string
): ServicePrice | undefined {
  return services.find((s) => s.id === serviceId);
}
