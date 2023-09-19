import { ModuleWithProviders, NgModule } from '@angular/core';
import { HTTP_WEB_WORKER_CLIENT_CONFIG, HttpWebWorkerClientConfig } from "./http-web-worker-client-config";
import { HttpBackend } from '@angular/common/http';
import {WebWorkerHttpBackend} from "./web-worker-xhr-backend";

@NgModule({
  providers: [WebWorkerHttpBackend],
})


export class HttpWebWorkerClientModule {
  static forRoot(config: HttpWebWorkerClientConfig | null = null): ModuleWithProviders<HttpWebWorkerClientModule> {
    return {
      ngModule: HttpWebWorkerClientModule,
      providers: [
        {
          provide: HttpBackend,
          useClass: WebWorkerHttpBackend,
        },
        {
          provide: HTTP_WEB_WORKER_CLIENT_CONFIG,
          useValue: config || { webWorkerPath: null }, // Provide a default value when the config is not provided
        },
      ],
    };
  }
}
