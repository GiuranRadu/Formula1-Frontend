import { Component, ElementRef, Input, OnInit, Query, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AddRemoveCircuitsService } from 'src/app/Services/add-remove-circuits.service';
import { AuthService } from 'src/app/Services/auth.service';
import { CircuitsService } from 'src/app/Services/circuits.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-select-circuits',
  templateUrl: './select-circuits.component.html',
  styleUrls: ['./select-circuits.component.css'],

})
export class SelectCircuitsComponent implements OnInit {


  @Input() loggedUser!: any;
  allDbCircuits: any = [];
  usersCircuits: any = [];
  availableCircuits: any = [];
  token: any;
  @ViewChildren("availableCircuitsDivs") availableCircuitsDivs: QueryList<ElementRef>;
  switch: boolean = false;
  selectedCircuitIndex: number | null = null;
  inputValue: string = '';


  constructor(private CS: CircuitsService, private cookies: CookieService, private addRemoveService: AddRemoveCircuitsService, private AS: AuthService, public dialog: MatDialog, private spinner: NgxSpinnerService, private route: ActivatedRoute) { }


  //* This solution will always load the data in needed order
  ngOnInit() {

    this.token = this.cookies.get("token");

    //! Get all Circuits from DB
    this.CS.getAllCircuits(this.token).subscribe(
      (result) => {
        this.allDbCircuits = result.data.circuits;

        //! Get the logged user actualized data 
        this.AS.getCurrentDataOfUser(this.loggedUser?._id ? this.loggedUser._id : this.route.snapshot.paramMap.get('id'), this.token).subscribe(
          (userResult) => {
            this.usersCircuits = userResult.data.user.circuits;

            //! Update availableCircuits only after both allDbCircuits and usersCircuits have been fetched
            this.availableCircuits = this.allDbCircuits.filter(
              (dbCircuit: any) => !this.usersCircuits.some((userCircuit: any) => userCircuit._id === dbCircuit._id)
            );
          },
          (userError) => {
            console.log("Error fetching user data", userError);
          }
        );
      },
      (error) => {
        console.log("Error fetching all circuits", error);
      }
    );

    this.getLoggedUserDetails();
  }


  getLoggedUserDetails() { //! return user data from DB from LOGIN moment
    const userDataString = this.cookies.get('loggedUser');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      if (userData.role === 'limited') {
        this.loggedUser = userData;
      }
      return
    } else {
      console.log('No users logged');
    }
  }


  selectCircuit(index: number) {
    this.selectedCircuitIndex = index;
    this.switch = true;
  }

  @ViewChild('updateButton') updateButton: ElementRef<any>

  addToUserCircuits(circuit: any, index: number) {
    if (this.inputValue) {
      let updatedCircuit = { ...circuit, completionTime: this.inputValue }
      console.log(updatedCircuit);
      this.usersCircuits.push(updatedCircuit);
      this.availableCircuits.splice(index, 1)
      this.updateButton.nativeElement.classList.add('glow');
      this.cancel();
    } else {
      console.log('No VALUE');
    }
    this.inputValue = undefined;
  }


  remove(circuit: any, index: any) {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirmation',
        message: `Delete ${circuit.name} ?`,
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.usersCircuits.splice(index, 1);
        this.availableCircuits.push(circuit);
        this.updateButton.nativeElement.classList.add('glow');
      } else {
        console.log('Operation canceled by the user.');
      }
    })
  }


  cancel() {
    this.selectedCircuitIndex = null;
    this.switch = false;
  }


  updateUserCircuitsInDABATASE() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirmation',
        message: `Update in Database ? `
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.updateButton.nativeElement.classList.remove('glow');
        this.showSpinner(1500)
        this.addRemoveService.addCircuitToArray(this.loggedUser._id, this.usersCircuits, this.token).subscribe(
          (addResponse) => {
            // console.log("Circuits added", addResponse);
            //! After adding, now remove circuits
            this.addRemoveService.removeCircuitFromArray(this.loggedUser._id, this.availableCircuits, this.token).subscribe(
              (removeResponse) => {
                // console.log("Circuits removed successfully", removeResponse);

                //! Do anything else you need after both add and remove operations
                // console.log(this.availableCircuits);
              },
              (removeError) => {
                console.log("Error removing circuits", removeError);
              }
            );
          },
          (addError) => {
            console.log("Error adding circuits", addError);
          }
        );
      } else {
        console.log('Operation canceled by the user.');
      }
    })

  }


  test() {

  }

  showSpinner(time: any) {
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, time)
  }


}
