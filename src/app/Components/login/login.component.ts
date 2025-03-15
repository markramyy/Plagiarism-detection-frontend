import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { faUser, faLock, faEnvelope } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent implements OnInit {

  faUser = faUser;
  faLock = faLock;
  faEnvelope = faEnvelope;

  RegistrationForm = new FormGroup({
    username: new FormControl('', [Validators.minLength(3), Validators.required]),
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@!$])[A-Za-z\d@!$]{8,}$/), Validators.required])
  })

  LoginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  })

  ngOnInit(): void {

  }

  @ViewChild('box') box!: ElementRef;
  @ViewChild('registerBtn') registerBtn!: ElementRef;
  @ViewChild('loginBtn') loginBtn!: ElementRef;

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

  registrationSubmit() {
    if (this.RegistrationForm.valid) {
      console.log('Form Submitted!', this.RegistrationForm.value);
    } else {
      console.log('Form is invalid');
    }
  }

  loginSubmit() {
    if (this.LoginForm.valid) {
      console.log('Form Submitted!', this.LoginForm.value);
    } else {
      console.log('Form is invalid');
    }
  }

}
