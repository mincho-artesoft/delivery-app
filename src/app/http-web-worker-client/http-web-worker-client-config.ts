import { InjectionToken } from '@angular/core';

export interface HttpWebWorkerClientConfig {
  maxWorkers?: number;
  webWorkerPath?: string;
  baseUrl?: string;
  ignorePath?:string;
  userID?: string
}

export const HTTP_WEB_WORKER_CLIENT_CONFIG = new InjectionToken<HttpWebWorkerClientConfig>(
  'HttpWebWorkerClientConfig'
);
