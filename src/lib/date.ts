/**
 * Safely extracts a YYYY-MM-DD string mapped specifically to IST.
 * Uses the en-CA locale as it natively outputs the required ISO format.
 */
export const extractISTDateString = (dateString: string | Date): string => {
  const dateObj = typeof dateString === "string" ? new Date(dateString) : dateString;
  
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(dateObj);
};
