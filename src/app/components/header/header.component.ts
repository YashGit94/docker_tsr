import { Component } from '@angular/core';
import { FilterService } from '../../services/filter.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

    selectedBusinessline: string = 'Select';

    constructor(
        private filterService: FilterService,
        
      ) { }

   showNotification: boolean = false;

  toggleNotification(): void {
    this.showNotification = !this.showNotification;
  }

   onBusinessLineChange() {

    console.log(`HEADER: Sending business line to service: '${this.selectedBusinessline}'`);

    this.filterService.setBusinessLine(this.selectedBusinessline);
  }

}
