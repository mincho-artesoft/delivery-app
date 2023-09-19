import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  createRestaurantForm!: FormGroup;

  files: File[] = [];

  constructor(
    private formBuilder: FormBuilder,
  ) { }


  ngOnInit() {
    this.buildForm();
  }

  onSelect(event: { addedFiles: any; }) {
    console.log(event);
    this.files.push(...event.addedFiles);
  }

  onRemove(event: File) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }
  private buildForm() {
    this.createRestaurantForm = this.formBuilder.group({
      firstName: new FormControl(),
      lastName: new FormControl(),
      phone: new FormControl(),
      email: new FormControl(),
      city: new FormControl(),
      street: new FormControl(),
      streetNumber: new FormControl(),
      floor: new FormControl(),
      flat: new FormControl(),
    })
  }
  addRestaurantForm() {
    console.log(this.createRestaurantForm.value)
  }
}
