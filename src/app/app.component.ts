interface Person {
  name: string;
  status: string;
  specialization: string;
}
//ttp
interface MetricItem {
  label: string;
  value: number | null;
}

interface ApiResponse {
  labels: string[];
  values: (number | null)[];
  overallProgress: number;
}

import { NgModule } from '@angular/core';
import { Component, ViewChild, HostListener, signal, OnInit, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { GoogleAuthService } from './services/google-auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FilterService } from './services/filter.service';
import { ChartConfiguration, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { TsrService } from './services/tsr.service';
import { Chart, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

Chart.register(...registerables);
type MissionKey = keyof AppComponent['missionData'];

@Component({
  selector: 'app-root',
  providers: [GoogleAuthService],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDatepickerModule,
    MatFormFieldModule, MatInputModule, MatNativeDateModule, NgChartsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class AppComponent implements OnInit {
  ratingOutOf = 5;
  isWeekly = true;
  sheetData: any[] = [];
  headers: string[] = [];
  data: Person[] = [];
  userName: string = '';  // fallback default
  userSpecialization: string = ''; // fallback default
  userRating: string = '';
  isCesModalOpen = false;
  cesValue: string = '';
  cesPercentage: string = ''; // Add to your component
  fmrTimeline: string = ''; // Add to your component
  sdrPercentage: string = ''; // Add to your component
  startDate!: Date;
  endDate!: Date;
  selectedBusinessline: string = 'Select';

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  constructor(
    private googleAuth: GoogleAuthService,
    private filterService: FilterService,
    private tsrService: TsrService,
  ) { }
  //ttp
  metrics = signal<MetricItem[]>([]);
  overallProgress = signal<number>(0);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // The base URL for the Express API
  private apiUrl = 'http://localhost:3000/api/mounika'; // Adjust port if necessary



  // Helper function to safely get a numeric score
  getProgressColor(score: number | string | null): string {
    const numericScore = Number(score); 
    
    // --- START DEBUG LOG ---
    console.log(`Color Check: Score=${score}, Numeric=${numericScore}, Type=${typeof score}`);
    // --- END DEBUG LOG ---

    if (isNaN(numericScore) || numericScore < 50) return 'bg-red-500';
    if (numericScore < 80) return 'bg-yellow-500';
    
    return 'bg-green-500';
}
   
getBarWidth(score: number | string | null): number {
    const numericScore = Number(score); 
    
    // --- START DEBUG LOG ---
    let width = 0;
    if (isNaN(numericScore) || numericScore <= 0) {
        width = 0;
    } else {
        width = Math.max(numericScore, 5); 
    }
    console.log(`Width Check: Score=${score}, Numeric=${numericScore}, Returned Width=${width}`);
    return width;
    // --- END DEBUG LOG ---
}
// ... apply similar logic to getScoreTextColor ...
getScoreTextColor(score: number | string | null): string {
    const numericScore = Number(score);
    if (isNaN(numericScore) || numericScore < 50) return 'text-red-600';
    if (numericScore < 80) return 'text-yellow-600';
    return 'text-green-600';
}
// ts file (New Helper)
getBarColorValue(score: number | string | null): string {
    const numericScore = Number(score);
    // Returning hex codes for direct style application
    if (isNaN(numericScore) || numericScore < 50) return '#ef4444'; // bg-red-500
    if (numericScore < 80) return '#f59e0b'; // bg-yellow-500
    return '#10b981'; // bg-green-500
}
  // Async function to fetch data from the backend
  async fetchData(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        // Corrected syntax from template literal to string concatenation to fix the error
        throw new Error('HTTP error! status: ' + response.status);
      }

      const data: ApiResponse = await response.json();

      // 1. Calculate and set the Overall Progress
      this.overallProgress.set(data.overallProgress);

      // 2. Prepare and set the Detailed Metrics
      const detailedMetrics: MetricItem[] = [];
      data.labels.forEach((label, index) => {
        const value = data.values[index];
        // Only include metrics with valid numeric scores
        if (value !== null && typeof value === 'number') {
          detailedMetrics.push({
            label: label,
            value: parseFloat(value.toFixed(1)) // Ensure values are numbers and rounded
          });
        }
      });
      this.metrics.set(detailedMetrics);

    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      this.isLoading.set(false);
    }
  }
  weeklyPerformanceMetrics = [
    { label: 'CES', value: '80%', detail: 'Chat tickets: 11 | Web tickets: 5' },
    { label: 'FMR Timeline', value: '57.14%' },
    { label: 'SDR', value: '0%' },
    { label: 'Consult Preventability', value: '100%' },
    { label: 'Escalation Rate', value: '2.7%', detail: '2 Escalations', highlight: "#FFBF00" },
    { label: 'Well Handled Cases', value: '5' },
    { label: 'TTP', value: '40%', detail: 'analysis', highlight: '#FFBF00' },
    { label: 'Quality', value: '94.23%' },
    { label: 'TTM', value: '40%' },
    { label: 'SLS', value: '85%' },
    { label: 'Innovation/Transformation Ideas', value: '4', detail: 'view details', highlight: '#FFBF00' }
  ];


  monthlyPerformanceMetrics = [
    { label: 'CES', value: '85%', detail: 'Chat tickets: 45 | Web tickets: 20' },
    { label: 'FMR Timeline', value: '85%' },
    { label: 'SDR', value: '85%' },
    { label: 'Consult Preventability', value: '15%' },
    { label: 'Escalation Rate', value: '4%', detail: '8 Escalations', highlight: 'red' },
    { label: 'Well Handled Cases', value: '25' },
    { label: 'TTP', value: '40%', detail: 'analysis', highlight: '#FFBF00' },
    { label: 'Quality', value: '94.23%' },
    { label: 'TTM', value: '50%' },
    { label: 'SLS', value: '85%' },
    { label: 'Innovation/Transformation Ideas', value: '18', detail: 'view details', highlight: '#FFBF00' }
  ];

  performanceMetrics = this.weeklyPerformanceMetrics;

  onBusinessLineChange() {

    console.log(`HEADER: Sending business line to service: '${this.selectedBusinessline}'`);

    this.filterService.setBusinessLine(this.selectedBusinessline);
  }

  toggleData(isWeekly: boolean) {
    this.isWeekly = isWeekly;
    this.performanceMetrics = isWeekly ? this.weeklyPerformanceMetrics : this.monthlyPerformanceMetrics;
    this.caseClosedDetails = isWeekly ? this.weeklyCaseClosedDetails : this.monthlyCaseClosedDetails;

    console.log('Updated caseClosedDetails:', this.caseClosedDetails); // Debugging log
  }

  ngOnInit(): void {
    const spreadsheetId = '1mfnbjmMP6nUavrjlV5C_g7W1S4Hx72jABsfY-aQiT10';
    const range = 'Metrics!A1:Z2';
    const apiKey = 'AIzaSyB2Wal4dub_mS231LVH2yq_oPQBckF74Q4';
    this.fetchData();
    this.googleAuth.getSheetData(spreadsheetId, range, apiKey).then(data => {
      this.headers = data[0];
      this.sheetData = data.slice(1);
      const ratingIndex = this.headers.indexOf('Rating');
      const nameIndex = this.headers.indexOf('Name');
      const cesIndex = this.headers.indexOf('CES %');
      const fmrTimelineIndex = this.headers.indexOf('FMR Timelines');
      const sdrIndex = this.headers.indexOf('SDR %');
      const specializationIndex = this.headers.indexOf('Specialization');

      if (cesIndex >= 0) {
        this.cesPercentage = data[1][cesIndex];  // Use the correct row for your user
        console.log('CES %:', this.cesPercentage);
      }
      if (fmrTimelineIndex >= 0) {
        this.fmrTimeline = data[1][fmrTimelineIndex];
        console.log('FMR Timeline:', this.fmrTimeline);
      }
      if (sdrIndex >= 0) {
        this.sdrPercentage = data[1][sdrIndex];
        console.log('SDR %:', this.sdrPercentage);
      }
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
    this.loadMounikaData();

  }

    showNotification: boolean = false;

  toggleNotification(): void {
    this.showNotification = !this.showNotification;
  }
  
  // helper to prettify column names
  private prettifyLabel(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, s => s.toUpperCase());
  }

  public youVsFirstLabels: string[] = [];

  public youVsFirstData: ChartConfiguration<'bar'>['data'] = {
    labels: this.youVsFirstLabels,
    datasets: [] // will be populated with ChartDataset<'bar', number[]> items
  };

  // separate chart options
  public youVsFirstOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false, // Add this for better resizing
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    }
  };

  loadMounikaData() {
    this.tsrService.getMounika().subscribe({
      next: (response) => {
        // Check if response is valid
        if (!response || !response.labels || !response.values) {
          console.warn('No valid data returned from getMounika');
          return;
        }

        console.log('API Response received:', response);

        this.youVsFirstLabels = response.labels;
        this.youVsFirstData = {
          labels: response.labels, // Use labels from response
          datasets: [
            {
              label: 'Mounika', // Your dataset label
              data: response.values, // Use values from response
              backgroundColor: 'rgba(59,130,246,1)',
              borderColor: 'rgba(59,130,246,1)',
              borderRadius: 5
            }
          ]
        };
        // Update the chart canvas
        setTimeout(() => {
          this.chart?.update();
        }, 0);

      },
      error: (err) => {
        console.error('Failed to load mounika data', err);
      }
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

  async loadData() {

    const spreadsheetId = '1mfnbjmMP6nUavrjlV5C_g7W1S4Hx72jABsfY-aQiT10';

    const range = 'Metrics!A1:Z2';

    this.sheetData = await this.googleAuth.getSheetData(spreadsheetId, range, 'AIzaSyB2Wal4dub_mS231LVH2yq_oPQBckF74Q4');
    console.log(this.sheetData);
  }

  openCesModal() {
    const cesIndex = this.headers.indexOf('CES');

    if (this.sheetData.length > 0 && cesIndex > -1) {
      this.cesValue = this.sheetData[0][cesIndex]; // Get first row's CES, or change this logic
    } else {
      this.cesValue = 'N/A';
    }

    console.log('Fetched CES Value:', this.cesValue);
    this.isCesModalOpen = true;
  }

  closeCesModal() {
    this.isCesModalOpen = false;
  }



  //dropdown menu
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInsideMenu = target.closest('#menuDropdown');
    const clickedButton = target.closest('button');

    if (!clickedInsideMenu && !clickedButton) {
      this.menuOpen = false;
    }
  }

  isInnovationModalOpen = false;

  openInnovationModal(event?: MouseEvent) {
    if (event) {
      event.stopPropagation(); // Prevents li click bubbling
    }
    this.isInnovationModalOpen = true;
  }

  closeInnovationModal() {
    this.isInnovationModalOpen = false;
  }


  isTtpModalOpen = false;

  openTtpModal(event?: MouseEvent) {
    event?.stopPropagation();
    this.isTtpModalOpen = true;
  }


  closeTtpModal(event?: MouseEvent) {
    event?.stopPropagation?.();
    this.isTtpModalOpen = false;
  }

  //for missions 
  missionData = {
    "AI/ML in GCP": [
      "Enable AI & ML APIs in Google Cloud Console",
      "Provision and secure a Vertex AI Workbench",
      "Train a sample classification model using AutoML"
    ],
    "Data Pipeline Optimization": [
      "Profile data using Dataflow SQL",
      "Implement schema-aware transformations",
      "Enable monitoring and error alerts with Cloud Logging"
    ],
    "Vertex AI Integration": [
      "Set up a custom container for model serving",
      "Deploy to Vertex AI endpoint",
      "Test with REST API and analyze responses"
    ]
  };

  selectedTask: string = '';
  selectedMissionDetails: string[] = [];
  isModalOpen: boolean = false;

  showMissions(task: keyof typeof this.missionData) {
    this.selectedTask = task;
    this.selectedMissionDetails = this.missionData[task];
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
  isCaseClosedModalOpen: boolean = false;
  caseClosedDetails: string[] = [];

  weeklyCaseClosedDetails: string[] = [
    'Cases Resolved in 0-3 days: 3',
    'Cases Resolved in 4-7 days: 4',
    'Cases Resolved in >7 days:  2'
  ];

  monthlyCaseClosedDetails: string[] = [
    'Cases Resolved in 0-3 days: 15',
    'Cases Resolved in 4-7 days:  7',
    'Cases Resolved in >7 days:   8'
  ];

  openCaseClosedModal() {
    this.caseClosedDetails = this.isWeekly ? this.weeklyCaseClosedDetails : this.monthlyCaseClosedDetails;
    this.isCaseClosedModalOpen = true;
  }

  closeCaseClosedModal() {
    this.isCaseClosedModalOpen = false;
  }
  //key card 1
  isKeyPopupOpen = false;

  showKeyPopup() {
    this.isKeyPopupOpen = true;
  }

  closeKeyPopup() {
    this.isKeyPopupOpen = false;
  }

  //for the agree-disagree popup
  isTaskActionModalOpen: boolean = false;
  isConfirmationDialogOpen: boolean = false;
  selectedTaskForAction: string = '';
  taskActionComments: string = '';
  confirmationMessage: string = '';
  lastAction: string = '';

  openTaskActionModal(task: string) {
    this.selectedTaskForAction = task;
    this.isTaskActionModalOpen = true;
    this.taskActionComments = '';
  }

  closeTaskActionModal(action: 'acknowledge' | 'disagree') {
    if (action === 'disagree' && !this.taskActionComments.trim()) {
      alert('Comments are required for Disagree action.');
      return;
    }

    this.lastAction = action === 'acknowledge' ? 'Acknowledged' : 'Disagreed';
    this.isTaskActionModalOpen = false;
    this.isModalOpen = false;
    this.confirmationMessage = `Your response for "${this.selectedTaskForAction}" has been recorded as "${this.lastAction}".`;
    setTimeout(() => {
      this.confirmationMessage = '';
    }, 3000);
  }

  //team leaderboard
  teamLeaderboard = [
    { name: 'Hari Shankar', score: '95%' },
    { name: 'Abhishek Gupta', score: '90%' },
    { name: 'You', score: '88%', isUser: true }
  ];

  learningTasks: (keyof typeof this.missionData)[] = [
    "AI/ML in GCP",
    "Data Pipeline Optimization",
    "Vertex AI Integration"
  ];

  isCurrentUser(member: { isUser?: boolean }) {
    return member.isUser === true;
  }

  learningRequest: string = '';

  submitLearningRequest() {
    if (this.learningRequest.trim()) {
      console.log('Learning Request Submitted:', this.learningRequest);
      alert('Your learning request has been submitted successfully!');
      this.learningRequest = '';
    } else {
      alert('Please enter a learning request before submitting.');
    }
  }
}