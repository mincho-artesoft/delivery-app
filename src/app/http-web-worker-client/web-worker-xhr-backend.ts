import { Inject, Injectable, Injector } from '@angular/core';
import {
  HttpHeaderResponse,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
  HttpEventType,
  HttpXhrBackend,
  HttpEvent,
  HttpHeaders,
  HttpContext,
  HttpParams,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { XhrFactory } from '@angular/common';
import { WebWorkerPool } from './web-worker-pool';
import {
  HTTP_WEB_WORKER_CLIENT_CONFIG,
  HttpWebWorkerClientConfig,
} from './http-web-worker-client-config';
import { uuidv4 } from '@firebase/util';

@Injectable()
export class WebWorkerHttpBackend extends HttpXhrBackend {
  public workerPool: WebWorkerPool;
  private baseUrl: string;
  private localUrl: string;
  private ignorePath: string;

  constructor(
    @Inject(HTTP_WEB_WORKER_CLIENT_CONFIG) config: HttpWebWorkerClientConfig,
    xhrFactory: XhrFactory
  ) {
    super(xhrFactory);
    this.workerPool = new WebWorkerPool(
      config.maxWorkers || 10,
      config.webWorkerPath
    );
    this.baseUrl = config.baseUrl || this.getBaseUrl();
    this.localUrl = this.getBaseUrl();
    this.ignorePath = config.ignorePath || '';
  }

  private getBaseUrl(): string {
    const location = document.createElement('a');
    location.href = '/';
    return `${location.protocol}//${location.host}`;
  }

  isValidAndTrimmedURL(url: any) {
    // Regex to validate the URL
    const urlPattern =
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

    if (!urlPattern.test(url)) {
      return null; // or throw an error based on your preference
    }

    // Remove trailing slash if it exists but preserve query params
    if (url.endsWith('/') && !url.includes('/?')) {
      url = url.slice(0, -1);
    }

    return url;
  }

  concatenateUrlParts(...parts: any) {
    //debugger;
    if (this.ignorePath && parts[1].indexOf(this.ignorePath) == 0) {
      return this.localUrl + parts[1];
    }
    const url = this.isValidAndTrimmedURL(parts[1]);
    if (url) {
      return url;
    }
    return parts
      .map((part: any, i: number) => {
        if (i === 0) {
          // Remove any trailing slash from the first part
          return part.replace(/\/$/, '');
        } else {
          // Remove any leading and trailing slashes from the other parts
          return part.replace(/^\/|\/$/g, '');
        }
      })
      .join('/');
    /* if (parts[1] == '/assets/i18n/bg.json') {
      const newUrl = parts[0] + parts[1];
      return newUrl;
    } else {
      return parts[1];
    } */
  }

  async formDataToFileArrayBuffer(
    formData: FormData
  ): Promise<{ arrayBuffer: ArrayBuffer; name: string; type: string }> {
    const file = formData.get('file') as File;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve({
          arrayBuffer: reader.result as ArrayBuffer,
          name: file.name,
          type: file.type,
        });
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  requestUUIDS = { }

  override handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    const uuid = uuidv4();
    if (req.method === 'JSONP') {
      throw new Error(`Attempted to construct Jsonp request without HttpClientJsonpModule installed.`);
    }
    return new Observable(observer => {
      // Create a Web Worker instance
      const worker = this.workerPool.getWorker(req.method[0] === "Y");
      if (!worker) {
        observer.error('Failed to get a web worker from the pool.');
        return;
      }

      let headers = new HttpHeaders();

      // Copy all headers from the original request

      req.headers.keys().forEach((key) => {
        headers = headers.set(key, req.headers.getAll(key) ?? '');
      });

      // Add an Accept header if one isn't present already
      if (!headers.has('Accept')) {
        headers = headers.set('Accept', 'application/json, text/plain, */*');
      }

      // Auto-detect the Content-Type header if one isn't present already
      if (!headers.has('Content-Type')) {
        const detectedType = req.detectContentTypeHeader();
        // Sometimes Content-Type detection fails
        if (detectedType !== null) {
          headers = headers.set('Content-Type', detectedType);
        }
      }
      (async () => {
        // TODO Not all files will be with key 'file'. Must change the way that we check their type.
        if (req.body instanceof FormData && req.body.getAll('file').length > 0) {
          const { arrayBuffer, name, type } = await this.formDataToFileArrayBuffer(req.body);
          const urlWithParams = this.concatenateUrlParts(this.baseUrl, req.urlWithParams);
          headers.set('Content-Type', 'multipart/form-data');
          worker.postMessage(
            {
              uuid: uuid,
              method: req.method,
              url: urlWithParams,
              body: arrayBuffer,
              fileName: name,
              fileType: type,
              headers: Array.from(headers.keys()).map((key) => [key, headers.getAll(key)]),
              responseType: req.responseType,
            },
            [arrayBuffer]
          );
        } else if (req.body instanceof FormData) {
          const formDataEntries: [string, string | Blob][] = [];
          req.body.forEach((value, key) => {
            formDataEntries.push([key, value]);
          });
          req = req.clone({ body: formDataEntries });
          const serializedBody = req.serializeBody();

          const urlWithParams = this.concatenateUrlParts(this.baseUrl, req.urlWithParams);
          // Post a message to the Web Worker with the request data
          worker.postMessage({
            uuid: uuid,
            method: req.method,
            url: urlWithParams,
            body: serializedBody,
            headers: Array.from(headers.keys()).map((key) => [key, headers.getAll(key)]),
            responseType: req.responseType
          });

        } else {
          const serializedBody = req.serializeBody();
          const urlWithParams = this.concatenateUrlParts(this.baseUrl, req.urlWithParams);
          // Post a message to the Web Worker with the request data
          worker.postMessage({
            uuid: uuid,
            method: req.method,
            url: urlWithParams,
            body: serializedBody,
            headers: Array.from(headers.keys()).map((key) => [key, headers.getAll(key)]),
            responseType: req.responseType
          });
        }
      })()
      // Listen for the message from the Web Worker
      worker.addEventListener('message', (event) => {
        // this.workerPool.releaseWorker(worker);
        /* console.log("event",event)
        console.log("eventType",event.data.type) */
        const { type, response, headers, status, statusText, error } = event.data;
        const headersObject = headers && headers.reduce((obj: any, [key, value]: [any, any]) => {
          obj[key] = value;
          return obj;
        }, {}) || {};
        if (type !== undefined) {
          if(type ==="yjs"){
           const uuid2 = JSON.parse(response).uuid;
           if(uuid2 == uuid) {
             observer.next(
                new HttpResponse({
                  body: response,
                  headers: new HttpHeaders(headersObject),
                  status: status,
                  statusText: statusText,
                  url: this.baseUrl + req.urlWithParams || undefined,
                })              
              );
           }
          } else if (type === HttpEventType.Response) {
            // Send HttpResponse through the observer
            observer.next(
              new HttpResponse({
                body: response,
                headers: new HttpHeaders(headersObject),
                status: status,
                statusText: statusText,
                url: this.baseUrl + req.urlWithParams || undefined,
              })              
            );
            observer.complete();
          } else if (type === HttpEventType.DownloadProgress) {
            // Send progress events through the observer
            observer.next(response);
          } else {
            // Send HttpHeaderResponse through the observer
            observer.next(new HttpHeaderResponse(response));
          }
        } else if (error) {
          // Send HttpErrorResponse through the observer
          this.workerPool.releaseWorker(worker);
          if (!error.status) {
            let errorMessage: any = {}
            errorMessage.status = Number(error.split('status: ')[1]);
            errorMessage.error = error.split('status: ')[0];
            // observer.error(new HttpErrorResponse(errorMessage));
          } else {
            // observer.error(new HttpErrorResponse(error));
            observer.error(
              new HttpErrorResponse({
                error: error.response.error || error,
                status: error.response.status || error.status,
                statusText: error.response.detail || error.response.message || error.statusText,
                // @ts-ignore
                headers: new HttpHeaders(Object.fromEntries(error.headers)),
                url: this.baseUrl + '/' + req.urlWithParams || undefined,
              }),
              );
          }
        }
        // worker.removeEventListener('message', handleMessage);
        // this.workerPool.releaseWorker(worker);
      });

      // Listen for error events from the Web Worker
      worker.onerror = (event) => {
        // Send HttpErrorResponse through the observer
        observer.error(new HttpErrorResponse({
          error: event.message,
          status: 0,
          statusText: 'Unknown Error',
          url: req.url,
        }));
      };

      // Unsubscribe/cleanup function
      // return () => {
      // worker.terminate();
      // };
    });
  }
  
}


