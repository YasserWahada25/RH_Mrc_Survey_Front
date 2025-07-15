import {
  Component,
  Inject,
  Optional,
  ViewChild,
  AfterViewInit,
  OnInit
} from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { CommonModule, DatePipe } from '@angular/common';
import { AppAddEmployeeComponent } from './add/add.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface Employee {
  id: number;
  Name: string;
  Position: string;
  Email: string;
  DateOfJoining: Date;
  imagePath: string;
  nom?: string;
  email?: string;
  type?: string;
  password?: string;
  _id?: string;
  acces?: boolean;
}

@Component({
  templateUrl: './employee.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule,
    MatNativeDateModule,
    DatePipe,
    AppAddEmployeeComponent
  ],
  providers: [DatePipe],
})
export class AppEmployeeComponent implements AfterViewInit, OnInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  searchText: any;
  displayedColumns: string[] = [
    '#',
    'name',
    'email',
    'type',     // <-- ajouté
    'added_by', // <-- ajouté
    'status',   // <-- ajouté
    'date of joining',
    'action',
  ];
  dataSource = new MatTableDataSource<Employee>();

  constructor(
    public dialog: MatDialog,
    public datePipe: DatePipe,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.fetchEmployees();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  fetchEmployees(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No auth token found!');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    

    this.http.get<any[]>('http://localhost:3033/api/users', { headers }).subscribe({
      next: (users) => {
         console.log('✅ Données utilisateurs reçues :', users); // 👀 Vérifie bien addedBy ici
        const transformed = users.map((user, index) => ({
          id: index + 1,
          _id: user._id,
          Name: user.nom || 'N/A',
          Position: user.type || 'N/A',
          Email: user.email || 'N/A',
          added_by: user.addedBy || 'Système',
          status: user.actif ? 'Activé' : 'Désactivé',
          acces: user.acces,
          DateOfJoining: new Date(),
          imagePath: 'assets/images/profile/user-1.jpg',
          nom: user.nom,
          email: user.email,
          type: user.type
        }));
        this.dataSource.data = transformed;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      },
    });
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialog(action: string, obj: any): void {
    if (action === 'Add') {
      const dialogRef = this.dialog.open(AppAddEmployeeComponent, {
        width: '600px',
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          this.fetchEmployees();
        }
      });
    } else {
      obj.action = action;
      const dialogRef = this.dialog.open(AppEmployeeDialogContentComponent, {
        width: '600px',
        data: obj,
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result.event === 'Update') {
          this.updateRowData(result.data);
        } else if (result.event === 'Delete') {
          this.deleteRowData(result.data);
        }
      });
    }
  }

  addRowData(row_obj: Employee): void {
    this.dataSource.data.unshift({
      id: this.dataSource.data.length + 1,
      Name: row_obj.Name,
      Position: row_obj.Position,
      Email: row_obj.Email,
      DateOfJoining: new Date(),
      imagePath: row_obj.imagePath,
    });
    this.table.renderRows();
  }

  updateRowData(row_obj: Employee): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    if (!row_obj._id) return;

    this.http.put(`http://localhost:3033/api/users/${row_obj._id}`, row_obj, { headers }).subscribe({
      next: () => {
        this.fetchEmployees();
      },
      error: (err) => {
        console.error('Update failed:', err);
      },
    });
  }

  deleteRowData(row_obj: Employee): void {
    if (!row_obj._id) {
      console.error('Impossible de supprimer : id manquant');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No auth token found!');
      return;
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`http://localhost:3033/api/users/${row_obj._id}`, { headers }).subscribe({
      next: () => {
        this.fetchEmployees();
      },
      error: (err) => {
        console.error('Erreur lors de la suppression:', err);
      }
    });
  }

toggleAccess(user: Employee): void {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  const payload = { acces: !user.acces }; // 👈 envoyer la valeur opposée

  this.http.patch(`http://localhost:3033/api/users/acces/${user._id}`, payload, { headers }).subscribe({
    next: () => {
      this.fetchEmployees(); // ✅ recharge les données pour voir la nouvelle valeur
    },
    error: (err) => {
      console.error('Erreur lors de la modification de l’accès :', err);
    }
  });
}

}
  
@Component({
  selector: 'app-dialog-content',
  standalone: true,
  imports: [MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: 'employee-dialog-content.html',
  providers: [DatePipe],
})
export class AppEmployeeDialogContentComponent {
  action: string;
  local_data: any;
  selectedImage: any = '';
  joiningDate: any = '';

  constructor(
    public datePipe: DatePipe,
    public dialogRef: MatDialogRef<AppEmployeeDialogContentComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Employee
  ) {
    this.local_data = { ...data };
    this.action = this.local_data.action;
    if (this.local_data.DateOfJoining !== undefined) {
      this.joiningDate = this.datePipe.transform(
        new Date(this.local_data.DateOfJoining),
        'yyyy-MM-dd'
      );
    }
    if (this.local_data.imagePath === undefined) {
      this.local_data.imagePath = 'assets/images/profile/user-1.jpg';
    }
  }

  doAction(): void {
    this.dialogRef.close({ event: this.action, data: this.local_data });
  }

  closeDialog(): void {
    this.dialogRef.close({ event: 'Cancel' });
  }

  selectFile(event: any): void {
    if (!event.target.files[0]) return;
    const mimeType = event.target.files[0].type;
    if (mimeType.match(/image\/*/) == null) return;

    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = () => {
      this.local_data.imagePath = reader.result;
    };
  }
}
