import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-organizations-widget',
  templateUrl: './organizations-widget.component.html',
  styleUrls: ['./organizations-widget.component.scss']
})
export class OrganizationsWidgetComponent implements OnInit {

  hoverOrganizationsWidget = false;
  currentOrg: any = {};
  organizations;
  language = 'US';
  hidePopupTimeout;


  fakeItems = ['Menu', 'Employees', 'Recipes'];
  fakeOrg = [
    { img: 'https://marketplace.canva.com/EAFpeiTrl4c/1/0/1600w/canva-abstract-chef-cooking-restaurant-free-logo-9Gfim1S8fHg.jpg', name: 'Master Chef', email: 'master-chef@mail.com' },
    { img: 'https://static.vecteezy.com/system/resources/previews/009/361/083/original/restaurant-logo-design-free-file-free-vector.jpg', name: 'Healthy food', email: 'healthyanddelicious@mail.com' },
    { img: 'https://img.freepik.com/premium-vector/catering-quality-food-design-logo_187482-593.jpg', name: 'Cathering', email: 'catheringforyou@mail.com' },
    { img: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/restaurant-logo%2Ccatering-logo%2Cspoon-logo-icon-design-template-2ce0a2137f418d6b4083ed268b3e2834_screen.jpg?ts=1663417865', name: 'Your place', email: 'itsyourplace@mail.com' }

  ]

  ngOnInit(): void {
    let orgJSON = JSON.parse(localStorage.getItem('organizations'));
    this.organizations = Object.keys(orgJSON).map((key: string, index: number) => {
      orgJSON[key].data.organizationData.img = this.fakeOrg[index].img;
      return orgJSON[key].data.organizationData
    });
    this.currentOrg = this.organizations[0]

  }

  // Add a property for the timeout

  // Function to show the popup
  showPopup() {
    this.hoverOrganizationsWidget = true;
    if (this.hidePopupTimeout) {
      clearTimeout(this.hidePopupTimeout);
    }
  }

  // Function to schedule hiding the popup
  scheduleHidePopup() {
    this.hidePopupTimeout = setTimeout(() => {
      this.hoverOrganizationsWidget = false;
    }, 300); // Adjust the delay as necessary
  }

  // Function to cancel hiding the popup if the mouse re-enters before the timeout
  cancelHidePopup() {
    if (this.hidePopupTimeout) {
      clearTimeout(this.hidePopupTimeout);
    }
  }

}
