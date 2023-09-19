import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';
import { Injectable } from "@angular/core";
import { from } from "rxjs";

@Injectable()
export class CustomReuseStrategy implements RouteReuseStrategy {
    public static handlers: Map<string, DetachedRouteHandle> = new Map(); // routes to reuse/cache

    private static waitDelete: string | null = null;

    public static deleteRouteSnapshots(): void {
        CustomReuseStrategy.handlers.clear();
    }

    public static deleteRouteSnapshot(name: string): void {
        if (CustomReuseStrategy.handlers.has(name)) {
            CustomReuseStrategy.handlers.delete(name);
        } else {
            CustomReuseStrategy.waitDelete = name;
        }
    }

    public clearAllHandlers() {
        console.log(CustomReuseStrategy.handlers);
    }

    // decide if the route should be stored
    public shouldDetach(route: ActivatedRouteSnapshot): boolean {
        if (!route) {
            CustomReuseStrategy.deleteRouteSnapshots();
            return false;
        }
        if (route.params && Object.keys(route.params).length > 0) {
            return false; // route has parameters, no storing
        }
        return true;
    }

    // store the information for the route we're destructing
    public store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        if (CustomReuseStrategy.waitDelete && CustomReuseStrategy.waitDelete === this.getRouteUrl(route)) {
            CustomReuseStrategy.waitDelete = null;
            return;
        }
        if (route) {
            CustomReuseStrategy.handlers.set(this.getRouteUrl(route), handle);
        } else {
            return undefined;
        }
    }

    // return true if we have a stored route object for the next route
    public shouldAttach(route: ActivatedRouteSnapshot): boolean {
        if (Array.isArray(route.url) && route.url.length === 0) {
            return false;
        } else {
            return CustomReuseStrategy.handlers.has(this.getRouteUrl(route));
        }

    }


    // if we returned true in shouldAttach(), now return the actual route data for restoration
    public retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {

        if (!route.routeConfig) {
            return null;
        }

        const result = CustomReuseStrategy.handlers.get(this.getRouteUrl(route));
        return result !== undefined ? result : null;

    }

    // reuse the route if we're going to and from the same route
    public shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return (
            future.routeConfig === curr.routeConfig &&
            JSON.stringify(future.params) === JSON.stringify(curr.params)
        );
    }

    // helper method to return a path
    private getRouteUrl(route: ActivatedRouteSnapshot): string {
        return route.url.join("/");
    }
}