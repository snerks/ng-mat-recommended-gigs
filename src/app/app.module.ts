import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule } from "./material/material.module";
import { HomeComponent } from "./home/home.component";
import { HttpClientModule } from "@angular/common/http";
import { GigListComponent } from "./gig-list/gig-list.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { GigListTableComponent } from "./gig-list-table/gig-list-table.component";

import { GigDetailComponent } from "./gig-detail/gig-detail.component";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    GigListComponent,
    GigListTableComponent,
    GigDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
