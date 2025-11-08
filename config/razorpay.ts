// Razorpay Payment Configuration
// Test API Keys for Razorpay

export const RAZORPAY_CONFIG = {
  // Razorpay Key ID (Public Key) - Used in client-side integration
  KEY_ID: 'rzp_test_RYnrwnoatPYTfi',
  
  // Razorpay Key Secret (Private Key) - Used in backend for verification
  // Note: This should be stored securely on the backend, not in client code
  KEY_SECRET: 'YE4Qnxo76aGP7ciocbfbg',
  
  // Payment configuration
  CURRENCY: 'INR',
  NAME: 'LaundryPoint',
  THEME_COLOR: '#3b82f6',
};

// Instructions:
// 1. These are TEST keys - for production, use live keys from Razorpay Dashboard
// 2. The Key Secret should NEVER be exposed in client-side code in production
// 3. For production, implement backend verification of payment signatures
// 4. Get your keys from: https://dashboard.razorpay.com/app/keys

