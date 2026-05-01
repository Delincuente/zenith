/**
 * Formats a date string to "DD-MM-YYYY HH:MM AM/PM (IST)"
 * @param {string|Date} dateString 
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';

  try {
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    };

    const formatter = new Intl.DateTimeFormat('en-IN', options);
    const parts = formatter.formatToParts(date);
    
    const getPart = (type) => parts.find(p => p.type === type)?.value || '';
    
    const day = getPart('day');
    const month = getPart('month');
    const year = getPart('year');
    const hour = getPart('hour');
    const minute = getPart('minute');
    const dayPeriod = getPart('dayPeriod').toUpperCase();
    
    return `${day}-${month}-${year} ${hour}:${minute} ${dayPeriod} (IST)`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
};
