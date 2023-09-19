import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { uuidv4 } from '@firebase/util';

@Component({
  selector: 'app-test-warehouse',
  templateUrl: './test-warehouse.component.html',
})
//TEST COMPONENT ONLY FOR WAREHOUSE ACTIONS
export class TestWarehouseComponent implements OnInit {
  showForm = false;
  isEdit = false;
  currentEditProduct = undefined;

  productName = new FormControl("");
  description = new FormControl("");
  moreInfo = new FormControl("");

  formGroup = new FormGroup({
    productName: this.productName,
    description: this.description,
    moreInfo: this.moreInfo
  })

  warehouseData = [];

  warehouseID: string;
  constructor(private route: ActivatedRoute, private httpClient: HttpClient) {}

  ngOnInit(): void {
    this.route.params.subscribe((param) => {
      this.warehouseID = param['id'];

      this.httpClient
        .request('Yget', `/warehouse?path=${this.warehouseID}`)
        .subscribe((res: any) => {
          const data = JSON.parse(res);
          this.warehouseData = data.structure;
          console.log(data);
        });
    });
  }
  // /warehouses?orgID=uuid (get all items from warehouse)| YJS request - /warehouses?path=orgID
  // /warehouses/edit/uuid?orgID=uuid | YJS request - /warehouse?path=orgID.uuid of item
  // /organizations (list of all organizations)
  // /organizations/ ${action} /uuid of organization (one organization) | YJS request - /organization?path=orgID
  // /profiles-uuid
  // /profiles/${action}/uuid of profile



  handleSubmit() {
    const path = this.isEdit ? `${this.warehouseID}.${this.currentEditProduct._id}` : `${this.warehouseID}.${uuidv4()}`;

    this.httpClient.request('Ypost', `?path=${path}`, { body: { data: this.formGroup.getRawValue() } }).subscribe((res: string) => {
        console.log(JSON.parse(res));
        this.isEdit = false;
        this.showForm = false;
        this.currentEditProduct = undefined;
    })
  }

  editHandler(item: any) {
    this.formGroup.patchValue(item);
    this.currentEditProduct = item;
    this.isEdit = true;
    this.showForm = true;
  }

  deleteHandler(item: any) {
    const path = `${this.warehouseID}.${item._id}`;

    this.httpClient.request('Ydelete', `?path=${path}`).subscribe((res: string) => {
        console.log(JSON.parse(res));
    })
  }
}
