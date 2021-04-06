import { DataSource } from "@angular/cdk/collections";
// import { MatPaginator } from "@angular/material/paginator";
// import { MatSort } from "@angular/material/sort";
// import { map } from "rxjs/operators";
import { Observable, of as observableOf, merge, BehaviorSubject } from "rxjs";
import { Show } from "../models";
import * as moment from "moment";

// // TODO: Replace this with your own data model type
// export interface GigListTableItem {
//   name: string;
//   id: number;
// }

// // TODO: replace this with real data from your application
// const EXAMPLE_DATA: GigListTableItem[] = [
//   {id: 1, name: 'Hydrogen'},
//   {id: 2, name: 'Helium'},
//   {id: 3, name: 'Lithium'},
//   {id: 4, name: 'Beryllium'},
//   {id: 5, name: 'Boron'},
//   {id: 6, name: 'Carbon'},
//   {id: 7, name: 'Nitrogen'},
//   {id: 8, name: 'Oxygen'},
//   {id: 9, name: 'Fluorine'},
//   {id: 10, name: 'Neon'},
//   {id: 11, name: 'Sodium'},
//   {id: 12, name: 'Magnesium'},
//   {id: 13, name: 'Aluminum'},
//   {id: 14, name: 'Silicon'},
//   {id: 15, name: 'Phosphorus'},
//   {id: 16, name: 'Sulfur'},
//   {id: 17, name: 'Chlorine'},
//   {id: 18, name: 'Argon'},
//   {id: 19, name: 'Potassium'},
//   {id: 20, name: 'Calcium'},
// ];

/**
 * Data source for the GigListTable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class GigListTableDataSource extends DataSource<Show> {
  data: Show[] = [];
  // paginator: MatPaginator | undefined;
  // sort: MatSort | undefined;

  private showsSubject = new BehaviorSubject<Show[]>([]);
  artistFilter = "";
  showPastEvents = false;
  thresholdInDays = 0;

  constructor(shows: Show[]) {
    super();
    this.data = shows;
  }

  loadGigs(
    artistFilter: string,
    arePastShowsRequired: boolean,
    thresholdInDays: number = 0) {

    this.artistFilter = artistFilter;
    this.showPastEvents = arePastShowsRequired;
    this.thresholdInDays = thresholdInDays;

    // // this.loadingSubject.next(true);

    // this.coursesService.findLessons(courseId, filter, sortDirection,
    // pageIndex, pageSize).pipe(
    //     catchError(() => of([])),
    //     finalize(() => this.loadingSubject.next(false))
    // )
    // .subscribe(lessons => this.lessonsSubject.next(lessons));

    this.findGigs().subscribe(shows => this.showsSubject.next(shows));
  }

  get filteredShowCount() {
    return this.showsSubject.value.length;
  }

  findGigs(): Observable<Show[]> {

    // return this.http.get("/api/lessons", {
    //     params: new HttpParams()
    //         .set("courseId", courseId.toString())
    //         .set("filter", filter)
    //         .set("sortOrder", sortOrder)
    //         .set("pageNumber", pageNumber.toString())
    //         .set("pageSize", pageSize.toString())
    // }).pipe(
    //     map(res =>  res.payload)
    // );

    const results = this.getArtistFilterShows();
    return observableOf(results);
  }

  getArtistFilterShows(): Show[] {

    const results = this.getInThresholdShows().filter(show => {
      if (!this.artistFilter) {
        return true;
      }

      const showArtistsText = show.artists.reduce(
        (previousArtistsResult, currentArtist, currentArtistIndex) => {
          const currentArtistText = currentArtist.name;

          return currentArtistIndex === 0
            ? currentArtistText
            : previousArtistsResult + " " + currentArtistText;
        },
        ""
      );

      return (
        showArtistsText
          .toLowerCase()
          .indexOf(this.artistFilter.toLowerCase()) > -1
      );
    });

    return results;
  }

  getInThresholdShows(): Show[] {
    const results = this.getInDateRangeShows().filter(show =>
      this.isRecentlyAdded(show, this.thresholdInDays)
    );

    return results;
  }

  isRecentlyAdded = (show: Show, thresholdInDays = 0) => {
    if (!show.addedDate) {
      return false;
    }

    if (thresholdInDays <= 0) {
      return true;
    }

    const addedDate = new Date(show.addedDate);
    const currentDate = new Date();

    const millisecondsSinceAdded = currentDate.getTime() - addedDate.getTime();

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const thresholdInMilliseconds = thresholdInDays * millisecondsPerDay;

    const result = millisecondsSinceAdded < thresholdInMilliseconds;

    return result;
  }

  getInDateRangeShows(): Show[] {
    const shows = this.data || [];

    if (this.showPastEvents) {
      return shows;
    }

    const results = shows.filter(this.dateRangeShowFilter);

    return results;
  }

  dateRangeShowFilter = (show: Show) => {
    const currentDateTime = new Date();

    let willShowEvent = false;

    if (this.showPastEvents) {
      willShowEvent = true;
    } else {
      const eventDate = new Date(show.date);
      const eventDateEndOfDay = moment(eventDate).endOf("day");

      const isPastEvent = eventDateEndOfDay.isBefore(currentDateTime);

      willShowEvent = !isPastEvent;
    }

    return willShowEvent;
    // tslint:disable-next-line:semicolon
  };

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<Show[]> {
    // if (this.paginator && this.sort) {
    //   // Combine everything that affects the rendered data into one update
    //   // stream for the data-table to consume.
    //   return merge(observableOf(this.data), this.paginator.page, this.sort.sortChange)
    //     .pipe(map(() => {
    //       return this.getPagedData(this.getSortedData([...this.data ]));
    //     }));
    // } else {
    //   throw Error("Please set the paginator and sort on the data source before connecting.");
    // }
    // return observableOf(this.data);

    console.log("Connecting data source");
    return this.showsSubject.asObservable();
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect(): void {}

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  // private getPagedData(data: Show[]): Show[] {
  //   if (this.paginator) {
  //     const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
  //     return data.splice(startIndex, this.paginator.pageSize);
  //   } else {
  //     return data;
  //   }
  // }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  // private getSortedData(data: Show[]): Show[] {
  //   if (!this.sort || !this.sort.active || this.sort.direction === "") {
  //     return data;
  //   }

  //   return data.sort((a, b) => {
  //     const isAsc = this.sort?.direction === "asc";
  //     switch (this.sort?.active) {
  //       case "date": return compare(a.date.toISOString(), b.date.toISOString(), isAsc);
  //       // case 'id': return compare(+a.id, +b.id, isAsc);
  //       default: return 0;
  //     }
  //   });
  // }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
// function compare(a: string | number, b: string | number, isAsc: boolean): number {
//   return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
// }
