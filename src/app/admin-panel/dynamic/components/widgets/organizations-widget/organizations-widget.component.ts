import { AfterViewInit, Component, OnInit } from '@angular/core';
import { DynamicService } from '../../../services/dynamic.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, catchError, concatMap, delay, forkJoin, from, map, mergeMap, of, switchMap, tap, toArray } from 'rxjs';
import { asyncScheduler } from 'rxjs';
import moment from 'moment';
import { Router } from '@angular/router';
import { SnackbarService } from '../../../services/snackbar-service.service';
function task(state) {
  const now = moment();
  let mapper = state.responseMapper;
  const servicesMapper = state.servicesMapper;

  let expirationItems = [];
  let expiredItems = [];
  let interval = 0;
  Object.keys(mapper).forEach((key) => {
    const data = mapper[key].data;
    if (data?.length > 0) {
      data?.forEach(item => item.serviceId = key);
      expirationItems = expirationItems.concat(data);
    }

  });
  if (expirationItems.length > 0) {
    expirationItems?.sort((a, b) => moment(a.validTo).valueOf() - moment(b.validTo).valueOf());

    const nearestExpiration = expirationItems[0];
    const serviceSettings = servicesMapper[mapper[expirationItems[0].serviceId]._id].settings;
    const prop = serviceSettings.schedule.target;
    const expirationMoment = moment(nearestExpiration[prop]);
    const millisecondsToExpiration = expirationMoment.diff(now);
    if (millisecondsToExpiration < 0) {
      expiredItems.push(nearestExpiration);
      const warehouseKey = nearestExpiration.serviceId;
      mapper[warehouseKey].data = mapper[warehouseKey].data.filter(product => product !== nearestExpiration);
      const organization = servicesMapper[mapper[expiredItems[0].serviceId]._id].org;
      const label = serviceSettings.schedule.label;
      const item = expiredItems[0][serviceSettings.schedule.prop];
      state.snackbar.showSnack({
        text: `Expired ${label} ${item} from ${organization?.name[organization.language]}`, service: {
          icon: 'input',
          url: `/${serviceSettings.data}`,
          _id: mapper[expirationItems[0].serviceId]._id,
          org: organization
        }
      }, {
        duration: 0,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        showCloseButton: true,
      });
      if (mapper[warehouseKey].data.length === 0) {
        delete mapper[warehouseKey];
      }
    } else {
      interval = millisecondsToExpiration;
    }
    state.responseMapper = mapper;
    this.schedule(state, interval);
  }
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
  scheduledResponses = {};
  scheduledServiceMapper = {};
  servicesArray = [];
  serviceHolder: any = {

  }

  constructor(private dynamicService: DynamicService, private http: HttpClient, private router: Router, public snackbarService: SnackbarService) {
    this.organizations = this.http.request('Yget', '/organizations').pipe(map((res: any) => {
      const data = JSON.parse(res).structure || JSON.parse(res);
      return {
        organizations: data
      };
    }));

    this.organizations.subscribe({
      next: (organizations) => {
        organizations = organizations.organizations;
        if (!this.dynamicService.selectedOrganization.value?._id) {
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

    this.dynamicService.selectedOrganization.valueChanges.subscribe((org) => {
      this.currentOrg = org;
    })
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
            // TODO if settings has prop schedule: 'validTo'
            let newObj = {};
            services.map(service => {
              newObj[service.settings.settings.data] = service._id;
            });
            this.serviceHolder[org._id] = newObj;
            services = services.filter(service => service.settings.settings.schedule);
            services.map(service => {
              this.scheduledServiceMapper[service._id] = { org, settings: service.settings.settings };
            })
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
        this.scheduledResponses[Object.keys(this.scheduledResponses).length] = { _id: responses.warehouseId, data: responses.data };
        asyncScheduler.schedule(task, 0, { responseMapper: this.scheduledResponses, servicesMapper: this.scheduledServiceMapper, snackbar: this.snackbarService });
      },
      error: (err) => console.error('Error:', err)
    });
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
