import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { IndexeddbPersistence } from 'y-indexeddb';

import { Doc } from 'yjs';
import { YArray, YMap } from 'yjs/dist/src/internals';
import { AuthService } from './auth/services/auth.service';
import { Observable, Subject, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class YjsService {

  spinner: HTMLElement;
  connected = false;
  documentStructure: { [key: string]: { [key: string]: { [key: string]: any } } };
  public connectedSource = new Subject<boolean>();
  public onConnected = this.connectedSource.asObservable();

  constructor(private authService: AuthService, private jwtService: JwtHelperService, private http: HttpClient) {
  };

  reconnect() {
    return this.http.request('Yreconnect', `initial=true`).pipe(
      tap((res: string) => {
      debugger
      const structure = JSON.parse(res);
      this.documentStructure = Object.keys(structure.structure).length ? structure.structure : { organizations: {} };
      console.log("APP MODULE");
      console.log(structure);
      localStorage.setItem('organizations', JSON.stringify(structure.structure.organizations));
      setTimeout(() => {
        // this.stopSpinner();
        this.connected = true;
        this.connectedSource.next(true)
      }, 500);
    }));
  }

  stopSpinner() {
    (document.querySelector(".spinner") as HTMLElement).style.display = "none";
  }
}
