import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DynamicService } from '../../../services/dynamic.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-custom-snackbar',
  templateUrl: './custom-snackbar.component.html',
  styleUrls: ['./custom-snackbar.component.scss']
})
export class CustomSnackbarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
    private sanitizer: DomSanitizer,
    public snackBarRef: MatSnackBarRef<CustomSnackbarComponent>,
    private dynamicService: DynamicService,
    private router: Router) {
    data.messages = data.messages.map(message => {
      return {
        text: this.sanitizeHtml(message.text),
        additionalData: message
      };
    });
  }

  sanitizeHtml(htmlContent: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  close() {
    this.snackBarRef.dismiss();
  }

  navigate(data: any) {
    this.dynamicService.selectedOrganization.patchValue(data.org);
    this.dynamicService.serviceGuid = data._id;
    this.router.navigateByUrl(data.url);
  }
}
