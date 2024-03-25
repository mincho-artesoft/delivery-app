import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  languageControl = new FormControl('EN');
  organizationControl = new FormControl('');

  private activeCategoriesSource = new BehaviorSubject<string[]>([]);
  public activeCategories$ = this.activeCategoriesSource.asObservable();

  private activeTagsSource = new BehaviorSubject<string[]>([]);
  public activeTags$ = this.activeTagsSource.asObservable();

  private searchSubject = new BehaviorSubject<string>('');
  search$ = this.searchSubject.asObservable();


  addActiveCategory(tag: string) {
    const currentCategories = this.activeCategoriesSource.getValue();
    if (!currentCategories.includes(tag)) {
      this.activeCategoriesSource.next([...currentCategories, tag]);
    }
  }

  removeActiveCategory(tag: string) {
    const updatedCategories = this.activeCategoriesSource.getValue().filter(category => category !== tag);
    this.activeCategoriesSource.next(updatedCategories);
  }

  isCategoryActive(tag: string): boolean {
    return this.activeCategoriesSource.getValue().includes(tag);
  }

  setActiveCategories(categories: string[]) {
    this.activeCategoriesSource.next(categories);
  }

  getActiveCategories() {
    return this.activeCategoriesSource.value
  }




  addActiveTag(tag: string) {
    const currentTags = this.activeTagsSource.getValue();
    if (!currentTags.includes(tag)) {
      this.activeTagsSource.next([...currentTags, tag]);
    }
  }

  removeActiveTag(tag: string) {
    const updatedTags = this.activeTagsSource.getValue().filter(t => t !== tag);
    this.activeTagsSource.next(updatedTags);
  }

  isTagActive(tag: string): boolean {
    return this.activeTagsSource.getValue().includes(tag);
  }

  setActiveTags(tags: string[]) {
    this.activeTagsSource.next(tags);
  }

  getActiveTags() {
    return this.activeTagsSource.value
  }


  setSearchTerm(term: string) {
    this.searchSubject.next(term);
  }

  getSearchTerm() {
    return this.searchSubject.value
  }

}
