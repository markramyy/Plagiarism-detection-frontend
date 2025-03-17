import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { faUser, faLock, faEnvelope } from '@fortawesome/free-solid-svg-icons';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {

  faUser = faUser;
  faLock = faLock;
  faEnvelope = faEnvelope;

  loginForm: FormGroup;
  registerForm: FormGroup;
  loginError: string = '';

  @ViewChild('box') box!: ElementRef;
  @ViewChild('registerBtn') registerBtn!: ElementRef;
  @ViewChild('loginBtn') loginBtn!: ElementRef;

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
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngAfterViewInit() {
    this.registerBtn.nativeElement.addEventListener('click', this.handleRegisterClick.bind(this));
    this.loginBtn.nativeElement.addEventListener('click', this.handleLoginClick.bind(this));
  }

  handleRegisterClick() {
    this.box.nativeElement.classList.add('active');
  }

  handleLoginClick() {
    this.box.nativeElement.classList.remove('active');
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Login error', err);
          this.loginError = 'Invalid username or password';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onRegister() {
    // You can implement registration logic here later
    console.log('Register form submitted', this.registerForm.value);
  }
}
