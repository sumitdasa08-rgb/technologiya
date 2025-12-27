// Cookie utility functions for storing customer info

export interface CustomerInfo {
  name: string;
  phone: string;
}

const COOKIE_NAME = 'pc_repair_customer';
const COOKIE_EXPIRY_DAYS = 365;

export const setCustomerCookie = (customerInfo: CustomerInfo): void => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);
  
  const cookieValue = encodeURIComponent(JSON.stringify(customerInfo));
  document.cookie = `${COOKIE_NAME}=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
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
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};
