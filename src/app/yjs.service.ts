import {Injectable} from '@angular/core';
import {JwtHelperService} from '@auth0/angular-jwt';
import {IndexeddbPersistence} from 'y-indexeddb';

import {Doc} from 'yjs';
import { YArray, YMap } from 'yjs/dist/src/internals';
import {AuthService} from './auth/services/auth.service';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class YjsService {
  
  spinner: HTMLElement;
  connected = false;
  documentStructure: { [key: string]: { [key: string]: { [key: string]: any } } };

  constructor(private authService: AuthService, private jwtService: JwtHelperService) { };
  
  stopSpinner() {
    (document.querySelector(".spinner") as HTMLElement).style.display = "none";
  }
}
