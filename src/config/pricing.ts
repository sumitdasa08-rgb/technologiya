/**
 * Centralized Pricing Configuration
 * 
 * Update prices here and they will sync across the entire frontend.
 * 
 * IMPORTANT: If you change prices here, also update the backend edge function:
 * supabase/functions/create-upi-booking/index.ts (SERVICE_PRICING constant)
 */

export interface ServicePrice {
  id: string;
  label: string;
  price: number;
  description?: string;
}

// Default service fee (shown when no specific service is selected)
export const DEFAULT_SERVICE_FEE = 10;

// Currency settings
export const CURRENCY = {
  code: "INR",
  symbol: "₹",
} as const;

// Service pricing map
export const SERVICE_PRICING: Record<string, number> = {
  windows_upgrade: 10,
  software_repair: 10,
  sound_issues: 10,
  network_setup: 10,
  virus_removal: 10,
  pc_optimization: 10,
  data_recovery: 10,
  consultation: 10,
};

// Full service catalog with details (used in ServicesSection)
export const SERVICES: ServicePrice[] = [
  {
    id: "windows_upgrade",
    label: "Windows Upgrade",
    price: SERVICE_PRICING.windows_upgrade,
    description: "Upgrade to latest Windows version with all drivers configured",
  },
  {
    id: "software_repair",
    label: "Software Repair",
    price: SERVICE_PRICING.software_repair,
    description: "Fix software issues, crashes, and application errors",
  },
  {
    id: "sound_issues",
    label: "Sound Issues",
    price: SERVICE_PRICING.sound_issues,
    description: "Resolve audio problems, driver issues, and speaker configuration",
  },
  {
    id: "network_setup",
    label: "Network Setup",
    price: SERVICE_PRICING.network_setup,
    description: "WiFi configuration, network troubleshooting, and connectivity fixes",
  },
  {
    id: "virus_removal",
    label: "Virus Removal",
    price: SERVICE_PRICING.virus_removal,
    description: "Remove malware, viruses, and secure your system",
  },
  {
    id: "pc_optimization",
    label: "PC Optimization",
    price: SERVICE_PRICING.pc_optimization,
    description: "Speed up your PC, clean junk files, and optimize performance",
  },
  {
    id: "data_recovery",
    label: "Data Recovery",
    price: SERVICE_PRICING.data_recovery,
    description: "Recover deleted files and restore lost data",
  },
  {
    id: "consultation",
    label: "Consultation",
    price: SERVICE_PRICING.consultation,
    description: "General tech consultation and advice",
  },
];

// Helper to get price by service ID
export function getServicePrice(serviceId: string): number {
  return SERVICE_PRICING[serviceId] ?? DEFAULT_SERVICE_FEE;
}

// Helper to get service by ID
export function getServiceById(serviceId: string): ServicePrice | undefined {
  return SERVICES.find((s) => s.id === serviceId);
}

// Format price with currency symbol
export function formatPrice(amount: number): string {
  return `${CURRENCY.symbol}${amount}`;
}
