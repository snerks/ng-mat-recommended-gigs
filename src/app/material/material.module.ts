import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatChipsModule } from "@angular/material/chips";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatMomentDateModule } from "@angular/material-moment-adapter";

const MaterialComponents = [
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatChipsModule,
  MatCheckboxModule,
  MatIconModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatToolbarModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatMomentDateModule
];

@NgModule({
  declarations: [],
  imports: [MaterialComponents],
  exports: [MaterialComponents]
})
export class MaterialModule { }
