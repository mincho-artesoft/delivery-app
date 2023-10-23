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
    HttpWebWorkerClientModule.forRoot({baseUrl:'ws://localhost:9182',ignorePath:'/assets'}),
    AuthModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService, httpClient: HttpClient, yjsService: YjsService) => {
        return () => {

          httpClient.request('Yget', `?initial=true`).subscribe((res: string) => {
            const structure = JSON.parse(res);
            console.log(structure);


            
            console.log("APP MODULE");
            yjsService.documentStructure = structure.structure.subdocs;
            setTimeout(() => {
                  yjsService.stopSpinner();
                  yjsService.connected = true;
            }, 500);
          });
          

          // setTimeout(() => {
          //   yjsService.stopSpinner();
          //   yjsService.connected = true;
          // }, 100)
        }
      },
      deps: [AuthService, HttpClient, YjsService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
