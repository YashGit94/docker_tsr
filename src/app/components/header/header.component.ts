import { Component, ElementRef, HostListener } from '@angular/core';
import { FilterService } from '../../services/filter.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationsComponent } from '../notifications/notifications.component';


@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule,NotificationsComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

    selectedBusinessline: string = 'Select';

    constructor(
        private filterService: FilterService,
        private eRef: ElementRef
        
      ) { }

   showNotification: boolean = false;
   hasNewNotifications = true;
 

   onBusinessLineChange() {

    console.log(`HEADER: Sending business line to service: '${this.selectedBusinessline}'`);

    this.filterService.setBusinessLine(this.selectedBusinessline);
  }
 
 

  toggleNotification(event: MouseEvent): void {
    event.stopPropagation(); // Prevent the click from immediately triggering the document listener
    this.showNotification = !this.showNotification;
  }

  closeNotification() {
    this.showNotification = false;
  }

  // This logic handles clicking outside to close the dropdown
  @HostListener("document:click", ["$event"])
  clickout(event: Event) {
    if (this.showNotification) {
      if (!this.eRef.nativeElement.contains(event.target)) {
        this.showNotification = false;
      }
    }
  }
}
