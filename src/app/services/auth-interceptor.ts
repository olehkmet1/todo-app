import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Get token from localStorage
  const token = localStorage.getItem('auth_token');
  
  // Clone the request and add the authorization header if token exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle the request and catch any errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        // Clear stored auth data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        
        // Redirect to login page (you can inject Router here if needed)
        // For now, we'll just log the error
        console.log('Authentication failed, redirecting to login...');
      }
      
      return throwError(() => error);
    })
  );
};
