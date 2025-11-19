import { Component } from '@angular/core';
import { GoogleAuthService } from '../../services/google-auth.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css'
})
export class BannerComponent {

  sheetData: any[] = [];
  headers: string[] = [];
  userName: string = '';  // fallback default
  userSpecialization: string = ''; // fallback default
  userRating: string = '';
  startDate!: Date;
  endDate!: Date;

  constructor(
    private googleAuth: GoogleAuthService    
  ) { }


  ngOnInit(): void {
    const spreadsheetId = '1mfnbjmMP6nUavrjlV5C_g7W1S4Hx72jABsfY-aQiT10';
    const range = 'Metrics!A1:Z2';
    const apiKey = 'AIzaSyB2Wal4dub_mS231LVH2yq_oPQBckF74Q4';
    // this.fetchData();

    this.googleAuth.getSheetData(spreadsheetId, range, apiKey).then(data => {
      this.headers = data[0];
      this.sheetData = data.slice(1);
      const ratingIndex = this.headers.indexOf('Rating');
      const nameIndex = this.headers.indexOf('Name');
      // const cesIndex = this.headers.indexOf('CES %');
      // const fmrTimelineIndex = this.headers.indexOf('FMR Timelines');
      // const sdrIndex = this.headers.indexOf('SDR %');
      const specializationIndex = this.headers.indexOf('Specialization');

      if (this.sheetData.length > 0) {
        if (nameIndex > -1) {
          this.userName = this.sheetData[0][nameIndex];
        }
        if (specializationIndex > -1) {
          this.userSpecialization = this.sheetData[0][specializationIndex];
        }
        if (ratingIndex > -1) {
          this.userRating = this.sheetData[0][ratingIndex];
        }
      }

      console.log('Fetched userName:', this.userName);
      console.log('Fetched userSpecialization:', this.userSpecialization);
      console.log('Fetched userRating:', this.userRating);

    });

  }

  applyFilter() {

    if (!this.startDate || !this.endDate) {
      return;
    }
    if (this.startDate > this.endDate) {
      console.error('Start date cannot be after end date.');
      return;
    }
    const formattedStart = this.formatDate(this.startDate);
    const formattedEnd = this.formatDate(this.endDate);

    console.log('API CALL: Preparing to send these params:' +
      ` Start Date: ${formattedStart}, End Date: ${formattedEnd}`);


    const params = {
      startDate: formattedStart,
      endDate: formattedEnd,
    };

  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }





  

}
