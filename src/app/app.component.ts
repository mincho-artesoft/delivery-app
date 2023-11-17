import { Component } from '@angular/core';
import { YjsService } from './yjs.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'delivery-project';

  constructor(public yjsService: YjsService, private httpClient: HttpClient) { }

  getSubdocs(orgGuid: string) {
    const subdocs = Object.keys(this.yjsService.documentStructure.subdocs[orgGuid].subdocs || {});

    return subdocs;
  }

  getList() {
    const organizationKeys =  Object.keys(this.yjsService.documentStructure.subdocs || {});
    console.log(organizationKeys);
    
    return organizationKeys
  }

  deleteUser(guid: string) {
    this.httpClient.request('Ydelete', `/profiles?path=${guid}`).subscribe((res: string) => {
      console.log(res);
    });
  }

  addUser(guid: string) {
    const email = "test51@gmail.com" //"test2@gmail.com";

    this.httpClient.post("http://localhost:80/api/invite-user", { email, guid }).subscribe({
      next: (res) => {
        console.log(res);
        
      },
      error: (err) => {
        console.log(err);
        
      }
    }) 
  }
}
