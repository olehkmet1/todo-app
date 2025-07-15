import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth-service';
import { ITodo } from '../../interfaces';
import { IUser } from '../../../auth/interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  currentUser: IUser | null = null;
  todos: ITodo[] = [];
  newTodoTitle: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadTodos();
      }
    });
    // Fetch user profile if token exists but currentUser is null
    if (!this.currentUser && this.authService.token) {
      this.authService.getProfile().subscribe({
        next: (user) => {
          this.currentUser = user;
        },
        error: (err) => {
          console.error('Failed to fetch user profile:', err);
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }
      });
    }
  }

  addTodo(): void {
    if (this.newTodoTitle.trim()) {
      const newTodo: ITodo = {
        id: Date.now().toString(),
        title: this.newTodoTitle.trim(),
        completed: false,
        createdAt: new Date()
      };
      
      this.todos.unshift(newTodo);
      this.newTodoTitle = '';
      this.saveTodos();
    }
  }

  toggleTodo(todo: ITodo): void {
    todo.completed = !todo.completed;
    this.saveTodos();
  }

  deleteTodo(todoId: string): void {
    this.todos = this.todos.filter(todo => todo.id !== todoId);
    this.saveTodos();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  private loadTodos(): void {
    const storedTodos = localStorage.getItem(`todos_${this.currentUser?.id}`);
    if (storedTodos) {
      try {
        this.todos = JSON.parse(storedTodos).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt)
        }));
      } catch (error) {
        console.error('Error loading todos:', error);
        this.todos = [];
      }
    }
  }

  private saveTodos(): void {
    if (this.currentUser) {
      localStorage.setItem(`todos_${this.currentUser.id}`, JSON.stringify(this.todos));
    }
  }
}
