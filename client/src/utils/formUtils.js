/**
 * Automatically focuses and scrolls to the first element with a validation error.
 * @param {object} errors - The fieldErrors object
 */
export const focusFirstError = (errors) => {
  if (!errors || Object.keys(errors).length === 0) return;
  
  // Get all keys that have errors
  const errorKeys = Object.keys(errors);
  
  // We want to find the first error in the DOM order, not just the first key in the object.
  // However, usually the first key added is the first one found in validation.
  // To be safe, we can iterate and find the one that exists in the DOM.
  
  for (const key of errorKeys) {
    if (!errors[key]) continue;

    // Try finding by name or id
    const element = document.getElementsByName(key)[0] || document.getElementById(key);
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Delay focus slightly to allow scroll to start/finish smoothly in some browsers
      setTimeout(() => {
        element.focus({ preventScroll: true });
      }, 100);
      
      break; // Only focus the first one
    }
  }
};
