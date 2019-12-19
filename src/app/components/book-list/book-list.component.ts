import { Book } from './../../shared/book';
import { Component, ViewChild, OnInit } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { BookService } from './../../shared/book.service';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatChipInputEvent } from '@angular/material';

export interface Language {
  name: string;
}

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})

export class BookListComponent implements OnInit{ 
  dataSource: MatTableDataSource<Book>;
  removable = true;
  addOnBlur = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('chipList') chipList;
  @ViewChild('resetListBookForm') myNgForm;
  BookData: any = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  languageArray: Language[] = [];
  BindingType: any = ['Niños', 'Adolescentes (entre 12 años y 18 años)', 'Adulto Deportista', 'Adulto Medico', 'Adulto Ingeniero de Sistemas'];
  lstBookForm: FormGroup;
  displayedColumns: any[] = [
    '$key',
    'book_name',
    'author_name', 
    'publication_date',
    'in_stock',
    'action'
  ];

  ngOnInit() { 
    this.bookApi.GetBookList();
    this.submitBookForm();
  }

  submitBookForm() {
    this.lstBookForm = this.fb.group({
      binding_type: ['', [Validators.required]],
      languages: [this.languageArray]
    })
  }
  
  constructor(public fb: FormBuilder,private bookApi: BookService){
    this.bookApi.GetBookList()
    .snapshotChanges().subscribe(books => {
        books.forEach(item => {
          let a = item.payload.toJSON();
          a['$key'] = item.key;
          this.BookData.push(a as Book)
        })
        /* Data table */
        this.dataSource = new MatTableDataSource(this.BookData);
        /* Pagination */
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
        }, 0);
    })
  }

  /* Get errors */
  public handleError = (controlName: string, errorName: string) => {
    return this.lstBookForm.controls[controlName].hasError(errorName);
  }

  /* Add dynamic languages */
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    // Add language
    if ((value || '').trim() && this.languageArray.length < 5) {
      this.languageArray.push({ name: value.trim() })
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  /* Delete */
  deleteBook(index: number, e){
    if(window.confirm('Are you sure?')) {
      const data = this.dataSource.data;
      data.splice((this.paginator.pageIndex * this.paginator.pageSize) + index, 1);
      this.dataSource.data = data;
      this.bookApi.DeleteBook(e.$key)
    }
  }

  /* Remove dynamic languages */
  remove(language: Language): void {
    const index = this.languageArray.indexOf(language);
    if (index >= 0) {
      this.languageArray.splice(index, 1);
    }
  }

  /* Reset form */
  resetForm() {
    this.languageArray = [];
    this.lstBookForm.reset();
    Object.keys(this.lstBookForm.controls).forEach(key => {
      this.lstBookForm.controls[key].setErrors(null)
    });
  }

   /* Submit book */
   searchBook() {
    if (this.lstBookForm.valid){
      this.bookApi.GetBookListSearch()
      .snapshotChanges().subscribe(books => {
          books.forEach(item => {
            let a = item.payload.toJSON();
            a['$key'] = item.key;
            var topicos = a['languages'];
            for (var key in topicos) {
              if(topicos[key].name == 'Alemán')
              {
                this.BookData.push(a as Book)
              }
            }


          })
          /* Data table */
          this.dataSource = new MatTableDataSource(this.BookData);
          /* Pagination */
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
          }, 0);
      })

      //this.bookApi.GetBookListSearch(this.lstBookForm.value)
      //this.resetForm();
    }
  }
}