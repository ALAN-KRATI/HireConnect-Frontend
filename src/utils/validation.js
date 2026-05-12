// Validation utilities for frontend forms
export const validators = {
  required: (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  minLength: (value, minLength, fieldName = 'This field') => {
    if (!value) return null;
    if (value.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters long`;
    }
    return null;
  },

  maxLength: (value, maxLength, fieldName = 'This field') => {
    if (!value) return null;
    if (value.length > maxLength) {
      return `${fieldName} cannot exceed ${maxLength} characters`;
    }
    return null;
  },

  password: (value) => {
    if (!value) return null;
    if (value.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return 'Password must contain uppercase, lowercase, number, and special character';
    }
    return null;
  },

  confirmPassword: (value, originalPassword) => {
    if (!value) return null;
    if (value !== originalPassword) {
      return 'Passwords do not match';
    }
    return null;
  },

  mobile: (value) => {
    if (!value) return null;
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(value)) {
      return 'Please enter a valid 10-digit Indian mobile number starting with 6-9';
    }
    return null;
  },

  salary: (value, type = 'salary') => {
    if (!value) return null;
    const numValue = Number(value);
    if (isNaN(numValue) || numValue <= 0) {
      return `${type} must be a positive number greater than 0`;
    }
    return null;
  },

  salaryRange: (minSalary, maxSalary) => {
    if (!minSalary || !maxSalary) return null;
    const min = Number(minSalary);
    const max = Number(maxSalary);
    if (min >= max) {
      return 'Maximum salary must be greater than minimum salary';
    }
    return null;
  },

  experience: (value) => {
    if (!value && value !== 0) return null;
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) {
      return 'Experience must be a non-negative number';
    }
    return null;
  },

  arrayMinLength: (array, minLength, fieldName = 'This field') => {
    if (!array || array.length < minLength) {
      return `${fieldName} must have at least ${minLength} item${minLength > 1 ? 's' : ''}`;
    }
    return null;
  },

  description: (value) => {
    if (!value) return null;
    if (value.length < 20) {
      return 'Description must be at least 20 characters long';
    }
    if (value.length > 5000) {
      return 'Description cannot exceed 5000 characters';
    }
    return null;
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  numeric: (value, fieldName = 'This field') => {
    if (!value) return null;
    if (isNaN(Number(value))) {
      return `${fieldName} must be a valid number`;
    }
    return null;
  }
};

// Validation schema builder
export const createValidationSchema = (schema) => {
  return (formData) => {
    const errors = {};

    Object.keys(schema).forEach(field => {
      const fieldValidators = schema[field];
      const value = formData[field];

      for (const validator of fieldValidators) {
        const error = validator(value, formData);
        if (error) {
          errors[field] = error;
          break; // Stop at first error for this field
        }
      }
    });

    return errors;
  };
};

// Common validation schemas
export const validationSchemas = {
  login: {
    email: [validators.required, validators.email],
    password: [validators.required, validators.minLength.bind(null, 8, 'Password')]
  },

  register: {
    fullName: [validators.required, validators.minLength.bind(null, 2, 'Full name')],
    email: [validators.required, validators.email],
    password: [validators.required, validators.password],
    confirmPassword: [(value, formData) => validators.confirmPassword(value, formData.password)],
    mobile: [validators.required, validators.mobile],
    role: [validators.required]
  },

  createJob: {
    title: [validators.required, validators.maxLength.bind(null, 100, 'Job title')],
    description: [validators.required, validators.description],
    category: [validators.required],
    location: [validators.required, validators.maxLength.bind(null, 100, 'Location')],
    type: [validators.required],
    experienceRequired: [validators.required, validators.experience],
    minSalary: [validators.required, validators.salary],
    maxSalary: [
      validators.required,
      validators.salary,
      (value, formData) => validators.salaryRange(formData.minSalary, value)
    ],
    skills: [(value) => validators.arrayMinLength(value, 1, 'Skills')]
  }
};