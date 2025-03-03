import { Component, OnInit } from '@angular/core';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent {

  uplaodIcon = faCloudArrowUp;

  tabValue = 0;
  firstFileName: string = '';
  secondFileName: string = '';

  constructor() { }


  onTab(value: number){
    this.tabValue = value;
  }

  onFirstFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    console.log(input.files);
    if (input.files && input.files[0]) {
      this.firstFileName = input.files[0].name;
    } else {
      this.firstFileName = 'No file chosen';
    }
  }

  onSecondFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    console.log(input.files);
    if (input.files && input.files[0]) {
      this.secondFileName = input.files[0].name;
    } else {
      this.secondFileName = 'No file chosen';
    }
  }

}
