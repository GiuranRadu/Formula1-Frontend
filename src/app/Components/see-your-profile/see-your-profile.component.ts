import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from 'src/app/Services/auth.service';
import { countries } from 'countries-list';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';



@Component({
  selector: 'app-see-your-profile',
  templateUrl: './see-your-profile.component.html',
  styleUrls: ['./see-your-profile.component.css']
})
export class SeeYourProfileComponent implements OnInit {

  token: any;
  loggedUserId: any
  loggedUser: any
  circuitsAttended: any[];
  userForm: FormGroup;
  countryList: any[];


  constructor(private cookies: CookieService, private AS: AuthService, private router: Router, public dialog: MatDialog, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.token = this.cookies.get("token");
    this.getLoggedUserDetails();

    this.AS.getCurrentDataOfUser(this.loggedUserId, this.token).subscribe((result) => {
      this.loggedUser = result.data.user;
      this.circuitsAttended = result.data.user.circuits
    })

    this.userForm = new FormGroup({
      name: new FormControl(''),
      age: new FormControl(''),
      country: new FormControl(''),
      email: new FormControl(''),
      picture: new FormControl('')
    })

    this.countryList = this.getCountries();
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


  getLoggedUserDetails() { //! return user data from DB from LOGIN moment
    const userDataString = this.cookies.get('loggedUser');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.loggedUserId = userData._id;
    } else {
      console.log('No users logged');
    }
  }


  sanitizePicturePath(path: string) {
    const filenameArray = path.split('\\'); // Use double backslashes for the path separator
    const filename = filenameArray[filenameArray.length - 1];
    return filename
  }


  picture: File | undefined;
  getFile(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.picture = event.target.files[0];
    }
  }

  addedPicture: any;
  updateUser() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { title: 'Confirmation', message: `Do you want to update? ` }
    });

    dialogRef.afterClosed().subscribe(confirmation => {
      if (confirmation) {
        this.spinner.show();
        //* check if picture has been updated
        if (this.userForm.value.picture) {
          const formData = new FormData();
          formData.append("picture", this.picture);
          this.AS.uploadImage(formData).subscribe((response) => {
            this.addedPicture = response.image_url;
            const formWithPicture = { ...this.userForm.value, picture: this.addedPicture }

            this.AS.updateCurrentUserData(this.loggedUserId, formWithPicture, this.token).subscribe((response) => {
              this.spinner.hide();
              location.reload();
            }, (error) => {
              alert(error.message);
              this.spinner.hide();
            })
          })
          //* if picture did not change
        } else {
          this.AS.updateCurrentUserData(this.loggedUserId, this.userForm.value, this.token).subscribe((response) => {
            this.spinner.hide();
            location.reload();
          }, (error) => {
            alert(error.message);
            this.spinner.hide();
          })
        }
      } else {
        console.log('User aborted');
      }
    })
  }


  switch: boolean = false
  @ViewChild("changePasswordButton") changePasswordButton: ElementRef
  wannaChangePassword() {
    this.switch = !this.switch;
    if (this.switch) {
      this.changePasswordButton.nativeElement.innerHTML = "Cancel"
    } else {
      this.changePasswordButton.nativeElement.innerHTML = "Wanna Change Password?"
    }
  }


  cancel() {
    this.switch = false;
  }


  resetForm() {
    this.userForm.reset()
  }


  wannaChangeCircuits() {
    this.router.navigate(['/main/selectCircuits']);
  }


}
