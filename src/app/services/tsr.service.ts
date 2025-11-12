import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TsrService {

 constructor(private http: HttpClient) {}
  getMounika(): Observable<any> {
     return this.http.get<any>('/api/mounika');
        // return this.http.get('http://backend:3000/api/mounika');

  }
}
