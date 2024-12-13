import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService } from '../services/news.service';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

interface InstagramPost {
  id: number;
  caption: string;
  media_type: string;
  media_url: string;
  permalink: string;
  is_active: boolean;
}

@Component({
  selector: 'app-news-instagram',
  templateUrl: './news-instagram.component.html',
  styleUrls: ['./news-instagram.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class NewsInstagramComponent implements OnInit {
  posts: InstagramPost[] = [];
  paging: any = {};
  currentPage: number = 1;
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  activeMessage: boolean = false;

  constructor(private newsService: NewsService, private router: Router) {}

  ngOnInit(): void {
    this.loadFirstPage();
  }

  // Mostrar mensaje temporal de éxito o error
  private showTemporaryMessage(
    type: 'success' | 'error',
    message: string,
    duration: number = 5000
  ): void {
    if (type === 'success') {
      this.successMessage = message;
    } else if (type === 'error') {
      this.errorMessage = message;
    }
    this.activeMessage = true;

    setTimeout(() => {
      this.activeMessage = false;
      if (type === 'success') {
        this.successMessage = '';
      } else if (type === 'error') {
        this.errorMessage = '';
      }
    }, duration);
  }

  // Cargar la primera página
  loadFirstPage(): void {
    const request$ = this.newsService.getFirstPageWithActiveStatus();
    this.loadPage(request$, 1);
  }

  // Cargar la siguiente página
  loadNextPage(): void {
    if (this.paging.after) {
      const request$ = this.newsService.getInstagramPostsByPage(
        'after',
        this.paging.after
      );
      this.loadPage(request$, this.currentPage + 1);
    }
  }

  // Cargar la página anterior
  loadPreviousPage(): void {
    if (this.paging.before) {
      const request$ = this.newsService.getInstagramPostsByPage(
        'before',
        this.paging.before
      );
      this.loadPage(request$, this.currentPage - 1);
    }
  }

  private loadPage(request$: Observable<any>, pageNumber: number): void {
    this.isLoading = true;
    request$.subscribe(
      (response: any) => {
        // Guardamos temporalmente las publicaciones obtenidas
        const allPosts = response.data;

        // Obtener las noticias existentes
        this.newsService.getAllNews().subscribe(
          (newsResponse: any) => {
            // Obtener los IDs de Instagram de las noticias
            const existingInstagramIds = newsResponse.data
              .filter((news: any) => news.id_instagram_post)
              .map((news: any) => news.id_instagram_post.toString());

            // Filtrar las publicaciones para excluir las ya agregadas
            this.posts = allPosts.filter(
              (post: any) => !existingInstagramIds.includes(post.id.toString())
            );

            this.paging = response.paging;
            this.currentPage = pageNumber;
            this.isLoading = false;
          },
          (error: any) => {
            this.showTemporaryMessage(
              'error',
              'No hay más páginas que mostrar'
            );
            console.error('No hay más páginas que mostrar', error);
            this.isLoading = false;
          }
        );
      },
      (error: any) => {
        this.showTemporaryMessage('error', 'No hay más páginas que mostrar');
        console.error('No hay más páginas que mostrar', error);
        this.isLoading = false;
      }
    );
  }

  addPostToNews(postId: number): void {
    this.newsService.addInstagramNews(postId.toString()).subscribe(
      (response: any) => {
        this.showTemporaryMessage(
          'success',
          'Publicación agregada correctamente a las noticias'
        );

        // Actualizar el estado del post en la lista
        const postIndex = this.posts.findIndex((post) => post.id === postId);
        if (postIndex !== -1) {
          this.posts[postIndex].is_active = true; // Cambiar el estado a activo
        }
      },
      (error: any) => {
        this.showTemporaryMessage(
          'error',
          'Error al agregar la publicación a noticias'
        );
        console.error('Error al agregar la publicación a noticias', error);
      }
    );
  }

  hasAutomaticNews(type: string): boolean {
    // Filtra las noticias existentes para verificar si ya hay una del tipo solicitado
    return this.posts.some(
      (post) => post.is_active && post.media_type?.toLowerCase() === type
    );
  }

  createAutomaticNews(type: string): void {
    // Obtener las noticias existentes para verificar el límite
    this.newsService.getAllNews().subscribe(
      (newsResponse: any) => {
        const automaticNews = newsResponse.data.filter(
          (news: any) => news.is_automatic && news.media_type?.toLowerCase() === type
        );
  
        if (automaticNews.length > 0) {
          // Mostrar mensaje de error antes de salir
          this.showTemporaryMessage(
            'error',
            `Ya existe una noticia automática de ${type === 'image' ? 'imagen' : 'video'}.`
          );
          return; // Salir porque no se debe crear una nueva noticia automática
        }
  
        // Crear la noticia automática si no hay ninguna existente
        this.newsService.createAutomaticNews(type).subscribe(
          (response: any) => {
            this.showTemporaryMessage(
              'success',
              `Noticia automatica de ${type === 'image' ? 'imagen' : 'video'} creada con éxito.`
            );
            // Recargar la primera página para actualizar la lista
            this.loadFirstPage();
          },
          (error: any) => {
            this.showTemporaryMessage('error', 'Error al crear noticia automática.');
            console.error('Error al crear noticia automática', error);
          }
        );
      },
      (error: any) => {
        this.showTemporaryMessage('error', 'Error al verificar las noticias automáticas.');
        console.error('Error al verificar las noticias automáticas', error);
      }
    );
  }

  goBack(): void {
    this.router.navigate(['/news']);
  }
}
