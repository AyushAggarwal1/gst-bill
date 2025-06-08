import { useState, useCallback } from 'react';
import { validateGSTINFormat, verifyGSTINOnline, GSTVerificationResponse } from '@/lib/gst-validator';

interface UseGSTValidationOptions {
  enableOnlineVerification?: boolean;
  apiKey?: string;
  provider?: 'format-only' | 'knowyourgst' | 'cashfree' | 'decentro' | 'official';
  autoValidate?: boolean;
}

interface UseGSTValidationReturn {
  gstin: string;
  setGstin: (value: string) => void;
  validationResult: GSTVerificationResponse | null;
  isValidating: boolean;
  validate: () => Promise<void>;
  reset: () => void;
  isValid: boolean;
  errors: string[];
}

export function useGSTValidation(options: UseGSTValidationOptions = {}): UseGSTValidationReturn {
  const {
    enableOnlineVerification = false,
    apiKey,
    provider = 'format-only',
    autoValidate = false
  } = options;

  const [gstin, setGstinState] = useState('');
  const [validationResult, setValidationResult] = useState<GSTVerificationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(async () => {
    if (!gstin.trim()) {
      setValidationResult({
        isValid: false,
        errors: ['GSTIN is required']
      });
      return;
    }

    setIsValidating(true);
    
    try {
      let result: GSTVerificationResponse;

      if (enableOnlineVerification && apiKey) {
        // Online verification
        result = await verifyGSTINOnline(gstin, apiKey);
      } else {
        // Format validation only
        const formatValidation = validateGSTINFormat(gstin);
        result = {
          isValid: formatValidation.isValid,
          gstin: formatValidation.isValid ? gstin.replace(/\s/g, '').toUpperCase() : undefined,
          stateCode: formatValidation.stateCode,
          stateName: formatValidation.stateName,
          panNumber: formatValidation.panNumber,
          entityNumber: formatValidation.entityNumber,
          checksum: formatValidation.checksum,
          errors: formatValidation.errors,
          verificationMethod: 'format-validation-only'
        };
      }

      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    } finally {
      setIsValidating(false);
    }
  }, [gstin, enableOnlineVerification, apiKey, provider]);

  const setGstin = useCallback((value: string) => {
    setGstinState(value);
    setValidationResult(null);
    
    // Auto-validate if enabled and value is complete
    if (autoValidate && value.replace(/\s/g, '').length === 15) {
      setTimeout(() => validate(), 300); // Debounce
    }
  }, [autoValidate, validate]);

  const reset = useCallback(() => {
    setGstinState('');
    setValidationResult(null);
    setIsValidating(false);
  }, []);

  return {
    gstin,
    setGstin,
    validationResult,
    isValidating,
    validate,
    reset,
    isValid: validationResult?.isValid ?? false,
    errors: validationResult?.errors ?? []
  };
} 