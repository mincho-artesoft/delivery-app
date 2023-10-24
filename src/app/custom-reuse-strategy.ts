import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {
    private static handlers: Map<string, DetachedRouteHandle> = new Map();

    public shouldDetach(route: ActivatedRouteSnapshot): boolean {
        // Detach every route
        return true;
    }

    public store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        const key = this.getStoredRouteKey(route);
        CustomReuseStrategy.handlers.set(key, handle);
    }

    public shouldAttach(route: ActivatedRouteSnapshot): boolean {
        const key = this.getStoredRouteKey(route);
        return CustomReuseStrategy.handlers.has(key);
    }

    public retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        const key = this.getStoredRouteKey(route);
        return CustomReuseStrategy.handlers.get(key) || null;
    }

    public shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return this.getStoredRouteKey(future) === this.getStoredRouteKey(curr);
    }

    private getStoredRouteKey(route: ActivatedRouteSnapshot): string {
        // Use the full path including parameters as the unique key
        const pathParts = [];
        let currentSnapshot: ActivatedRouteSnapshot | null = route;
        while (currentSnapshot) {
            if (currentSnapshot.url.length) {
                pathParts.push(currentSnapshot.url.map(segment => segment.path).join('/'));
            }
            currentSnapshot = currentSnapshot.firstChild;
        }
        const fullPath = pathParts.join('/');
        return fullPath;
    }
}
