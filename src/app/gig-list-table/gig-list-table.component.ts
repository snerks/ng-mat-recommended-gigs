import { AfterViewInit, Component, Input, OnChanges, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTable } from "@angular/material/table";
import { Show, ShowsInfo } from "../models";
import { GigListTableDataSource } from "./gig-list-table-datasource";

@Component({
  selector: "app-gig-list-table",
  templateUrl: "./gig-list-table.component.html",
  styleUrls: ["./gig-list-table.component.css"]
})
export class GigListTableComponent implements AfterViewInit, OnChanges {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Show>;
  dataSource: GigListTableDataSource;

  @Input()
  shows: Show[] | undefined;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ["day", "date", "artists", "venue", "id", "notes"];

  constructor() {
    this.dataSource = new GigListTableDataSource(!!this.shows ? this.shows : []);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  ngOnChanges() {
    this.dataSource = new GigListTableDataSource(!!this.shows ? this.shows : []);
  }
}