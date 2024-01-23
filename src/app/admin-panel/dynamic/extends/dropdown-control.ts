import { BehaviorSubject } from "rxjs";
import { BaseControl } from "./base-control";
import { HttpClient, HttpParams } from '@angular/common/http';

//EXAMPLE FOR SETING URL, PAGE, SIZE AND TYPE IN THE CELL

// baseUrl: 'http://localhost:61438/options',
// page: 1,
// size: 50,
// controlType: 'DropdownControl',

export class DropdownControl extends BaseControl {
  options = new BehaviorSubject<any>([]);
  allOptions: any = [];
  currentPage: number;
  size: number;
  baseUrl: string;
  cell: any;
  isPending: boolean = false;
  constructor(
    cell: any,
    private http: HttpClient,
    service: any,
    collectedData: any,
    value?: any
  ) {
    super(cell, value || (cell.default || ''));

    this.currentPage = cell.page || null;
    this.baseUrl = cell.baseUrl || '';
    this.size = cell.size || null;
    this.cell = cell;
    if (cell.selectOptions && Array.isArray(cell.selectOptions)) {
      this.options.next(cell.selectOptions);
    } else {
      this.loadOptions(this.baseUrl, this.currentPage, this.size);
    }
  }

  private loadOptions(url: string, page?: number, size?: number): void {
    if (!this.cell.selectOptions) {
      let params: any;

      if (page !== undefined && page !== null) {
        params = new HttpParams();
        params = params.set('page', page.toString());
      }

      if (size !== undefined && size !== null) {
        params = params || new HttpParams();
        params = params.set('size', size.toString());
      }

      if (params) {
        url = `${url}?${params.toString()}`
      }
      this.isPending = true;
      this.http.get(url).subscribe(
        (response: any) => {
          if (page) {
            this.options.next([...this.options.value, ...response.results]);
            this.allOptions = this.options.value;
          } else {
            this.options.next(response.results);
          }
          this.isPending = false;
        },
        error => {
          console.error('Could not load options:', error);
        }
      );
    } else {
      this.options.next(this.cell.selectOptions)
    }
  }

  loadNextPage(): void {
    if (this.currentPage) {
      this.currentPage++;
    }
    if (!this.cell.selectOptions) {
      this.loadOptions(this.baseUrl, this.currentPage, this.size);
    }
  }

  search(query: string) {
    if (this.cell.selectOptions && Array.isArray(this.cell.selectOptions)) {
      if (query) {
        console.log(this.cell)
        if (this.cell.group) {
          const lowerCaseQuery = query.toLowerCase();
          console.log(query)
          this.options.next(this.cell.selectOptions.filter(option =>
            option.name.toLowerCase().includes(lowerCaseQuery)));
        } else {
          const lowerCaseQuery = query.toLowerCase();
          this.options.next(this.cell.selectOptions.filter(option =>
            option.toLowerCase().includes(lowerCaseQuery)
          ));
        }

      } else {
        this.options.next(this.cell.selectOptions);
      }
    } else {
      if (query) {
        const lowerCaseQuery = query.toLowerCase();
        const filteredOptions = this.allOptions.filter(option =>
          option.name.toLowerCase().includes(lowerCaseQuery)
        );
        this.options.next(filteredOptions)
        return filteredOptions;
      } else {
        this.options.next(this.allOptions);
        return this.allOptions;
      }

    }
  }

}