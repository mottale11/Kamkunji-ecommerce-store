// Currency formatting utilities for Kenyan shillings

/**
 * Formats a number as Kenyan Shillings (KES)
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "KSh 1,234.56")
 */
export function formatKSH(amount: number | string): string {
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Format the number with commas as thousand separators and no decimal places
  return `KSh ${numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
}

/**
 * Formats a number as Kenyan shillings
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export const formatKSHLegacy = (
  amount: number, 
  options: {
    showSymbol?: boolean;
    showDecimals?: boolean;
    compact?: boolean;
  } = {}
): string => {
  const {
    showSymbol = true,
    showDecimals = false,
    compact = false
  } = options;

  let formattedAmount: string;

  if (compact && amount >= 1000000) {
    // Format as millions
    formattedAmount = (amount / 1000000).toFixed(1);
    return `${showSymbol ? 'KSh. ' : ''}${formattedAmount}M`;
  } else if (compact && amount >= 1000) {
    // Format as thousands
    formattedAmount = (amount / 1000).toFixed(1);
    return `${showSymbol ? 'KSh. ' : ''}${formattedAmount}K`;
  } else {
    // Standard formatting
    formattedAmount = showDecimals 
      ? amount.toFixed(2) 
      : Math.round(amount).toString();
    
    // Add thousand separators
    formattedAmount = Number(formattedAmount).toLocaleString('en-KE');
    
    return `${showSymbol ? 'KSh. ' : ''}${formattedAmount}`;
  }
};

/**
 * Format a price range
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @returns Formatted price range string
 */
export const formatPriceRange = (minPrice: number, maxPrice: number): string => {
  if (minPrice === maxPrice) {
    return formatKSHLegacy(minPrice);
  }
  return `${formatKSHLegacy(minPrice)} - ${formatKSHLegacy(maxPrice)}`;
};

/**
 * Calculates and formats a discount percentage
 * @param originalPrice - Original price
 * @param salePrice - Sale/discounted price
 * @returns Formatted discount percentage (e.g., "25% OFF")
 */
export function formatDiscount(originalPrice: number, salePrice: number): string {
  const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  return `${discount}% OFF`;
}

/**
 * Parse a price string back to a number
 * @param priceString - Price string (e.g., "KSh. 1,500")
 * @returns Parsed number or null if invalid
 */
export const parseKSH = (priceString: string): number | null => {
  try {
    // Remove "KSh." and any other non-numeric characters except commas and dots
    const cleanString = priceString.replace(/[^\d,.]/g, '');
    
    // Remove commas and convert to number
    const number = parseFloat(cleanString.replace(/,/g, ''));
    
    return isNaN(number) ? null : number;
  } catch {
    return null;
  }
};

/**
 * Check if a price is within a budget range
 * @param price - Price to check
 * @param minBudget - Minimum budget
 * @param maxBudget - Maximum budget
 * @returns True if price is within budget
 */
export const isWithinBudget = (
  price: number, 
  minBudget: number, 
  maxBudget: number
): boolean => {
  return price >= minBudget && price <= maxBudget;
};

/**
 * Get price tier label
 * @param price - Price amount
 * @returns Price tier label
 */
export const getPriceTier = (price: number): string => {
  if (price < 1000) return 'Budget';
  if (price < 5000) return 'Affordable';
  if (price < 20000) return 'Mid-range';
  if (price < 100000) return 'Premium';
  return 'Luxury';
};
