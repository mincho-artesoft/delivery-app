import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  allOrganizations: any;
  dishes = new BehaviorSubject<any[]>([]);
  filteredDishes = new BehaviorSubject<any[]>([]); // To hold the filtered dishes

  constructor(
    public sharedService: SharedService,
    public http: HttpClient
  ) {
    this.allOrganizations = JSON.parse(localStorage.getItem('organizations'));

    this.sharedService.organizationControl.valueChanges.pipe(
      switchMap((org: any) => {
        const serviceGuid = this.allOrganizations[org._id]?.services?.manageCooking._id;
        if (serviceGuid) {
          return this.http.request('Yget', `/service?path=${serviceGuid}`);
        }
        return of([]);
      })
    ).subscribe((dishes: any) => {
      if (dishes) {
        this.dishes.next(JSON.parse(dishes).structure);
        this.applyFilters();
      } else {
        console.log('No serviceGuid available or no recipes returned.');
      }
    });


    combineLatest([
      this.sharedService.activeCategories$,
      this.sharedService.activeTags$,
      this.sharedService.search$
    ]).pipe(
      map(([categories, tags, searchQuery]) => {
        this.dishes.next(mockDishes);
        console.log(categories, tags, searchQuery)
        let filteredByCategories = [];
        if (categories.length > 0) {
          filteredByCategories = this.dishes.value.filter(dish =>
            dish.categories.some(category => categories.includes(category))
          );
        } else {
          filteredByCategories = this.dishes.value;
        }

        let filteredByTags = [];
        if (tags.length > 0) {
          filteredByTags = filteredByCategories.filter(dish =>
            dish.tags.some(tag => tags.includes(tag))
          );
        } else {
          filteredByTags = filteredByCategories;
        }

        let filteredBySearch = [];
        if (searchQuery) {
          filteredBySearch = filteredByTags.filter(dish =>
            dish.name[sharedService.languageControl.value].toLowerCase().includes(searchQuery.toLowerCase()) ||
            dish.products?.some(product =>
              product.product.toLowerCase().includes(searchQuery.toLowerCase())
            )
          );
        } else {
          filteredBySearch = filteredByTags;
        }

        return filteredBySearch;
      })
    ).subscribe(filteredDishes => {
      this.filteredDishes.next(filteredDishes);
    });

  }


  private applyFilters() {
    this.sharedService.setActiveCategories(this.sharedService.getActiveCategories());
    this.sharedService.setActiveTags(this.sharedService.getActiveTags());
    this.sharedService.setSearchTerm(this.sharedService.getSearchTerm());
  }

  decreaseQuantity(dish: any) {
    console.log(dish)
  }

  increaseQuantity(dish: any) {

  }

  openOptions(dish: any) {

  }

  addToCart(dish: any) {

  }

}


const mockDishes = [
  {
    id: 1,
    name: {
      BG: "Спагети Карбонара",
      FR: "Spaghetti Carbonara",
      EN: "Spaghetti Carbonara",
      IT: "Spaghetti alla Carbonara"
    },
    description: "Classic Italian pasta dish with a creamy egg sauce, crispy pancetta, and grated Parmesan.",
    categories: ["pasta"],
    tags: ["most_ordered", "lunch_menu"]
  },
  {
    id: 2,
    name: {
      BG: "Зеленчуково стир-фрай",
      FR: "Stir-fry de légumes",
      EN: "Vegetable Stir Fry",
      IT: "Stir Fry di Verdure"
    },
    description: "A vibrant mix of fresh vegetables quickly stir-fried with a flavorful sauce.",
    categories: ["vegan", "vegetarian"],
    tags: ["happy_hour", "promos"]
  },
  {
    id: 3,
    name: {
      BG: "Пилешко къри",
      FR: "Curry de poulet",
      EN: "Chicken Curry",
      IT: "Curry di Pollo"
    },
    description: "Tender chicken pieces simmered in a rich and aromatic curry sauce.",
    categories: ["main_courses"],
    tags: ["family_deals", "most_ordered"]
  },
  {
    id: 4,
    name: {
      BG: "Тако с говеждо",
      FR: "Tacos au boeuf",
      EN: "Beef Tacos",
      IT: "Tacos di Manzo"
    },
    description: "Juicy ground beef, fresh lettuce, and cheese served in crunchy taco shells.",
    categories: ["appetizers"],
    tags: ["lunch_menu", "combos"]
  },
  {
    id: 5,
    name: {
      BG: "Салата със сьомга и авокадо",
      FR: "Salade de saumon et avocat",
      EN: "Salmon Avocado Salad",
      IT: "Insalata di Salmone e Avocado"
    },
    description: "Fresh salmon and ripe avocado on a bed of mixed greens with a lemon dressing.",
    categories: ["salads", "healthy"],
    tags: ["seasonal_specials", "happy_hour"]
  },
  {
    id: 6,
    name: {
      BG: "Пица Маргарита",
      FR: "Pizza Margherita",
      EN: "Pizza Margherita",
      IT: "Pizza Margherita"
    },
    description: "A simple yet delicious pizza with tomato sauce, fresh mozzarella, and basil.",
    categories: ["pasta"],
    tags: ["most_ordered"]
  },
  {
    id: 7,
    name: {
      BG: "Бургер с говеждо",
      FR: "Burger au boeuf",
      EN: "Beef Burger",
      IT: "Burger di Manzo"
    },
    description: "Classic beef burger with lettuce, tomato, cheese, and a secret sauce.",
    categories: ["main_courses"],
    tags: ["lunch_menu", "most_ordered"]
  },
  {
    id: 8,
    name: {
      BG: "Веган бургер",
      FR: "Burger végan",
      EN: "Vegan Burger",
      IT: "Burger Vegano"
    },
    description: "A delicious plant-based burger that satisfies with all the classic fixings.",
    categories: ["vegan"],
    tags: ["happy_hour", "promos"]
  },
  {
    id: 9,
    name: {
      BG: "Тирамису",
      FR: "Tiramisu",
      EN: "Tiramisu",
      IT: "Tiramisu"
    },
    description: "A classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream.",
    categories: ["desserts"],
    tags: ["most_ordered", "promos"]
  },
  {
    id: 10,
    name: {
      BG: "Суши асорти",
      FR: "Assortiment de sushis",
      EN: "Sushi Assortment",
      IT: "Assortimento di Sushi"
    },
    description: "A selection of fresh sushi rolls, nigiri, and sashimi, served with soy sauce and wasabi.",
    categories: ["seafood"],
    tags: ["family_deals", "lunch_menu"]
  },
  {
    id: 11,
    name: {
      BG: "Цезар салата",
      FR: "Salade César",
      EN: "Caesar Salad",
      IT: "Insalata Cesare"
    },
    description: "Crisp romaine lettuce, parmesan cheese, croutons, and Caesar dressing.",
    categories: ["salads"],
    tags: ["most_ordered", "happy_hour"]
  },
  {
    id: 12,
    name: {
      BG: "Гъбена супа",
      FR: "Soupe aux champignons",
      EN: "Mushroom Soup",
      IT: "Zuppa di Funghi"
    },
    description: "Creamy mushroom soup made with a variety of mushrooms and a touch of thyme.",
    categories: ["soups", "vegetarian"],
    tags: ["lunch_menu", "happy_hour"]
  },
  {
    id: 13,
    name: {
      BG: "Гратен Дофин",
      FR: "Gratin Dauphinois",
      EN: "Potato Gratin",
      IT: "Gratin Dauphinois"
    },
    description: "Sliced potatoes baked in cream with garlic and cheese until golden and bubbly.",
    categories: ["main_courses", "vegetarian"],
    tags: ["family_deals", "most_ordered"]
  },
  {
    id: 14,
    name: {
      BG: "Фалафел",
      FR: "Falafel",
      EN: "Falafel",
      IT: "Falafel"
    },
    description: "Crispy deep-fried balls of spiced chickpeas, served with tahini sauce.",
    categories: ["vegan"],
    tags: ["promos", "seasonal_specials"]
  },
  {
    id: 15,
    name: {
      BG: "Патладжан по сицилиански",
      FR: "Aubergines à la sicilienne",
      EN: "Sicilian Eggplant",
      IT: "Melanzane alla Siciliana"
    },
    description: "Eggplant slices layered with cheese and tomato sauce, then baked until bubbly.",
    categories: ["vegetarian", "specials"],
    tags: ["seasonal_specials", "happy_hour"]
  }
];



