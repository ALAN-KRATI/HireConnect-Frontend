import { useState, useCallback } from 'react';
import { createValidationSchema } from '../utils/validation';

// Custom hook for form validation
export const useFormValidation = (validationSchema) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback((formData) => {
    const validator = createValidationSchema(validationSchema);
    const validationErrors = validator(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [validationSchema]);

  const validateField = useCallback((fieldName, value, formData = {}) => {
    const fieldValidators = validationSchema[fieldName];
    if (!fieldValidators) return;

    for (const validator of fieldValidators) {
      const error = validator(value, formData);
      if (error) {
        setErrors(prev => ({ ...prev, [fieldName]: error }));
        return false;
      }
    }

    setErrors(prev => ({ ...prev, [fieldName]: null }));
    return true;
  }, [validationSchema]);

  const handleBlur = useCallback((fieldName, value, formData = {}) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, value, formData);
  }, [validateField]);

  const handleChange = useCallback((fieldName, value, formData = {}) => {
    // Clear error when user starts typing (if field was touched)
    if (touched[fieldName] && errors[fieldName]) {
      validateField(fieldName, value, formData);
    }
  }, [touched, errors, validateField]);

  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const setFieldError = useCallback((fieldName, error) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, []);

  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => ({ ...prev, [fieldName]: null }));
  }, []);

  const handleSubmit = useCallback(async (formData, submitFunction) => {
    setIsSubmitting(true);

    // Validate all fields
    const isValid = validate(formData);

    if (!isValid) {
      setIsSubmitting(false);
      // Mark all fields as touched to show errors
      const allTouched = Object.keys(validationSchema).reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {});
      setTouched(allTouched);
      return { success: false, errors };
    }

    try {
      const result = await submitFunction(formData);
      setIsSubmitting(false);
      return { success: true, data: result };
    } catch (error) {
      setIsSubmitting(false);

      // Handle server validation errors
      if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.field] = err.message;
        });
        setErrors(serverErrors);
        return { success: false, errors: serverErrors };
      }

      // Handle general server error
      const generalError = error.response?.data?.message || 'An unexpected error occurred';
      setErrors({ general: generalError });
      return { success: false, errors: { general: generalError } };
    }
  }, [validate, validationSchema, errors]);

  return {
    errors,
    touched,
    isSubmitting,
    validate,
    validateField,
    handleBlur,
    handleChange,
    resetValidation,
    setFieldError,
    clearFieldError,
    handleSubmit,
    hasErrors: Object.keys(errors).some(key => errors[key]),
    isValid: Object.keys(errors).every(key => !errors[key])
  };
};

// Hook for real-time validation feedback
export const useValidationFeedback = (fieldName, value, validationRules, formData = {}) => {
  const [error, setError] = useState(null);
  const [isValid, setIsValid] = useState(null);

  const validate = useCallback(() => {
    if (!validationRules || validationRules.length === 0) {
      setError(null);
      setIsValid(null);
      return;
    }

    for (const validator of validationRules) {
      const validationError = validator(value, formData);
      if (validationError) {
        setError(validationError);
        setIsValid(false);
        return;
      }
    }

    setError(null);
    setIsValid(true);
  }, [value, validationRules, formData]);

  // Auto-validate on value change
  React.useEffect(() => {
    validate();
  }, [validate]);

  return { error, isValid, validate };
};