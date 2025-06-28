import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService, ApiError } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements AfterViewInit {
  @ViewChild('box') box!: ElementRef;
  @ViewChild('registerBtn') registerBtn!: ElementRef;
  @ViewChild('loginBtn') loginBtn!: ElementRef;

  loginForm: FormGroup;
  registerForm: FormGroup;
  loginError: string = '';
  registerErrors: { [key: string]: string } = {};
  showRegister: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirm: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngAfterViewInit(): void {
    // Set up toggle functionality
    if (this.registerBtn && this.loginBtn) {
      this.registerBtn.nativeElement.addEventListener('click', () => {
        console.log('Register button clicked');
        this.showRegisterForm();
      });

      this.loginBtn.nativeElement.addEventListener('click', () => {
        console.log('Login button clicked');
        this.showLoginForm();
      });
    }
  }

  showRegisterForm(): void {
    console.log('Showing register form');
    this.showRegister = true;
    if (this.box) {
      this.box.nativeElement.classList.add('active');
    }
    this.clearErrors();
  }

  showLoginForm(): void {
    console.log('Showing login form');
    this.showRegister = false;
    if (this.box) {
      this.box.nativeElement.classList.remove('active');
    }
    this.clearErrors();
  }

  toggleForm(event: Event): void {
    event.preventDefault();
    if (this.showRegister) {
      this.showLoginForm();
    } else {
      this.showRegisterForm();
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('password_confirm');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  clearErrors(): void {
    this.loginError = '';
    this.registerErrors = {};
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: (err: ApiError) => {
          console.error('Login error', err);
          if (err.detail) {
            this.loginError = err.detail;
          } else if (err.non_field_errors) {
            this.loginError = err.non_field_errors[0];
          } else {
            this.loginError = 'Invalid username or password';
          }
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      const registerData = this.registerForm.value;
      this.clearErrors();

      this.authService.register(registerData).subscribe({
        next: (response) => {
          console.log('Registration successful:', response.message);
          // Registration successful - user is automatically authenticated
          this.router.navigate(['/home']);
        },
        error: (err: ApiError) => {
          console.error('Registration error', err);

          // Handle field-specific errors
          if (err.errors) {
            Object.entries(err.errors).forEach(([field, messages]) => {
              this.registerErrors[field] = Array.isArray(messages) ? messages[0] : messages;
            });
          } else if (typeof err === 'object') {
            // Handle other error formats from Django
            Object.entries(err).forEach(([field, messages]) => {
              if (field !== 'detail' && field !== 'code') {
                this.registerErrors[field] = Array.isArray(messages) ? messages[0] : messages;
              }
            });
          }

          // Handle non-field errors
          if (err.non_field_errors) {
            this.registerErrors['general'] = Array.isArray(err.non_field_errors)
              ? err.non_field_errors[0]
              : err.non_field_errors;
          } else if (err.detail) {
            this.registerErrors['general'] = err.detail;
          } else if (Object.keys(this.registerErrors).length === 0) {
            this.registerErrors['general'] = 'Registration failed. Please try again.';
          }
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  hasRegisterError(field: string): boolean {
    return !!this.registerErrors[field];
  }

  getRegisterError(field: string): string {
    return this.registerErrors[field] || '';
  }
}
