import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-menu-toolbar',
  templateUrl: './menu-toolbar.component.html',
  styleUrls: ['./menu-toolbar.component.scss']
})
export class MenuToolbarComponent {
  categories = [
    {
      "label": {
        "BG": "Предястия",
        "FR": "Entrées",
        "EN": "Appetizers",
        "IT": "Antipasti"
      },
      "tag": "appetizers",
      "lang": ["BG", "FR", "EN", "IT"]
    },
    {
      "label": {
        "BG": "Салати",
        "FR": "Salades",
        "EN": "Salads",
        "IT": "Insalate"
      },
      "tag": "salads",
      "lang": ["BG", "FR", "EN", "IT"]
    },
    {
      "label": {
        "BG": "Супи",
        "FR": "Soupes",
        "EN": "Soups",
        "IT": "Zuppe"
      },
      "tag": "soups",
      "lang": ["BG", "FR", "EN", "IT"]
    },
    {
      "label": {
        "BG": "Основни ястия",
        "FR": "Plats principaux",
        "EN": "Main Courses",
        "IT": "Piatti principali"
      },
      "tag": "main_courses",
      "lang": ["BG", "FR", "EN", "IT"]
    },
    {
      "label": {
        "BG": "Вегетариански",
        "FR": "Végétarien",
        "EN": "Vegetarian",
        "IT": "Vegetariano"
      },
      "tag": "vegetarian",
      "lang": ["BG", "FR", "EN", "IT"]
    },
    {
      "label": {
        "BG": "Веган",
        "FR": "Végétalien",
        "EN": "Vegan",
        "IT": "Vegano"
      },
      "tag": "vegan",
      "lang": ["BG", "FR", "EN", "IT"]
    },
    {
      "label": {
        "BG": "Морски дарове",
        "FR": "Fruits de mer",
        "EN": "Seafood",
        "IT": "Frutti di mare"
      },
      "tag": "seafood",
      "lang": ["BG", "FR", "EN", "IT"]
    },
    {
      "label": {
        "BG": "Стекове",
        "FR": "Steaks",
        "EN": "Steaks",
        "IT": "Bistecche"
      },
      "tag": "steaks",
      "lang": ["BG", "FR", "EN", "IT"]
    },
    {
      "label": {
        "BG": "Паста",
        "FR": "Pâtes",
        "EN": "Pasta",
        "IT": "Pasta"
      },
      "tag": "pasta",
      "lang": ["BG", "FR", "EN", "IT"]
    },
    {
      "label": {
        "BG": "Десерти",
        "FR": "Desserts",
        "EN": "Desserts",
        "IT": "Dolci"
      },
      "tag": "desserts",
      "lang": ["BG", "FR", "EN", "IT"]
    },
    {
      "label": {
        "BG": "Специалитети",
        "FR": "Spécialités",
        "EN": "Specials",
        "IT": "Specialità"
      },
      "tag": "specials",
      "lang": ["BG", "FR", "EN", "IT"]
    },
    {
      "label": {
        "BG": "Детско меню",
        "FR": "Menu enfant",
        "EN": "Kids Menu",
        "IT": "Menu bambini"
      },
      "tag": "kids_menu",
      "lang": ["BG", "FR", "EN", "IT"]
    },
    {
      "label": {
        "BG": "Без глутен",
        "FR": "Sans gluten",
        "EN": "Gluten-Free",
        "IT": "Senza glutine"
      },
      "tag": "gluten_free",
      "lang": ["BG", "FR", "EN", "IT"]
    }
  ];

  additionalTags = [
    {
      label: {
        "BG": "Обедно меню",
        "FR": "Menu du déjeuner",
        "EN": "Lunch Menu",
        "IT": "Menu di pranzo"
      },
      tag: "lunch_menu"
    },
    {
      label: {
        "BG": "Най-поръчвани",
        "FR": "Plus commandés",
        "EN": "Most Ordered",
        "IT": "Più ordinati"
      },
      tag: "most_ordered"
    },
    {
      label: {
        "BG": "Комбос",
        "FR": "Combos",
        "EN": "Combos",
        "IT": "Combos"
      },
      tag: "combos"
    },
    {
      label: {
        "BG": "Промоции",
        "FR": "Promos",
        "EN": "Promos",
        "IT": "Promozioni"
      },
      tag: "promos"
    },
    {
      label: {
        "BG": "Щастлив час",
        "FR": "Heure Heureuse",
        "EN": "Happy Hour",
        "IT": "Happy Hour"
      },
      tag: "happy_hour"
    },
    {
      label: {
        "BG": "Семейни оферти",
        "FR": "Offres Familiales",
        "EN": "Family Deals",
        "IT": "Offerte Famiglia"
      },
      tag: "family_deals"
    },
    {
      label: {
        "BG": "Сезонни специалитети",
        "FR": "Spécialités de Saison",
        "EN": "Seasonal Specials",
        "IT": "Specialità Stagionali"
      },
      tag: "seasonal_specials"
    }
  ];

  searchControl = new FormControl('');


  constructor(
    public sharedService: SharedService
  ) {
    this.searchControl.valueChanges.pipe(
      debounceTime(300), // Wait for 300 ms of inactivity before emitting the value
      distinctUntilChanged() // Only emit if the value has changed
    ).subscribe((term: string) => {
      this.sharedService.setSearchTerm(term);
    });
  }

  onCategorySelect(tag: string) {
    const isActive = this.sharedService.isCategoryActive(tag);
    if (isActive) {
      this.sharedService.removeActiveCategory(tag);
    } else {
      this.sharedService.addActiveCategory(tag);
    }
  }

  onTagSelect(tag: string) {
    const isActive = this.sharedService.isTagActive(tag);
    if (isActive) {
      this.sharedService.removeActiveTag(tag);
    } else {
      this.sharedService.addActiveTag(tag);
    }
  }

}



