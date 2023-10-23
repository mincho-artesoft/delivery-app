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

  providerIndexedDb?: IndexeddbPersistence;
  provider?: any;
  // socketPath = environment.wsPath;
  socketPath = 'ws://localhost:3001';
  roomName = "room111223";
  
  ydoc = new Doc();
  
  folder?: YMap<Doc>;
  yarray?: YArray<any>;
  
  
  ydocIsRendered$$: Subject<boolean> = new Subject<boolean>();
  ydocIsRendered$: Observable<any> = this.ydocIsRendered$$.asObservable()
  movement$$: Subject<any> = new Subject();
  worker: Worker;
  workerMessagesSubject: Subject<any> = new Subject();
  
  spinner: HTMLElement;
  connected = false;

  documentStructure: any;
  constructor(private authService: AuthService, private jwtService: JwtHelperService) {
    /* if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('workers/yjs.worker', import.meta.url));
      this.worker.onmessage = ({data}) => {
        let {action, payload} = data;
        payload = typeof payload == 'string' ? JSON.parse(payload) : payload
        if (action === 'connected') {
          this.ydocIsRendered$$.next(true);
        } else if (action === 'movement' && payload) {
          let parsed = payload
          if (typeof parsed == 'string') {
            parsed = JSON.parse(parsed)
          }
          this.movement$$.next(parsed);
        }
        this.workerMessagesSubject.next({action, payload})
      };
    } */

    setTimeout(() => {

    const yarray = this.ydoc.getMap('my array type');
    let count = 0;
    yarray.observe(yarrayEvent => {
      yarrayEvent.target === yarray // => true

      // Find out what changed:
      // Log the Array-Delta Format to calculate the difference to the last observe-event
      // console.log(yarrayEvent.changes.delta)
      // console.log(yarray.toArray())
    })
    }, 5000);
  }

  connectProvider(user: any): void {
    // this.provider = new WebsocketProvider(
    //   this.socketPath,
    //   this.roomName,
    //   this.ydoc,
    //   {
    //     params: { auth: this.authService.getToken(), readonly: 'true', docName: this.ydoc.guid },
    //   }
    // )

    this.provider.on('synced', (isSynced: boolean) => {
      if(user?.organisationsRoles?.length) {
        user.organisationsRoles.forEach(({ organizationId }) => {
          this.addSubdoc(organizationId, user._id, "restaurant");
        })
      }
      console.log('isSynced', isSynced);
    })

    this.provider.on('status', (event: any) => {
      console.log(console.log(event));
    })
            
    this.ydoc.on('subdocs', ({added, removed, loaded}) => {
      console.log("added",added);
      console.log("removed",removed);
      console.log( "loaded",loaded);
      
      loaded.forEach((subdoc: Doc) => {
        this.subdoc = subdoc;
        this.observeSubdoc();
        console.log('subdoc', subdoc);
      })
    })

  }

  observeSubdoc() {
    // this.subdoc?.getArray("myArray").insert()
    this.subdoc?.getArray("myArray").observe((event) => {
      console.log(this.subdoc?.getArray("myArray").toArray());
    })
  }

  subdoc?: Doc;
  addSubdoc(restaurantId: string, mainDocId: string, sufix: string) {
    const subDoc = new Doc({ guid: `${restaurantId}&${mainDocId}&${sufix}` });
    // console.log(subDoc);
    // console.log(this.ydoc);
    
    if(this.folder) {
      this.folder!.set(subDoc.guid, subDoc);
    } else {
      this.folder = this.ydoc.getMap<Doc>("subdocs");
      this.folder!.set(subDoc.guid, subDoc);
    }
  }
  count = 0;
  interval?: any;
  addItemToArray() {
    this.interval = setInterval(() => {
      this.yarray!.push([this.count++]);
    }, 1000);
  }

  clearIntervalFunc() {
    clearInterval(this.interval);
  }

  connect(user: any): void {
    this.ydoc = new Doc({ guid: user._id });
    this.roomName = user._id;

    this.providerIndexedDb = new IndexeddbPersistence(this.roomName, this.ydoc);

    if (this.providerIndexedDb.synced) {
      this.connectProvider(user);
    } else {
      this.providerIndexedDb.on('synced', () => {
        this.connectProvider(user);
      })
    }
  }

  destroyConnection() {
    this.ydoc.destroy();
    this.providerIndexedDb?.destroy();
    this.provider?.destroy();
  }

  stopSpinner() {
    // (document.querySelector(".spinner") as HTMLElement).style.display = "none";
  }
}
