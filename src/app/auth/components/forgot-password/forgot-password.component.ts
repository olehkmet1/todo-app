import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth-service';
import { Router } from '@angular/router';
import { IForgotPasswordRequest } from '../../interfaces';
import { AuthValidators } from '../../validators/auth-validators';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, AuthValidators.emailValidator()]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const request: IForgotPasswordRequest = this.forgotPasswordForm.value;

      this.authService.forgotPassword(request).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = response.message || 'Password reset email sent successfully!';
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to send reset email. Please try again.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.forgotPasswordForm.get(controlName);
    if (control) {
      return AuthValidators.getErrorMessage(control, this.getFieldDisplayName(controlName));
    }
    return '';
  }

  private getFieldDisplayName(controlName: string): string {
    const fieldNames: { [key: string]: string } = {
      email: 'Email'
    };
    return fieldNames[controlName] || controlName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.forgotPasswordForm.controls).forEach(key => {
      const control = this.forgotPasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getter for easy template access
  get emailControl() {
    return this.forgotPasswordForm.get('email');
  }
}
