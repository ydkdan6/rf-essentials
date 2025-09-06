// paystack.ts - Updated Paystack integration
export interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  callback: (response: any) => void;
  onClose?: () => void;
}

export const initializePaystack = (config: PaystackConfig): Promise<void> => {
  return new Promise((resolve, reject) => {
    const setupPaystack = () => {
      try {
        // Ensure callback is properly bound
        const callbackWrapper = function(response: any) {
          try {
            config.callback(response);
          } catch (error) {
            console.error('Error in payment callback:', error);
          }
        };

        const onCloseWrapper = function() {
          try {
            if (config.onClose) {
              config.onClose();
            }
          } catch (error) {
            console.error('Error in onClose callback:', error);
          }
        };

        const paystackConfig = {
          key: config.key,
          email: config.email,
          amount: Math.round(config.amount * 100), // Convert to kobo and ensure integer
          currency: config.currency || 'NGN',
          ref: config.ref || generatePaymentReference(),
          callback: callbackWrapper,
          onClose: onCloseWrapper,
        };

        console.log('Paystack config:', paystackConfig);

        const handler = (window as any).PaystackPop.setup(paystackConfig);
        handler.openIframe();
        resolve();
      } catch (error) {
        console.error('Error initializing Paystack:', error);
        reject(error);
      }
    };

    // Check if Paystack is already loaded
    if ((window as any).PaystackPop) {
      setupPaystack();
      return;
    }

    // Load Paystack script if not already loaded
    const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    
    script.onload = () => {
      // Small delay to ensure script is fully loaded
      setTimeout(setupPaystack, 100);
    };

    script.onerror = (error) => {
      console.error('Error loading Paystack script:', error);
      reject(new Error('Failed to load Paystack script'));
    };

    document.head.appendChild(script);
  });
};

export const generatePaymentReference = () => {
  return `rf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};