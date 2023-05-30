import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import { AuthProvider } from 'src/app/auth/providers/auth-provider';
import { AuthProviderService } from 'src/app/auth/services/auth-provider.service';
import { EmptyAuthProvider } from '../../providers/empty-auth-provider';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  private authProvider: AuthProvider | null

  loginForm: FormGroup = this.createLoginForm()
  submitted = false;
  loading = false;
  redirect?: string
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    authProviderService: AuthProviderService
  ) {
    this.authProvider = authProviderService.getAuthProvider()
  }

  createLoginForm() {
    return this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    if (this.authProvider === null) {
      this.loginForm.disable()
      let message = "No authentication provider could be retrieved - try page refresh."
      this.errorMessage = message
      return
    }

    if (this.isAuthenticated()) {
      this.router.navigate(['/']);
    }

    this.loginForm = this.createLoginForm() //do we need that?
    this.redirect = this.route.snapshot.queryParams['redirect'];
  }

  private isAuthenticated(): boolean {
    //WTF!!! Throws "ReferenceError: Cannot access uninitialized variable" if no instanceof check
    return this.authProvider?.isAuthenticated()
      || (this.authProvider instanceof EmptyAuthProvider && this.authProvider.isAuthenticated());
  }

  //Add user form actions

  get form(): { [key: string]: AbstractControl<any> } {
    return this.loginForm.controls;
  }

  onSubmit() {

    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authProvider?.login(this.form['username'].value, this.form['password'].value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.router.navigate([this.redirect || "/"]);
          //this.router.navigateByUrl(this.redirect || "/");
        },
        error: (error) => {
          let errorMessage = error.message
          if (error.error?.errors?.length > 0) {
            errorMessage = ""
            error.error.errors.forEach((value: any, index: number) => {
              errorMessage += value.message;
              if (index < error?.error?.errors.length - 1) {
                errorMessage += " | ";
              }
            });
          }
          //this.eventService.emit(new ErrorEvent(errorMessage, null))
          this.errorMessage = errorMessage
          this.loading = false;
        }
      })
  }

}
