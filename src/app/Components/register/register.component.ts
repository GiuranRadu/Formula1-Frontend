import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { countries } from 'countries-list';
import { AuthService } from 'src/app/Services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  userForm: FormGroup;
  countryList: any[];
  teamsAvailable: any = ["Mercedes", "Alpine", "Haas F1 Team", "Red Bull Racing", "McLaren", "Aston Martin", "Ferrari", "Kick Sauber", "Williams", "AlphaTauri", "Renault", "Alfa Romeo"];

  constructor(private router: Router, private AS: AuthService, private spinner: NgxSpinnerService) { }


  ngOnInit(): void {
    this.userForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.pattern('^[A-Za-z]+(?: [A-Za-z]+)?$')
      ]),
      age: new FormControl('', [Validators.required, this.ageRangeValidator]),
      team: new FormControl(''),
      country: new FormControl(''),
      email: new FormControl('', [Validators.required, this.emailFormat]),
      password: new FormControl('', [Validators.required, this.passwordFormat]),
      confirmPassword: new FormControl('', [Validators.required]),
    }, { validators: this.passwordMatchValidator })

    this.countryList = this.getCountries();

  }

  emailFormat(control: FormControl) {
    let myRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!myRegex.test(control.value)) {
      // validMail = VALIDATOR!!!!! 
      return { validMail: true }
    }
    return null;
  }

  passwordFormat(control: FormControl) {
    let myRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!myRegex.test(control.value)) {
      // validPassword = VALIDATOR!!!!! 
      return { validPassword: true }
    }
    return null;
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { mismatch: true };
  }

  ageRangeValidator(control: AbstractControl): ValidationErrors {
    const age = control.value;
    if (age < 18 || age > 85) {
      return { ageRange: true };
    }
    return null;
  }

  getCountries(): any[] {
    const countriesArray = [];
    for (const code in countries) {
      if (countries.hasOwnProperty(code)) {
        countriesArray.push({ code, name: countries[code].name });
      }
    }
    return countriesArray;
  }

  picture: any;
  getFile(event: any) {
    // console.log(event.target.files);
    this.picture = event.target.files[0]
  }

  addedPicture: any;
  registerUser() {
    this.spinner.show();

    if (this.picture) {
      const formData = new FormData();
      formData.append("picture", this.picture);

      this.AS.uploadImage(formData).subscribe((response) => {
        this.addedPicture = response.image_url;
        const formWithPicture = { ...this.userForm.value, picture: this.addedPicture }

        this.AS.register(formWithPicture).subscribe((response) => {
          setTimeout(() => {
            this.spinner.hide();
            this.jumpToLogin(); //note: Call jumpToLogin() after delaying by 500ms
          }, 2000);


        }, (error) => {
          alert(error.error.message)
          this.spinner.hide();
        })

      })
    }

    if (!this.picture) {
      this.AS.register(this.userForm.value).subscribe((response) => {
        setTimeout(() => {
          this.spinner.hide();
          this.jumpToLogin(); //note: Call jumpToLogin() after delaying by 500ms
        }, 2000);

      }, (error) => {
        alert(error.message)
        this.spinner.hide();
      })
    }
  }


  resetForm() {
    this.userForm.reset()
  }

  jumpToLogin() {
    this.router.navigate(['/login']);
  }
}



