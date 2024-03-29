import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminPanelModule } from './admin-panel/admin-panel.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthService } from './auth/services/auth.service';
import { JwtModule } from '@auth0/angular-jwt';
import { HttpWebWorkerClientModule } from './http-web-worker-client/http-web-worker-client.module';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthModule } from './auth/auth.module';
import { YjsService } from './yjs.service';
import { TokenIInterceptor } from './interceptors/token.interceptor';
import { BaseUiModule } from './user-interface/base-ui.module';

export function tokenGetter() {
  return localStorage.getItem("jwt_token");
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AdminPanelModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter
      }
    }),
    HttpWebWorkerClientModule.forRoot({ baseUrl: 'ws://localhost:9182', ignorePath: '/options' }),
    AuthModule,
    BaseUiModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService, httpClient: HttpClient, yjsService: YjsService) => {
        return () => {
          httpClient.request('Yget', `?initial=true`).subscribe((res: string) => {
            const structure = JSON.parse(res);
            yjsService.documentStructure = Object.keys(structure.structure).length ? structure.structure : { organizations: {} };
            console.log("APP MODULE");
            console.log(structure);
            localStorage.setItem('organizations', JSON.stringify(structure.structure.organizations));
            setTimeout(() => {
              yjsService.stopSpinner();
              yjsService.connected = true;
              yjsService.connectedSource.next(true)
            }, 500);
          });
        }
      },
      deps: [AuthService, HttpClient, YjsService],
      multi: true,
    },
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: TokenIInterceptor,
    //   multi: true,
    // },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
