import { Component } from '@angular/core';
import { YjsService } from './yjs.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'delivery-project';

  constructor(public yjsService: YjsService, private httpClient: HttpClient) { }

  getSubdocs(orgGuid: string) {
    const subdocs = Object.keys(this.yjsService.documentStructure[orgGuid].subdocs || {});

    return subdocs;
  }

  getList() {
    const organizationKeys =  Object.keys(this.yjsService.documentStructure || {});
    
    return organizationKeys
  }

  deleteUser(guid: string) {
    this.httpClient.request('Ydelete', `/profiles?path=${guid}`).subscribe((res: string) => {
      console.log(res);
    });
  }
  formGroup = new FormGroup({
    name: new FormControl(""),
  })
  shouldShow = false;
  showEmployees = false;
  createTeam(orgGuid: string) {
    console.log(this.formGroup.value);
    this.httpClient.request('Ypost', `/teams?path=${orgGuid}`, { body: { ...this.formGroup.value } }).subscribe((res: string) => {
      console.log(res);
    });
  }

  addUserToTeam(teamGuid: string, employeeGuid: string) {
    this.httpClient.request('Ypost', `/teams?path=${teamGuid}&profile=${employeeGuid}`, { body: { ...this.formGroup.value } }).subscribe((res: string) => {
      console.log(res);
    });
  }

  deleteTeam(guid: string) {
    this.httpClient.request('Ydelete', `/teams?path=${guid}`).subscribe((res: string) => {
      console.log(res);
    });
  }

  addServiceToEmployee(profileGuid: string, guids: string[]) {
    const warehouseGuid = guids.find(guid => guid.endsWith("warehouse"));
    this.httpClient.request('Ypost', `/profiles?path=${profileGuid}&service=${warehouseGuid}`).subscribe((res: string) => {
      console.log(res);
    });
  }

  deleteServiceFrom(employeeGuid: string, serviceGuid: string) {
    debugger
    this.httpClient.request('Ydelete', `/profiles?path=${employeeGuid}&service=${serviceGuid}`).subscribe((res: string) => {
      console.log(res);
    });
  }

  // isEmployeeAlreadyInTeam(employeeGuid: string, path: string) {
  //   return getNe
  // }

  getNested (path: string, from?: string) {
    const pathArr = path.split('&');
    const result = pathArr.reduce((obj, key, index) => {
      //@ts-ignore
      return (obj && obj[key] !== 'undefined') ? (typeof obj[key] === 'function' ? obj[key]() : obj[key]) : undefined;
    }, this.yjsService.documentStructure);
    if(result) {
      return Object.keys(result);
    }

    return [];
  };

  addUser(guid: string) {
    const email = "test51@gmail.com";//"test2@gmail.com" 

    this.httpClient.post("http://localhost:80/api/invite-user", { email, guid }).subscribe({
      next: (res) => {
        console.log(res);
        
      },
      error: (err) => {
        console.log(err);
        
      }
    }) 
  }

  getServices() {
    //8qP3FS2jgo.jnkqjndkjsbqshjdjhqbsdjhsqjjhqsbjd12311231.organization
    this.httpClient.request('Yget', `/services?path=ZtlYsEYasf.jnkqjndkjsbqshjdjhqbsdjhsqjjhqsbjd12311231123123.organization`).subscribe((res: string) => {
      console.log(JSON.parse(res));
    });

  }
  addService() {
    //8qP3FS2jgo.jnkqjndkjsbqshjdjhqbsdjhsqjjhqsbjd12311231.organization
    this.httpClient.request('Ypost', `/services?path=ZtlYsEYasf.jnkqjndkjsbqshjdjhqbsdjhsqjjhqsbjd12311231123123.organization`, { body: { data: "some data"}}).subscribe((res: string) => {
      console.log(JSON.parse(res));
    });
  }
  deleteService() {
    this.httpClient.request('Ydelete', `/services?path=6581b68a-8618-4181-ad66-25a22e90dcd3.ZtlYsEYasf.service`).subscribe((res: string) => {
      console.log(JSON.parse(res));
    });
  }
}