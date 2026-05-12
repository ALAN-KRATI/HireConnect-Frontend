import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormField, ValidatedInput, ValidatedTextarea, ValidatedSelect, ErrorMessage, SuccessMessage, WarningMessage } from '../FormComponents';

// Mock validation utilities
jest.mock('../../../utils/validation', () => ({
  validators: {
    required: jest.fn((value) => !value ? 'This field is required' : null),
    email: jest.fn((value) => {
      if (!value) return null;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailRegex.test(value) ? 'Please enter a valid email address' : null;
    }),
    minLength: jest.fn((value, minLength) => {
      if (!value) return null;
      return value.length < minLength ? `Must be at least ${minLength} characters long` : null;
    })
  }
}));

describe('FormComponents', () => {
  describe('ErrorMessage', () => {
    it('renders error message when error is provided', () => {
      render(<ErrorMessage error="This is an error" />);
      expect(screen.getByText('This is an error')).toBeInTheDocument();
      expect(document.querySelector('svg')).toBeInTheDocument(); // Error icon
    });

    it('does not render when error is null', () => {
      const { container } = render(<ErrorMessage error={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('SuccessMessage', () => {
    it('renders success message when message is provided', () => {
      render(<SuccessMessage message="Success!" />);
      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(document.querySelector('svg')).toBeInTheDocument(); // Success icon
    });

    it('does not render when message is null', () => {
      const { container } = render(<SuccessMessage message={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('WarningMessage', () => {
    it('renders warning message when warning is provided', () => {
      render(<WarningMessage warning="Warning!" />);
      expect(screen.getByText('Warning!')).toBeInTheDocument();
      expect(document.querySelector('svg')).toBeInTheDocument(); // Warning icon
    });

    it('does not render when warning is null', () => {
      const { container } = render(<WarningMessage warning={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('FormField', () => {
    it('renders label with required asterisk when required is true', () => {
      render(
        <FormField label="Test Field" required>
          <input type="text" />
        </FormField>
      );
      expect(screen.getByText('Test Field')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders error message when error is provided', () => {
      render(
        <FormField label="Test Field" error="Field error">
          <input type="text" />
        </FormField>
      );
      expect(screen.getByText('Field error')).toBeInTheDocument();
    });

    it('renders help text when provided', () => {
      render(
        <FormField label="Test Field" helpText="Helpful information">
          <input type="text" />
        </FormField>
      );
      expect(screen.getByText('Helpful information')).toBeInTheDocument();
    });
  });

  describe('ValidatedInput', () => {
    it('applies error styling when error prop is provided', () => {
      render(
        <ValidatedInput
          type="text"
          value=""
          onChange={() => {}}
          error="This field has an error"
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-300');
      expect(input).toHaveClass('focus:ring-red-500');
    });

    it('applies success styling when success prop is provided', () => {
      render(
        <ValidatedInput
          type="text"
          value="valid value"
          onChange={() => {}}
          success="Valid input"
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-green-300');
      expect(input).toHaveClass('focus:ring-green-500');
    });

    it('renders icon when provided', () => {
      const icon = <span data-testid="test-icon">🔍</span>;
      render(
        <ValidatedInput
          type="text"
          value=""
          onChange={() => {}}
          icon={icon}
        />
      );
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pl-10'); // Padding for icon
    });

    it('handles onChange and onBlur events', () => {
      const handleChange = jest.fn();
      const handleBlur = jest.fn();

      render(
        <ValidatedInput
          type="text"
          value="test"
          onChange={handleChange}
          onBlur={handleBlur}
        />
      );

      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'new value' } });
      expect(handleChange).toHaveBeenCalledWith(expect.any(Object));

      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('ValidatedTextarea', () => {
    it('applies error styling when error prop is provided', () => {
      render(
        <ValidatedTextarea
          value=""
          onChange={() => {}}
          error="Textarea error"
        />
      );
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('border-red-300');
      expect(textarea).toHaveClass('focus:ring-red-500');
    });

    it('handles onChange and onBlur events', () => {
      const handleChange = jest.fn();
      const handleBlur = jest.fn();

      render(
        <ValidatedTextarea
          value="test content"
          onChange={handleChange}
          onBlur={handleBlur}
        />
      );

      const textarea = screen.getByRole('textbox');

      fireEvent.change(textarea, { target: { value: 'new content' } });
      expect(handleChange).toHaveBeenCalledWith(expect.any(Object));

      fireEvent.blur(textarea);
      expect(handleBlur).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('ValidatedSelect', () => {
    it('applies error styling when error prop is provided', () => {
      render(
        <ValidatedSelect
          value=""
          onChange={() => {}}
          error="Select error"
        >
          <option value="">Choose...</option>
          <option value="1">Option 1</option>
        </ValidatedSelect>
      );
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('border-red-300');
      expect(select).toHaveClass('focus:ring-red-500');
    });

    it('handles onChange and onBlur events', () => {
      const handleChange = jest.fn();
      const handleBlur = jest.fn();

      render(
        <ValidatedSelect
          value="1"
          onChange={handleChange}
          onBlur={handleBlur}
        >
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </ValidatedSelect>
      );

      const select = screen.getByRole('combobox');

      fireEvent.change(select, { target: { value: '2' } });
      expect(handleChange).toHaveBeenCalledWith(expect.any(Object));

      fireEvent.blur(select);
      expect(handleBlur).toHaveBeenCalledWith(expect.any(Object));
    });
  });
});