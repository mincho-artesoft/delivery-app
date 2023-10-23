import { HttpHeaders, HttpRequest } from "@angular/common/http";
import { Observable, Observer } from "rxjs";

// class CustomObservable<T> extends Observable<T> {
//     constructor(
//       private worker: Worker,
//       private req: HttpRequest<any>,
//       private urlWithParams: string,
//       private headers: HttpHeaders,
//       subscribe: (observer: Observer<T>) => void
//     ) {
//       super(subscribe);
//     }
  
//     postMessage(body: any) {
//       this.worker.postMessage({
//         method: this.req.method,
//         url: this.urlWithParams,
//         body: body,
//         headers: Array.from(this.headers.keys()).map((key) => [key, this.headers.getAll(key)]),
//         responseType: this.req.responseType
//       });
//     }
//   }