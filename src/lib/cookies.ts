// Cookie utility functions for storing customer info

export interface CustomerInfo {
  name: string;
  phone: string;
  bookingRef?: string;
}

const COOKIE_NAME = 'pc_repair_customer';
const COOKIE_EXPIRY_DAYS = 30; // Reduced from 365 for better security

export const setCustomerCookie = (customerInfo: CustomerInfo): void => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);
  
  const cookieValue = encodeURIComponent(JSON.stringify(customerInfo));
  // Add Secure flag when on HTTPS to prevent transmission over unencrypted HTTP
  const securePart = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_NAME}=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict${securePart}`;
};

export const getCustomerCookie = (): CustomerInfo | null => {
  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === COOKIE_NAME && value) {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch {
        return null;
      }
    }
  }
  
  return null;
};

export const clearCustomerCookie = (): void => {
  const securePart = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict${securePart}`;
};
