import { AfterViewInit, Component, OnInit } from '@angular/core';
import { DynamicService } from '../../../services/dynamic.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, catchError, concatMap, delay, forkJoin, from, map, mergeMap, of, switchMap, tap, toArray } from 'rxjs';
import { asyncScheduler } from 'rxjs';
import moment from 'moment';
import { Router } from '@angular/router';
function task(state) {
  const now = moment();
  let mapper = state.responseMapper;
  const warehouseMapper = state.warehouseMapper
  let expirationProducts = [];
  let expiredProducts = [];
  let interval = 0;

  Object.keys(mapper).forEach((key) => {
    const data = mapper[key].data;
    data.forEach(item => item.warehouseId = key);
    expirationProducts = expirationProducts.concat(data);
  });

  expirationProducts.sort((a, b) => moment(a.validTo).valueOf() - moment(b.validTo).valueOf());

  if (expirationProducts.length > 0) {
    const nearestExpiration = expirationProducts[0];
    const expirationMoment = moment(nearestExpiration.validTo);
    const millisecondsToExpiration = expirationMoment.diff(now);
    console.log(millisecondsToExpiration)
    if (millisecondsToExpiration < 0) {
      expiredProducts.push(nearestExpiration);
      const warehouseKey = nearestExpiration.warehouseId;
      mapper[warehouseKey].data = mapper[warehouseKey].data.filter(product => product !== nearestExpiration);
      const organization = warehouseMapper[mapper[expiredProducts[0].warehouseId]._id]
      console.log(`Expired product from ${organization?.name[organization.language]}`)
      if (mapper[warehouseKey].data.length === 0) {
        delete mapper[warehouseKey];
      }
    } else {
      interval = millisecondsToExpiration;
    }

    console.log(`Milliseconds until the closest product expires: ${millisecondsToExpiration}`);
  }

  state.warehouseMapper = mapper;
  this.schedule(state, interval);
}




@Component({
  selector: 'app-organizations-widget',
  templateUrl: './organizations-widget.component.html',
  styleUrls: ['./organizations-widget.component.scss']
})
export class OrganizationsWidgetComponent implements OnInit {

  hoverOrganizationsWidget = false;
  currentOrg: any = {};
  organizations: Observable<any>;
  hidePopupTimeout;
  warehouses: Observable<any>;
  services = new Subject();
  warehouseResponses = {};
  warehouseMapper = {};
  servicesArray = [];
  serviceHolder: any = {

  }

  constructor(private dynamicService: DynamicService, private http: HttpClient, private router: Router) {
    this.organizations = this.http.request('Yget', '/organizations').pipe(map((res: any) => {
      const data = JSON.parse(res).structure || JSON.parse(res);
      return {
        organizations: data
      };
    }));

    this.organizations.subscribe({
      next: (organizations) => {
        organizations = organizations.organizations;
        if (!this.dynamicService.selectedOrganization.value._id) {
          const returnToOrgJSON = localStorage.getItem('selectedOrganization');
          if (returnToOrgJSON && returnToOrgJSON !== 'undefined') {
            try {
              const returnToOrg = JSON.parse(returnToOrgJSON);
              this.currentOrg = returnToOrg;
              this.dynamicService.selectedOrganization.setValue(returnToOrg, { emitEvent: false });
            } catch (e) {
              console.error("Error parsing organization from localStorage:", e);
              this.setFallbackOrganization(organizations);
            }
          } else {
            this.setFallbackOrganization(organizations);
          }
        } else {
          this.currentOrg = this.dynamicService.selectedOrganization.value;
        }
      },
      error: (err) => console.error('Failed to fetch organizations', err)
    });
  }

  ngOnInit(): void {
    this.organizations.pipe(
      map((res: any) => {
        return res.organizations || []
      }),
      mergeMap(orgs => from(orgs).pipe(
        delay(1500),
        mergeMap((org: any) => this.http.request('Yget', `/services?path=${org._id}`).pipe(
          map(response => {
            const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
            return parsedResponse.structure?.services || parsedResponse.services || [];
          }),
          map(services => {
            let newObj = {};
            services.map(service => {
              newObj[service.settings.settings.data] = service._id;
            });
            this.serviceHolder[org._id] = newObj;
            services = services.filter(service => service.settings.settings.data === 'warehouse');
            this.warehouseMapper[services[0]._id] = org;
            return services
          }),
          catchError(error => {
            console.error(`Failed to fetch services for org: ${org._id}`, error);
            return of([]);
          })
        )
        ),
        map(res => {
          this.servicesArray.push(...res);
          return res
        })
      )
      ),
      switchMap((warehouses: any) => {
        if (warehouses.length === 0) {
          return of([]);
        }
        return from(this.servicesArray).pipe(
          mergeMap((warehouse: any) => {
            return this.http.request('Yget', `/service?path=${warehouse._id}`).pipe(
              map((res: any) => {
                const data = JSON.parse(res).structure || JSON.parse(res);
                return { warehouseId: warehouse._id, data: data };
              }),
              catchError(error => {
                console.error(`Failed to fetch service details for warehouse: ${warehouse._id}`, error);
                return of({ warehouseId: warehouse._id, error: true });
              })
            )
          }

          ),
        );
      })
    ).subscribe({
      next: (responses: any) => {
        this.servicesArray = [];
        console.log('Combined Responses:', responses);
        this.warehouseResponses[Object.keys(this.warehouseResponses).length] = { _id: responses.warehouseId, data: responses.data };
        asyncScheduler.schedule(task, 0, { responseMapper: this.warehouseResponses, warehouseMapper: this.warehouseMapper });
      },
      error: (err) => console.error('Error:', err)
    });








    // this.organizations.pipe(
    //   switchMap(organizations => {
    //     const orgs = organizations.organizations || [];
    //     if (orgs.length === 0) {
    //       return of([]);
    //     }
    //     return from(orgs).pipe(
    //       mergeMap((org: any) =>
    //         this.http.request('Yget', `/services?path=${org._id}`).pipe(
    //           map(response => {
    //             const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
    //             return parsedResponse.structure?.services || parsedResponse.services || [];
    //           }),
    //           map(services => {
    //             services = services.filter(service => service.settings.settings.data === 'warehouse');
    //             this.warehouseMapper[services[0]._id] = org;
    //             return services
    //           }),
    //           catchError(error => {
    //             console.error(`Failed to fetch services for org: ${org._id}`, error);
    //             return of([]);
    //           })
    //         )
    //       ),
    //       toArray()
    //     );
    //   }),
    //   switchMap((warehouses: any) => {
    //     console.log(warehouses)
    //     if (warehouses.length === 0) {
    //       return of([]);
    //     }
    //     return from(warehouses).pipe(
    //       mergeMap((warehouse: any) => {
    //         return this.http.request('Yget', `/service?path=${warehouse._id}`).pipe(
    //           map((res: any) => {
    //             const data = JSON.parse(res).structure || JSON.parse(res);
    //             return { warehouseId: warehouse._id, data: data };
    //           }),
    //           catchError(error => {
    //             console.error(`Failed to fetch service details for warehouse: ${warehouse._id}`, error);
    //             return of({ warehouseId: warehouse._id, error: true });
    //           })
    //         )
    //       }

    //       ),
    //     );
    //   })
    // ).subscribe({
    //   next: (response: any) => {
    //     console.log('Response for warehouse:', response);
    //     this.warehouseResponses[Object.keys(this.warehouseResponses).length] = { _id: response.warehouseId, data: response.data };
    //     asyncScheduler.schedule(task, 0, { responseMapper: this.warehouseResponses, warehouseMapper: this.warehouseMapper });
    //   },
    //   error: err => console.error('Failed to process organizations and their warehouses', err)
    // });
  }

  setFallbackOrganization(organizations) {
    if (organizations && organizations.length > 0) {
      this.currentOrg = organizations[0];
      setTimeout(() => {
        this.dynamicService.selectedOrganization.setValue(organizations[0]);
        localStorage.setItem('selectedOrganization', JSON.stringify(organizations[0]));
      }, 500)
    }
  }
  showPopup() {
    this.hoverOrganizationsWidget = true;
    if (this.hidePopupTimeout) {
      clearTimeout(this.hidePopupTimeout);
    }
  }

  scheduleHidePopup() {
    this.hidePopupTimeout = setTimeout(() => {
      this.hoverOrganizationsWidget = false;
    }, 300);
  }

  cancelHidePopup() {
    if (this.hidePopupTimeout) {
      clearTimeout(this.hidePopupTimeout);
    }
  }

  selectOrganization(org: any) {
    this.currentOrg = org;
    if (this.dynamicService.selectedOrganization.value._id !== org._id) {
      const currentUrl = this.router.url.split('/')[1];
      if (this.serviceHolder[org._id][currentUrl]) {
        this.dynamicService.serviceGuid = this.serviceHolder[org._id][currentUrl];
      }
      this.dynamicService.selectedOrganization.setValue(org);
      localStorage.setItem('selectedOrganization', JSON.stringify(org));
    }
  }
}
