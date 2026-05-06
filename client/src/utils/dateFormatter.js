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

/**
 * Calculates days remaining until a deadline.
 * @param {string|Date} deadline 
 * @returns {string} Human readable days left
 */
export const getDaysLeft = (deadline) => {
  if (!deadline) return 'No Deadline';
  const target = new Date(deadline);
  const now = new Date();
  
  // Set times to midnight for accurate day calculation
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Due Today';
  return `${diffDays} days left`;
};
