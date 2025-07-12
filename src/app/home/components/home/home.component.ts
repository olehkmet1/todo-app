import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth-service';
import { ITodo } from '../../interfaces';
import { IUser } from '../../../auth/interfaces';

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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadTodos();
      }
    });
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
