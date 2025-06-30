import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService, UserProfile } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  editMode = false;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  userProfile: UserProfile | null = null;
  userStats: any = null;
  recentActivity: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private toastService: ToastService
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
    this.loading = true;
    this.error = null;

    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.loading = false;

        // Populate form with current values
        this.profileForm.patchValue({
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: profile.email || '',
          username: profile.username || ''
        });
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.error = error.message || 'Failed to load user profile';
        this.loading = false;

        // Fallback to mock data for development
        this.loadMockUserProfile();
      }
    });
  }

  private loadMockUserProfile(): void {
    // Fallback mock data for development
    this.userProfile = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      username: 'johndoe',
      guid: 'mock-guid',
      created: '2024-01-15T00:00:00Z',
      modified: '2024-01-15T00:00:00Z',
      last_login: '2024-12-27T00:00:00Z',
      is_active: true,
      date_joined: '2024-01-15T00:00:00Z'
    };

    // Populate form with current values
    this.profileForm.patchValue({
      firstName: this.userProfile.first_name,
      lastName: this.userProfile.last_name,
      email: this.userProfile.email,
      username: this.userProfile.username || ''
    });
  }

  loadUserStats(): void {
    // For now, we'll use the backend statistics endpoint once you create a service for it
    // You can integrate with /report/user-statistics/ endpoint
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
      this.loading = true;
      this.error = null;

      // Only send first_name and last_name as per backend API
      const updateData = {
        first_name: formData.firstName,
        last_name: formData.lastName
      };

      this.userService.updateUserProfile(updateData).subscribe({
        next: (response) => {
          console.log('Profile updated successfully:', response);

          // Update local profile data
          if (this.userProfile) {
            this.userProfile = {
              ...this.userProfile,
              first_name: updateData.first_name,
              last_name: updateData.last_name
            };
          }

          this.editMode = false;
          this.loading = false;

          // Show success message
          this.toastService.showSuccess(response.message || 'Profile updated successfully!');
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          const errorMessage = error.message || 'Failed to update profile';
          this.error = errorMessage;
          this.loading = false;

          // Show error message
          this.toastService.showError(errorMessage);
        }
      });
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      const passwords = this.passwordForm.value;

      if (passwords.newPassword !== passwords.confirmPassword) {
        this.toastService.showError('New passwords do not match!');
        return;
      }

      this.loading = true;
      this.error = null;

      this.userService.changePassword(passwords.currentPassword, passwords.newPassword).subscribe({
        next: (response) => {
          console.log('Password changed successfully:', response);
          this.loading = false;

          // Reset form
          this.passwordForm.reset();

          // Show success message
          this.toastService.showSuccess(response.message || 'Password changed successfully!');

          // Log out the user after password change for security
          setTimeout(() => {
            this.toastService.showInfo('You will be logged out for security. Please log in with your new password.');
            setTimeout(() => {
              this.authService.logout();
            }, 2000); // Give user time to read the message
          }, 1000); // Short delay after success message
        },
        error: (error) => {
          console.error('Error changing password:', error);
          this.loading = false;

          // Extract error message from the response
          let errorMessage = 'Failed to change password';
          if (error.data) {
            if (error.data.current_password) {
              errorMessage = 'Current password is incorrect';
            } else if (error.data.new_password) {
              errorMessage = error.data.new_password[0];
            } else if (error.data.non_field_errors) {
              errorMessage = error.data.non_field_errors[0];
            }
          } else if (error.message) {
            errorMessage = error.message;
          }

          this.toastService.showError(errorMessage);
        }
      });
    }
  }
}
