import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Book } from '../api/book';

@Injectable({
    providedIn: 'root',
})
export class BookService {
    private basePath = 'books';

    constructor(private db: AngularFireDatabase) { }

    createBook(book: Book): Promise<any> {
        return this.db.list<Book>(this.basePath)
            .push(book)
            .then((ref) => ref.key)
            .catch((error) => {
                console.error('Erro ao criar o livro:', error);
                throw error;
            });
    }

    getBooks(): Observable<Book[]> {
        return this.db.list<Book>(this.basePath)
            .snapshotChanges()
            .pipe(
                map((changes) =>
                    changes.map((c) => ({ key: c.payload.key, ...c.payload.val() }))
                ),
                catchError((error) => {
                    console.error('Erro ao obter a lista de livros:', error);
                    return throwError(error);
                })
            );
    }

    getBookById(key: string): Observable<Book> {
        return this.db.object<Book>(`${this.basePath}/${key}`)
            .valueChanges()
            .pipe(
                catchError((error) => {
                    console.error('Erro ao obter o livro por ID:', error);
                    return throwError(error);
                })
            );
    }

    async updateBook(key: string, value: any): Promise<void> {
        try {
            await this.db.object<Book>(`${this.basePath}/${key}`).update(value);
        } catch (error) {
            console.error('Erro ao atualizar o livro:', error);
            throw error;
        }
    }

    async deleteBook(key: string): Promise<void> {
        try {
            await this.db.object<Book>(`${this.basePath}/${key}`).remove();
        } catch (error) {
            console.error('Erro ao excluir o livro:', error);
            throw error;
        }
    }
}
