
/**
 * Formats a phone number for WhatsApp links.
 * Specifically handles Nigerian numbers starting with '0' by converting them to '234'.
 * 
 * @param phone The phone number string
 * @returns The formatted number suitable for wa.me links
 */
export const formatWhatsAppNumber = (phone: string): string => {
    if (!phone) return '';

    // Remove all non-numeric characters
    let cleaned = phone.replace(/[^0-9]/g, '');

    // Handle Nigerian numbers starting with '0'
    // Nigeria numbers are typically 11 digits starting with '0' (e.g., 070, 080, 081, 090, 091)
    if (cleaned.startsWith('0') && cleaned.length === 11) {
        cleaned = '234' + cleaned.substring(1);
    }

    // If it starts with +234, ensure it doesn't have the +
    if (phone.startsWith('+234')) {
        cleaned = phone.replace(/[^0-9]/g, '');
    }

    return cleaned;
};

/**
 * Generates a full WhatsApp link for a given number.
 * 
 * @param phone The phone number
 * @param message Optional message to pre-fill
 * @returns The full https://wa.me/ URL
 */
export const getWhatsAppUrl = (phone: string, message?: string): string => {
    const formatted = formatWhatsAppNumber(phone);
    if (!formatted) return '';

    let url = `https://wa.me/${formatted}`;
    if (message) {
        url += `?text=${encodeURIComponent(message)}`;
    }
    return url;
};
