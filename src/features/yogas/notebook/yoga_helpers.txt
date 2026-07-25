// Helper function for yoga evaluations
// Helper function for yoga evaluations
window.YOGA_HELPERS = {
  getSignLord: function(signName) {
    const signIndex = window.ASTRO_CONSTANTS.SIGNS.indexOf(signName);
    return window.ASTRO_CONSTANTS.SIGN_LORDS[signIndex] || 'Unknown';
  }
};

// Global helper for yogas
function getSignLord(signName) {
  const signIndex = window.ASTRO_CONSTANTS.SIGNS.indexOf(signName);
  return window.ASTRO_CONSTANTS.SIGN_LORDS[signIndex] || 'Unknown';
}
