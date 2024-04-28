import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-header2',
  templateUrl: './header2.component.html',
  styleUrls: ['./header2.component.css']
})
export class Header2Component implements OnInit {


  loggedUser: any = "";



  constructor(private router: Router, private cookieService: CookieService, public dialog: MatDialog) { }
  ngOnInit(): void {
    this.getLoggedUserDetails()
  }


  logoutButton() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirmation',
        message: `Are you sure you want to logout ? `
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {

        this.cookieService.delete('token');
        this.cookieService.delete('loggedUser');
        window.localStorage.clear() //! solves that cookie issue -> Some persistant web sites backup cookies in localStorage

        Swal.fire(`Goodbye ${this.loggedUser.name}!`);
        setTimeout(() => {
          this.router.navigate(['']);
        }, 1500)
      }
    })
  }


  getLoggedUserDetails() {
    const userDataString = this.cookieService.get('loggedUser');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.loggedUser = userData;
    } else {
      console.log('No users logged');
    }
  }

}


