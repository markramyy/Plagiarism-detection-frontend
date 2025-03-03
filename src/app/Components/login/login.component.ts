import { Component, ElementRef, ViewChild } from '@angular/core';
import { faUser, faLock, faEnvelope } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {

  faUser = faUser;
  faLock = faLock;
  faEnvelope = faEnvelope;

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
}
