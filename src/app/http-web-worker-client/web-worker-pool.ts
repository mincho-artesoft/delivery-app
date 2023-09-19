export interface WorkerWrapper {
  worker: Worker;
  busy: boolean;
}

export class WebWorkerPool {
  private workerPool: WorkerWrapper[] = [];
  private readonly minWorkers: number = 10;
  private workerBlobUrl: string | null = null;
  private webWorkerPath: string | undefined;
  yjsWorker: Worker;
 
  constructor(minWorkers: number = 10, webWorkerPath?: string) {
    this.yjsWorker = new Worker(new URL('workers/yjs.worker', import.meta.url));
    this.webWorkerPath = webWorkerPath;
    this.minWorkers = minWorkers;

    if (!this.webWorkerPath) {
      this.workerBlobUrl = this.createWorkerBlobUrl();
    }

    for (let i = 0; i < this.minWorkers; i++) {
      this.addWorkerToPool();
    }
  }

  private createWorkerBlobUrl(): string {
    const workerScript = `
    self.addEventListener('message', async (event) => {
      const method = event.data.method;
      const url = event.data.url;
      const headersArray = event.data.headers;
      const options = event.data;
      const responseType = event.data.responseType || 'json';
    
      const headers = new Map(headersArray);
    
      try {
        let body;
        if (typeof options.body === 'string') {
          try {
            options.body = JSON.parse(options.body);
          } catch (error) {
            console.error(error);
          }
        }
    
        if (options.body && (method !== 'GET' && method !== 'HEAD')) {
          if (typeof options.body === 'object' && !(options.body instanceof Blob)) {
            if (options.body instanceof ArrayBuffer) {
              // Create a Blob from the ArrayBuffer with the same MIME type
              const blob = new Blob([options.body], { type: options.fileType });
          
              // Reconstruct FormData and append the Blob
              body = new FormData();
              body.append('file', blob, options.fileName);
          
              // Set the Content-Disposition header to include the file name
              headers.set('Content-Disposition', 'form-data; name="file"; filename=' + options.fileName);
            } else if (options.body && Array.isArray(options.body) && Array.isArray(options.body[0])) {
              // Reconstruct FormData from the array
              body = new FormData();
              for (const [key, value] of options.body) {
                if (value instanceof Blob) {
                  const file = new File([value], 'filename', { type: value.type });
                  body.append(key, file);
                } else {
                  body.append(key, value);
                }
              }
            }  else if (options.body instanceof Blob) {
              body = new FormData();
              const file = new File([options.body], 'filename', { type: options.body.type });
              body.append('file', file);
            } 
            if (!body) {
              body = JSON.stringify(options.body);
              headers.set('Content-Type', 'application/json');
            }
          }
          else {
            body = options.body
          }
        }else {
          body = options.body
        }
    
        const fetchOptions = {
          method,
          headers,
          credentials: options.withCredentials ? 'include' : 'same-origin',
        };
        if (method !== 'GET' && method !== 'HEAD') {
          fetchOptions.body = body;
        }
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
          if(response.status == 401){
            const errorData = await response.text();
            self.postMessage({
              error: {
              type: 4, // HttpResponse
              response: errorData,
              status: response.status,
              statusText: response.statusText || 'Not authorized',
              headers: Array.from(response.headers.entries()),
            }
          });
          }else if (response.status >= 500) {
            const htmlRegex = /<\s*html.*?>/i;
            response.text().then(html => {
              if (htmlRegex.test(html)) {
                self.postMessage({
                  error: {
                  type: 4, // HttpResponse
                  response: html,
                  status: response.status,
                  statusText: response.statusText,
                  headers: Array.from(response.headers.entries()),
                }
              });
              }else{
                self.postMessage({
                  error: {
                  type: 4, // HttpResponse
                  response: html,
                  status: response.status,
                  statusText: response.statusText,
                  headers: Array.from(response.headers.entries()),
                }
              });
              }
            });
          } else {
            const errorData = await response.json();
            self.postMessage({
            error: {
            type: 4, // HttpResponse
            response: errorData,
            status: response.status,
            statusText: response.statusText,
            headers: Array.from(response.headers.entries()),
          }
        }); 
          }
          
        }else{
          if (response.status === 204) {
            // Send combined HttpHeaderResponse and HttpResponse event with empty body
            self.postMessage({
              type: 4, // HttpResponse
              response: null, // No content for 204 status
              status: response.status,
              statusText: response.statusText,
              headers: Array.from(response.headers.entries()),
            });
          } else {        
            let data;
            if (responseType === 'text') {
              data = await response.text();
            } else if (responseType === 'arraybuffer') {
              data = await response.arrayBuffer();
            } else if (responseType === 'blob') {
              data = await response.blob();
            } else {
              if (response.headers.get('content-type') && response.headers.get('content-type').indexOf('application/json') > -1) {
              data = await response.json();
              }else{
                data = null
              }
            }
      
            // Send combined HttpHeaderResponse and HttpResponse event
            self.postMessage({
              type: 4, // HttpResponse
              response: data,
              status: response.status,
              statusText: response.statusText,
              headers: Array.from(response.headers.entries()),
            });
          }
        }
    
        
      } catch (error) {
        self.postMessage({
          error: error.message,
        });
      }
    });
    
    `;
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    return URL.createObjectURL(blob);
  }

  private addWorkerToPool() {
    let worker: Worker;
    if (this.webWorkerPath) {
      worker = new Worker(this.webWorkerPath, { type: 'module' });
    } else if (this.workerBlobUrl) {
      worker = new Worker(this.workerBlobUrl);
    } else {
      throw new Error('Unable to create a worker');
    }

    this.workerPool.push({ worker, busy: false });
  }

  getWorker(yjs?:boolean): Worker | null {
    if(yjs){
      return this.yjsWorker;
    }
    const availableWorker = this.workerPool.find((wrapper) => !wrapper.busy);

    if (availableWorker) {
      availableWorker.busy = true;
      // If the worker we're using is the last one available, add a new worker for the next request
      if (!this.workerPool.some((wrapper) => !wrapper.busy)) {
        this.addWorkerToPool();
      }
      return availableWorker.worker;
    }

    return null;
  }

  releaseWorker(worker: Worker) {
    const workerWrapper = this.workerPool.find((wrapper) => wrapper.worker === worker);
    if (workerWrapper) {
      workerWrapper.busy = false;
    }
  }
}
