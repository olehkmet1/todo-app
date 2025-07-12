import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class AuthValidators {
  /**
   * Custom email validator
   */
  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Let required validator handle empty values
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(control.value);
      
      return isValid ? null : { invalidEmail: { value: control.value } };
    };
  }

  /**
   * Password strength validator
   */
  static passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Let required validator handle empty values
      }

      const password = control.value;
      const errors: ValidationErrors = {};

      // Check minimum length
      if (password.length < 6) {
        errors['minLength'] = { requiredLength: 6, actualLength: password.length };
      }

      // Check for at least one letter
      if (!/[a-zA-Z]/.test(password)) {
        errors['noLetter'] = true;
      }

      // Check for at least one number
      if (!/\d/.test(password)) {
        errors['noNumber'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * Password confirmation validator
   */
  static passwordMatchValidator(passwordControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Let required validator handle empty values
      }

      const passwordControl = control.parent?.get(passwordControlName);
      if (!passwordControl) {
        return null;
      }

      const password = passwordControl.value;
      const confirmPassword = control.value;

      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  /**
   * Name validator (minimum 2 characters, no special characters)
   */
  static nameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Let required validator handle empty values
      }

      const name = control.value.trim();
      const errors: ValidationErrors = {};

      if (name.length < 2) {
        errors['minLength'] = { requiredLength: 2, actualLength: name.length };
      }

      // Check for valid name characters (letters, spaces, hyphens, apostrophes)
      if (!/^[a-zA-Z\s\-']+$/.test(name)) {
        errors['invalidCharacters'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * Get error message for validation errors
   */
  static getErrorMessage(control: AbstractControl, fieldName: string): string {
    if (!control.errors) {
      return '';
    }

    const errors = control.errors;

    if (errors['required']) {
      return `${fieldName} is required.`;
    }

    if (errors['invalidEmail']) {
      return 'Please enter a valid email address.';
    }

    if (errors['minLength']) {
      return `${fieldName} must be at least ${errors['minLength'].requiredLength} characters long.`;
    }

    if (errors['noLetter']) {
      return 'Password must contain at least one letter.';
    }

    if (errors['noNumber']) {
      return 'Password must contain at least one number.';
    }

    if (errors['passwordMismatch']) {
      return 'Passwords do not match.';
    }

    if (errors['invalidCharacters']) {
      return `${fieldName} contains invalid characters.`;
    }

    return `${fieldName} is invalid.`;
  }
} 