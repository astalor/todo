import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  login(email: string, password: string) {
    return this.http.post<any>('/api/auth/login', { email, password }).pipe(
      tap(res => {
        localStorage.setItem('tm_token', res.token);
        localStorage.setItem('tm_user', JSON.stringify(res.user));
      })
    );
  }

  register(name: string, email: string, password: string) {
    return this.http.post<any>('/api/auth/register', { name, email, password }).pipe(
      tap(res => {
        localStorage.setItem('tm_token', res.token);
        localStorage.setItem('tm_user', JSON.stringify(res.user));
      })
    );
  }

  me() {
    return this.http.get<any>('/api/auth/me');
  }

  logout() {
    localStorage.removeItem('tm_token');
    localStorage.removeItem('tm_user');
  }

  user() {
    const u = localStorage.getItem('tm_user');
    return u ? JSON.parse(u) : null;
  }
}
