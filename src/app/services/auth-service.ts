import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { 
  IUser, 
  ILoginRequest, 
  IRegisterRequest, 
  IForgotPasswordRequest, 
  IAuthResponse 
} from '../auth/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api'; // Adjust this to your backend URL
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private currentUserSubject = new BehaviorSubject<IUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredAuth();
  }

  // Get current user
  get currentUser(): IUser | null {
    return this.currentUserSubject.value;
  }

  // Get stored token
  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Check if user is authenticated
  get isAuthenticated(): boolean {
    return !!this.token && !!this.currentUser;
  }

  // Login
  login(credentials: ILoginRequest): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => this.handleAuthSuccess(response))
      );
  }

  // Register
  register(userData: IRegisterRequest): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.API_URL}/auth/register`, userData)
      .pipe(
        tap(response => this.handleAuthSuccess(response))
      );
  }

  // Forgot password
  forgotPassword(email: IForgotPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/auth/forgot-password`, email);
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  // Refresh token (if needed)
  refreshToken(): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.API_URL}/auth/refresh`, {})
      .pipe(
        tap(response => this.handleAuthSuccess(response))
      );
  }

  // Private methods
  private handleAuthSuccess(response: IAuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  private loadStoredAuth(): void {
    const token = this.token;
    const userStr = localStorage.getItem(this.USER_KEY);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.logout();
      }
    }
  }
}
