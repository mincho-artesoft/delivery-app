import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-team-widget',
  templateUrl: './team-widget.component.html',
  styleUrls: ['./team-widget.component.scss']
})
export class TeamWidgetComponent implements OnInit {
  @Input('control') control: any;
  @Input('index') index: any;

  fakeOrg = [
    { img: 'https://marketplace.canva.com/EAFpeiTrl4c/1/0/1600w/canva-abstract-chef-cooking-restaurant-free-logo-9Gfim1S8fHg.jpg', name: 'Master Chef', email: 'master-chef@mail.com' },
    { img: 'https://static.vecteezy.com/system/resources/previews/009/361/083/original/restaurant-logo-design-free-file-free-vector.jpg', name: 'Healthy food', email: 'healthyanddelicious@mail.com' },
    { img: 'https://img.freepik.com/premium-vector/catering-quality-food-design-logo_187482-593.jpg', name: 'Cathering', email: 'catheringforyou@mail.com' },
    { img: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/restaurant-logo%2Ccatering-logo%2Cspoon-logo-icon-design-template-2ce0a2137f418d6b4083ed268b3e2834_screen.jpg?ts=1663417865', name: 'Your place', email: 'itsyourplace@mail.com' }

  ]

  ngOnInit(): void {
  }
}
