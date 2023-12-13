import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-services-editor',
  templateUrl: './services-editor.component.html',
  styleUrls: ['./services-editor.component.scss']
})
export class ServicesEditorComponent implements OnInit {
  @Input('column') column: any;

  ngOnInit(): void {
    this.column.columns[0].control.root.valueChanges.subscribe(change => {
      console.log(change)
    });
  }

  toggleExpand(event, option: any): void {
    event.stopPropagation();
    option.isExpanded = !option.isExpanded;
}

}
