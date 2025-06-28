import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  editMode = false;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  userProfile: any = null;
  userStats: any = null;
  recentActivity: any[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadUserStats();
    this.loadRecentActivity();
  }

  initializeForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  loadUserProfile(): void {
    // Mock data - replace with actual API call
    this.userProfile = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      username: 'johndoe',
      date_joined: new Date('2024-01-15')
    };

    // Populate form with current values
    this.profileForm.patchValue({
      firstName: this.userProfile.first_name,
      lastName: this.userProfile.last_name,
      email: this.userProfile.email,
      username: this.userProfile.username
    });
  }

  loadUserStats(): void {
    // Mock data - replace with actual API call
    this.userStats = {
      totalReports: 45,
      thisMonth: 12,
      highRiskReports: 8,
      avgProcessingTime: '2.3'
    };
  }

  loadRecentActivity(): void {
    // Mock data - replace with actual API call
    this.recentActivity = [
      {
        icon: 'fas fa-file-alt',
        description: 'Created new plagiarism report',
        timestamp: new Date('2024-12-27T10:30:00')
      },
      {
        icon: 'fas fa-download',
        description: 'Downloaded report PDF',
        timestamp: new Date('2024-12-26T15:45:00')
      },
      {
        icon: 'fas fa-user-edit',
        description: 'Updated profile information',
        timestamp: new Date('2024-12-25T09:15:00')
      }
    ];
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      const formData = this.profileForm.value;
      console.log('Saving profile:', formData);

      // Update local profile data
      this.userProfile = {
        ...this.userProfile,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        username: formData.username
      };

      this.editMode = false;
      // Here you would make an API call to save the profile
      // this.authService.updateProfile(formData).subscribe(...)
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      const passwords = this.passwordForm.value;

      if (passwords.newPassword !== passwords.confirmPassword) {
        alert('New passwords do not match!');
        return;
      }

      console.log('Changing password...');
      // Here you would make an API call to change password
      // this.authService.changePassword(passwords).subscribe(...)

      this.passwordForm.reset();
      alert('Password changed successfully!');
    }
  }
}
