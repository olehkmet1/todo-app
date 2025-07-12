import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth-service';
import { Router } from '@angular/router';
import { IRegisterRequest } from '../../interfaces';
import { AuthValidators } from '../../validators/auth-validators';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, AuthValidators.nameValidator()]],
      email: ['', [Validators.required, AuthValidators.emailValidator()]],
      password: ['', [Validators.required, AuthValidators.passwordStrengthValidator()]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: [AuthValidators.passwordMatchValidator('password')]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const registerData: IRegisterRequest = this.registerForm.value;

      this.authService.register(registerData).subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (control) {
      return AuthValidators.getErrorMessage(control, this.getFieldDisplayName(controlName));
    }
    return '';
  }

  private getFieldDisplayName(controlName: string): string {
    const fieldNames: { [key: string]: string } = {
      name: 'Full name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password'
    };
    return fieldNames[controlName] || controlName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters for easy template access
  get nameControl() {
    return this.registerForm.get('name');
  }

  get emailControl() {
    return this.registerForm.get('email');
  }

  get passwordControl() {
    return this.registerForm.get('password');
  }

  get confirmPasswordControl() {
    return this.registerForm.get('confirmPassword');
  }
}
