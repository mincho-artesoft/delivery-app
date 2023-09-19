import { AsyncValidatorFn } from "@angular/forms";
import { BaseControl } from "./base-control";
import { HttpClient, HttpParams } from '@angular/common/http';




export class DropdownControl extends BaseControl {
  options: any[] = [];
  currentPage: number;
  size: number;
  baseUrl: string;

  constructor(
    cell: any,
    private http: HttpClient,
    value?: any
  ) {
    super(cell, value || (cell.default || ''));

    this.currentPage = cell.page || null;
    this.baseUrl = cell.baseUrl || '';
    this.size = cell.size || null;
    this.loadOptions(this.baseUrl, this.currentPage, this.size)

  }

  private loadOptions(url: string, page?: number, size?: number): void {
  
    let params: any;
  
    if (page !== undefined && page !== null) {
      params = new HttpParams();
      params = params.set('page', page.toString());
    }
  
    if (size !== undefined && size !== null) {
      params = params || new HttpParams();
      params = params.set('size', size.toString());
    }
    
    if(params) {
      url = `${url}?${params.toString()}`
    }
    this.http.get(url).subscribe(
      (response: any) => {
        if(page){
          this.options = this.currentPage === 1 ? response : [...this.options, ...response];
        } else {
          this.options = response;
        }
      },
      error => {
        console.error('Could not load options:', error);
      }
    );
  }

  loadNextPage(): void {
    if(this.currentPage){
      this.currentPage++; 

    }
    this.loadOptions(this.baseUrl, this.currentPage, this.size);
  }
}







