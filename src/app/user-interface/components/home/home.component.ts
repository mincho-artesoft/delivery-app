import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest, map, startWith } from 'rxjs';
import { SharedService } from 'src/app/user-interface/services/shared.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private fullOrganizationsList = new BehaviorSubject<any[]>([]);
  filteredOrganizations: Observable<any[]>; // This will be used in the template
  searchControl = new FormControl('');

  constructor(
    private http: HttpClient,
    public sharedService: SharedService) {
    
    this.http.request('Yget', '/organizations').subscribe((res: any) => {
      const parsedData = JSON.parse(res).structure
      console.log(parsedData)
      this.fullOrganizationsList.next(parsedData); // Store the full list in the BehaviorSubject
    });

    // Create an observable for the filtered organizations
    this.filteredOrganizations = combineLatest([
      this.searchControl.valueChanges.pipe(startWith('')), // Start with an empty search string
      this.fullOrganizationsList // Combine with the full list
    ]).pipe(
      map(([searchTerm, organizations]) => {
        return this.filterOrganizations(searchTerm, organizations);
      })
    );
  }

  ngOnInit(): void { }

  private filterOrganizations(searchTerm: string, organizations: any[]): any[] {
    if (!searchTerm) {
      return organizations; // Return the full list if the search term is empty
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return organizations.filter(organization =>
      organization.name[this.sharedService.languageControl.value].toLowerCase().includes(lowerCaseSearchTerm)
    );
  }
}
