import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import { AuthProvider } from 'src/app/auth/providers/auth-provider';
import { AuthProviderService } from 'src/app/auth/services/auth-provider.service';
import { EmptyAuthProvider } from '../../providers/empty-auth-provider';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./login.component.scss'],
  imports: [LogoComponent, ReactiveFormsModule, NgClass],
})
export class LoginComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authProviderService = inject(AuthProviderService);

  private authProvider: AuthProvider | null;

  loginForm: FormGroup = this.createLoginForm();
  submitted = signal(false);
  loading = signal(false);
  errorMessage = signal('');
  private redirect?: string;

  constructor() {
    const authProviderService = this.authProviderService;

    this.authProvider = authProviderService.getAuthProvider();
  }

  createLoginForm() {
    return this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    if (this.authProvider === null) {
      this.loginForm.disable();
      const message =
        this.authProviderService.getError()?.message ||
        'No authentication provider could be retrieved - try page refresh.';
      this.errorMessage.set(message);
      return;
    }

    if (this.isAuthenticated()) {
      this.router.navigate(['/']);
    }

    this.redirect = this.route.snapshot.queryParams['redirect'];
  }

  private isAuthenticated(): boolean {
    //WTF!!! Throws "ReferenceError: Cannot access uninitialized variable" if no instanceof check
    return (
      this.authProvider?.isAuthenticated() ||
      (this.authProvider instanceof EmptyAuthProvider && this.authProvider.isAuthenticated())
    );
  }

  get form(): Record<string, AbstractControl> {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted.set(true);
    if (this.loginForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.authProvider
      ?.login(this.form['username'].value, this.form['password'].value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.router.navigate([this.redirect || '/']);
        },
        error: (error) => {
          let errorMessage = error.message;
          if (error.error?.errors?.length > 0) {
            errorMessage = '';
            error.error.errors.forEach((value: { message: string }, index: number) => {
              errorMessage += value.message;
              if (index < error?.error?.errors.length - 1) {
                errorMessage += ' | ';
              }
            });
          }
          this.errorMessage.set(errorMessage);
          this.loading.set(false);
        },
      });
  }
}
