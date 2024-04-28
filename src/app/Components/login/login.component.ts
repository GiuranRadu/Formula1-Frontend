import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';




@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(private router: Router, private AS: AuthService, private cookieService: CookieService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl(''),
      password: new FormControl('')
    })
  }

  loginUser() {
    this.spinner.show();
    let loggedUser = this.loginForm.value;

    this.AS.login(loggedUser).subscribe((data) => {
      const token = data.token;
      const userDataString = JSON.stringify(data.data);

      // Clear existing cookies before setting new ones
      this.cookieService.delete('loggedUser');
      this.cookieService.delete('token');

      if (userDataString) {
        this.cookieService.set('loggedUser', userDataString);
        this.cookieService.set('token', token);
      }
      setTimeout(() => {
        this.spinner.hide();
        this.router.navigate(['main']);
      }, 2000)
    },
      (error) => {
        if (error) {
        this.spinner.hide();

          this.showError(error.error.message);
        }
      });
  }



  jumpToRegister() {
    this.router.navigate(['/register']);
  }

  showError(errorTitle: any) {
    Swal.fire({
      title: errorTitle,
      text: 'Some error occurred',
      icon: 'error',
      confirmButtonText: 'Ok'
    })
  }

}
