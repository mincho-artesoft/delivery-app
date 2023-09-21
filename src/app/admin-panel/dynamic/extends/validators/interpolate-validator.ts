import { ChangeDetectorRef, Injectable } from "@angular/core";
import { InterpolateService } from "../../services/interpolate.service";
import { AbstractControl, AsyncValidatorFn } from "@angular/forms";
import {
  combineLatest, debounceTime, distinctUntilChanged,
  Observable,
  of, startWith,
  switchMap,
} from "rxjs";

@Injectable({
  providedIn: 'root',
})


// VALIDATOR EXAMPLE FOR THE CELL

// validators: [
//   {
//     name: 'asyncVal',
//     arg: {
//       interpolate: '"${root.controls.name.value}" === "${root.controls.domain.value}" ',
//       props: ['root.controls.domain', 'root.controls.name']
//     }
//   }
// ],

export class InterpolateValidator {

  constructor(public chr: ChangeDetectorRef) {
  }

  static interpolate(data: any): AsyncValidatorFn {
    const targets: any = [];
    return (control: AbstractControl): Observable<any | null> => {
      if (data.hasOwnProperty('props') && !targets.length) {
        data.props.forEach((prop: any) => {
          const target = InterpolateService.getNested(control, prop);

          if (target && !targets.some((ctrl: any) => ctrl === target)) {
            targets.push(target);
          }
        })
        combineLatest(
          targets.map((item: any) => item.valueChanges.pipe(startWith(null)))
        ).pipe(
          debounceTime(1), distinctUntilChanged(),
        ).subscribe(() => {
          if (control) {
            control.updateValueAndValidity({ emitEvent: true, onlySelf: true });
          }
        });
      }
      // if(control.status === 'VALID') {
      //   return of(null);
      // }
      // if (!control.valueChanges) {
      //   return of(control.status === 'VALID' ? null : {error: true});
      // }
      return of(control.value)
        .pipe(
          debounceTime(10),
          switchMap(value => new Observable((observer: any) => {
            if (control.root !== control) {
              const val = data.hasOwnProperty('interpolate') ? data.interpolate : data;
              InterpolateService.evaluate(InterpolateService.suplant(val, control), (res: any) => {
                if (res === 'true') {
                  observer.next(null)
                  observer.complete();
                } else {
                  control.setErrors({ invalid: true })
                }
              })
            }
          }))
        )
    }
  }
}
