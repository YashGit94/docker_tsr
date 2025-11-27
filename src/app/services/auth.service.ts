import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  
  // This is where your real backend URL would go later
private apiUrl = 'http://localhost:8080/api/auth/login';
  constructor() { }

  login(credentials: any): Observable<any> {
    
    const ALLOWED_ROLES = ['Technical Troubleshooting Agent', 'Team Lead', 'Operations Manager'];
    
    const validUsers = [
      { name: 'Shirisha', email: 'singamshirisha@google.com', password: 'user@123', role: 'Technical Troubleshooting Agent' },
      { name: 'Saachi', email: 'sshrikhande@google.com', password: 'user@123', role: 'Technical Troubleshooting Agent' },
      { name: 'Abhishek Kumar', email: 'aaabhishekkmr@google.com', password: 'user@123', role: 'Technical Troubleshooting Agent' },
      { name: 'Swaranna Srikanth Reddy', email: 'reddysw@google.com', password: 'user@123', role: 'Team Lead' },
      { name: 'Harisankar PN', email: 'harisankar@google.com', password: 'user@123', role: 'Operations Manager' },
    ];

    const foundUser = validUsers.find(user => 
      user.email === credentials.email && 
      user.password === credentials.password &&
      user.name === credentials.name 
      // && user.role === credentials.role
    );
    
    if (foundUser) {
      // User found! Now WE check the role (User doesn't get to choose)
      
      if (ALLOWED_ROLES.includes(foundUser.role)) {
        
        // SUCCESS
        return of({ token: 'fake-jwt-' + foundUser.role, user: foundUser.name, role: foundUser.role }).pipe(
          delay(1000), 
          tap(res => localStorage.setItem('token', res.token))
        );

      } else {
        // FOUND, BUT WRONG ROLE
        return new Observable(observer => {
          setTimeout(() => {
            observer.error({ 
              status: 403, 
              // This error explains exactly why they failed
              message: `Access Denied. You are a ${foundUser.role}, but this page is for: ${ALLOWED_ROLES.join(' or ')}.`
            });
          }, 1000);
        });
      }

    } else {
      // NOT FOUND (Wrong Email/Pass/Name)
      return new Observable(observer => {
        setTimeout(() => {
          observer.error({ status: 401, message: 'Invalid Credentials' });
        }, 1000);
      });
    }
  }
  

  // Helper to remove token on logout
  logout() {
    localStorage.removeItem('token');
  }

  // Helper to check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}