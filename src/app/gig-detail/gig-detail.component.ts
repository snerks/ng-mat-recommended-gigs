import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";
import { FormBuilder, Validators, FormArray, FormGroup, FormControl } from "@angular/forms";

import { Observable, of } from "rxjs";
import { debounceTime, distinctUntilChanged, map, startWith } from "rxjs/operators";
import { v1, v4 } from "uuid";

import { ShowsInfo, Show } from "../models";
import { VenueKeyMap } from "../venues-bts";
import { GigService } from "../gig.service";

@Component({
  selector: "app-gig-detail",
  templateUrl: "./gig-detail.component.html",
  styleUrls: ["./gig-detail.component.css"]
  // ,
  // providers: [{ provide: NgbDateAdapter, useClass: NgbIsoDateAdapter }]
})
export class GigDetailComponent implements OnInit {
  profileForm: FormGroup | undefined;

  isUpdating = false;
  errorMessage: string | null = null;

  knownArtists: string[] = [];

  knownArtistsSearchTerm: string | undefined = undefined;
  knownArtistsMatches: string[] = [];

  filteredKnownArtists: Observable<string[]> = of([]);
  filteredVenues: Observable<string[]> = of([]);

  showsInfo: ShowsInfo | undefined = undefined;

  // searchKnownArtists = (text$: Observable<string>) =>
  //   text$.pipe(
  //     debounceTime(200),
  //     distinctUntilChanged(),
  //     map(term => {
  //       this.knownArtistsSearchTerm = term;

  //       const results =
  //         term.length < 2
  //           ? []
  //           : this.knownArtists
  //               .filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
  //               .slice(0, 10);

  //       this.knownArtistsMatches = results;

  //       return results;
  //     })
  //     // tslint:disable-next-line:semicolon
  //   );

  // searchVenue = (text$: Observable<string>) =>
  //   text$.pipe(
  //     debounceTime(200),
  //     distinctUntilChanged(),
  //     map(
  //       term =>
  //         term.length < 2
  //           ? []
  //           : VenueKeyMap.filter(
  //               (kvp: any) =>
  //                 kvp.venueBts.name.toLowerCase().indexOf(term.toLowerCase()) >
  //                 -1
  //             )
  //               .map((kvp: any) => kvp.venueBts.name)
  //               .slice(0, 10)
  //     )
  //     // tslint:disable-next-line:semicolon
  //   );

  searchKnownArtists = (term: string) =>
  {
    console.log("searchKnownArtists : [" + term + "]");

    this.knownArtistsSearchTerm = term;

    const results =
      term.length < 2
        ? []
        : this.knownArtists
            .filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
            .slice(0, 10);

    this.knownArtistsMatches = results;

    return results;
  }

  searchVenue = (term: string): string[] => {
    console.log("searchVenue : [" + term + "]");

    if (!term || term.length < 2) {
      return [];
    }

    const results =
      VenueKeyMap.filter(
        (kvp: any) =>
          kvp.venueBts.name.toLowerCase().indexOf(term.toLowerCase()) >
          -1
      )
      .map((kvp: any) => kvp.venueBts.name as string)
      .slice(0, 10);

    return results;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private fb: FormBuilder,
    private showService: GigService
  ) {}

  ngOnInit(): void {
    const venueFormControl = this.VenueFormControl;

    if (!!venueFormControl) {
      this.filteredVenues = venueFormControl.valueChanges
        .pipe(
          startWith(""),
          map(value => this.searchVenue(value))
      );
    }

    const artistFormControl = this.ArtistFormControl;

    if (!!artistFormControl) {
      this.filteredKnownArtists = artistFormControl.valueChanges
        .pipe(
          startWith(""),
          map(value => this.searchKnownArtists(value))
      );
    }

    const flattened = (arr: string[][]) => ([] as string[]).concat(...arr);

    const getSuccessFn = (showsInfo: ShowsInfo) => {
      // console.log("getShowsInfo:getSuccessFn");
      // console.log(showsInfo);

      this.showsInfo = showsInfo;

      this.sortShows(this.showsInfo);

      this.profileForm = this.getProfileForm();

      const showsArtistNamesNested = showsInfo.shows.map(show =>
        show.artists.map(artist => artist.name)
      );

      // const showsArtistNames = this.flattenNestedArray(showsArtistNamesNested);
      const showsArtistNames = flattened(showsArtistNamesNested);

      // const uniqueShowsArtistNames = [...new Set(showsArtistNames)];
      // const uniqueShowsArtistNames = showsArtistNames.reduce((a, b) => {
      //   if (a.indexOf(b) < 0) {
      //     a.push(b);
      //   }
      //   return a;
      // }, []);

      // const uniqueShowsArtistNames: string[] = [];
      // // for (let index = 0; index < showsArtistNames.length; index++) {
      // //   const element = showsArtistNames[index];
      // //   if (uniqueShowsArtistNames.indexOf(element) < 0) {
      // //     uniqueShowsArtistNames.push(element);
      // //   }
      // // }

      // for (const showsArtistName of showsArtistNames) {
      //   if (uniqueShowsArtistNames.indexOf(showsArtistName) < 0) {
      //     uniqueShowsArtistNames.push(showsArtistName);
      //   }
      // }

      const uniqueShowsArtistNames = Array.from(new Set(showsArtistNames));

      uniqueShowsArtistNames.sort();

      this.knownArtists = uniqueShowsArtistNames;
    };

    const getErrorFn = (error: any) => {
      // console.log("getShowsInfo:errorFn");
      // console.log(error);

      this.errorMessage = error.message;
    };

    const getCompleteFn = () => {
      // console.log("getShowsInfo:completeFn");
    };

    this.showService
      .getShowsInfo()
      .subscribe(getSuccessFn, getErrorFn, getCompleteFn);
  }

  get VenueFormControl(): FormControl | null {
    if (!this.profileForm) {
      return null;
    }

    const result = this.profileForm.get("venue");

    return result as FormControl;
  }

  get ArtistFormControl(): FormControl | null {
    if (!this.profileForm) {
      return null;
    }

    const artists = this.profileForm.get("artists") as FormArray;
    const firstArtist = artists ? artists.controls[0] : null;
    const result = firstArtist ? firstArtist.get("name") : null;

    return result as FormControl;
  }

  get show(): Show | null {
    if (!this.showsInfo) {
      return null;
    }

    const { shows } = this.showsInfo;
    const id = this.route.snapshot.paramMap.get("id");

    const results = shows.filter(show => show.id === id);

    if (results.length) {
      return results[0];
    }

    return null;
  }

  getProfileForm(): FormGroup {
    if (!this.show) {
      return this.fb.group({
        id: [this.getNewGuidV4()],
        addedDate: [
          new Date().toISOString().substring(0, 10),
          Validators.required
        ],
        venue: ["", Validators.required],
        date: ["", Validators.required],
        artists: this.fb.array([
          this.fb.group({
            name: ["", Validators.required],
            stageTime: [""]
          })
        ]),

        isSoldOut: [false],
        isCancelled: [false],

        notes: [""],
        priceText: [""],
        eventIdBts: [""]
      });
    }

    // const dateString = new Date(this.show.date); // .toISOString().substring(0, 10);
    const dateString = new Date(this.show.date).toISOString().substring(0, 10);
    // const dateString = "";

    const showFormGroup = this.fb.group({
      id: [this.show.id],
      // addedDate: [
      //   this.show.addedDate
      //     ? this.show.addedDate.toISOString().substring(0, 10)
      //     : new Date().toISOString().substring(0, 10),
      //   Validators.required
      // ],
      venue: [this.show.venue, Validators.required],
      date: [dateString, Validators.required],

      // artists: this.fb.array([
      //   this.fb.group({
      //     name: ["", Validators.required]
      //   })
      // ]),

      artists: this.fb.array(
        this.show.artists.map(artist =>
          this.fb.group({
            name: [artist.name, Validators.required],
            stageTime: [artist.stageTime]
          })
        )
      ),

      isSoldOut: [!!this.show.isSoldOut],
      isCancelled: [!!this.show.isCancelled],

      notes: [this.show.notes || ""],
      priceText: [this.show.priceText || ""],
      eventIdBts: [this.show.eventIdBts || ""]
    });

    return showFormGroup;
  }

  getShowsInfo(): void {
    this.showService
      .getShowsInfo()
      .subscribe(showsInfo => (this.showsInfo = showsInfo));
  }

  onSubmit() {
    // TODO: Use EventEmitter with form value
    // console.warn(this.profileForm.value);
  }

  // flattenNestedArray<T>(array: T[][]): T[] {
  //   const flat = [].concat(...array);
  //   return flat.some(Array.isArray) ? this.flattenNestedArray(flat) : flat;
  // }

//   flattenNestedArray<T>(array: T[][], mutable: T[][] = []): T[] {
//     const toString = Object.prototype.toString;
//     const arrayTypeStr = "[object Array]";

//     const result: T[] = [];
//     const nodes = (mutable && array) || array.slice();
//     let node: any;

//     if (!array.length) {
//         return result;
//     }

//     node = nodes.pop();

//     do {
//         if (toString.call(node) === arrayTypeStr) {
//             nodes.push.apply(nodes, node);
//         } else {
//             result.push(node);
//         }
//     } while (nodes.length && (node = nodes.pop()) !== undefined);

//     result.reverse(); // we reverse result to restore the original order
//     return result;
// }

  get profileFormJson() {
    if (this.profileForm) {
      return JSON.stringify(this.profileForm.value, null, 2);
    }

    return "{}";
  }

  get artists() {
    return this.profileForm!.get("artists") as FormArray;
  }

  addArtist() {
    this.artists.push(
      this.fb.group({
        name: ["", Validators.required]
      })
    );
  }

  isRecentlyAdded = (show: Show, thresholdInDays = 1) => {
    if (!show.addedDate) {
      return false;
    }

    const addedDate = new Date(show.addedDate);
    const currentDate = new Date();

    const millisecondsSinceAdded = currentDate.getTime() - addedDate.getTime();

    // const thresholdInDays = 3;
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const thresholdInMilliseconds = thresholdInDays * millisecondsPerDay;

    const result = millisecondsSinceAdded < thresholdInMilliseconds;

    return result;

    // tslint:disable-next-line:semicolon
  };

  get addedTodayShows(): Show[] {
    if (!this.showsInfo) {
      return [];
    }

    return this.showsInfo.shows.filter(show => {
      return this.isRecentlyAdded(show, 1);
    });
  }

  get addedWithin3DaysShows(): Show[] {
    if (!this.showsInfo) {
      return [];
    }

    return this.showsInfo.shows.filter(show => {
      return this.isRecentlyAdded(show, 3);
    });
  }

  get addedWithin7DaysShows(): Show[] {
    if (!this.showsInfo) {
      return [];
    }

    return this.showsInfo.shows.filter(show => {
      return this.isRecentlyAdded(show, 7);
    });
  }

  cancelUpdateShow() {
    this.location.back();
  }

  submitShow() {
    this.isUpdating = true;
    this.errorMessage = null;

    const showJson = this.profileFormJson;
    const show = JSON.parse(showJson);

    const isCleanupRequired = false;

    if (!show.id) {
      show.id = this.getNewGuidV4();
    }

    const getSuccessFn = (showsInfo: ShowsInfo) => {
      // console.log("getShowsInfo:getSuccessFn");
      // console.log(showsInfo);

      showsInfo.shows.forEach(showForUuid => {
        if (!showForUuid.id) {
          showForUuid.id = this.getNewGuidV4();
        }

        if (!showForUuid.addedDate) {
          // Month is zero-based : 8 = Sept
          showForUuid.addedDate = new Date(2018, 8, 17, 12, 0, 0);
        }
      });

      showsInfo.lastUpdated = new Date();

      // if (!isCleanupRequired) {
      //   showsInfo.shows.push(show);
      // }

      if (!isCleanupRequired) {
        const showToUpdate = showsInfo.shows.find(
          showToFind => showToFind.id === show.id
        );

        if (showToUpdate) {
          showToUpdate.date = show.date;
          showToUpdate.venue = show.venue;

          showToUpdate.artists = show.artists;

          showToUpdate.isSoldOut = show.isSoldOut;
          showToUpdate.isCancelled = show.isCancelled;

          showToUpdate.notes =
            show.notes.trim() === "" ? undefined : show.notes.trim();

          showToUpdate.priceText =
            show.priceText.trim() === "" ? undefined : show.priceText.trim();

          if (show.eventIdBts) {
            if (show.eventIdBts.trim) {
              showToUpdate.eventIdBts =
                show.eventIdBts.trim() === ""
                  ? undefined
                  : show.eventIdBts.trim();
            } else {
              showToUpdate.eventIdBts = show.eventIdBts;
            }
          } else {
            showToUpdate.eventIdBts = undefined;
          }
        } else {
          showsInfo.shows.push(show);
        }
      }

      this.sortShows(showsInfo);

      const putSuccessFn = (nextShowsInfo: ShowsInfo) => {
        console.log("putShowsInfo:successFn");
        console.log(nextShowsInfo);

        this.showsInfo = nextShowsInfo;

        this.showService.ShowsInfo = nextShowsInfo;

        // this.router.navigate(["/list/0"]);
        this.location.back();
      };

      const putErrorFn = (error: any) => {
        console.log("putShowsInfo:errorFn");
        console.log(error);

        this.errorMessage = error.message;
      };

      const putCompleteFn = () => {
        // console.log("putShowsInfo:completeFn");

        // this.isUpdating = false;
      };

      if (isCleanupRequired) {
        const cleanedShows = showsInfo.shows.filter(
          showToFilter =>
            !showToFilter.artists.some(
              artist =>
                artist.name === "Frank Sinatra" ||
                artist.name === "Led Zeppelin"
            )
        );

        showsInfo.shows = cleanedShows;
      }

      this.showService
        .putShowsInfo(showsInfo)
        .subscribe(putSuccessFn, putErrorFn, putCompleteFn);
    };

    const getErrorFn = (error: any) => {
      // console.log("getShowsInfo:errorFn");
      // console.log(error);

      this.isUpdating = false;
      this.errorMessage = error.message;
    };

    const getCompleteFn = () => {
      // console.log("getShowsInfo:completeFn");
      this.isUpdating = false;
    };

    this.showService
      .getShowsInfo()
      .subscribe(getSuccessFn, getErrorFn, getCompleteFn);
  }

  getNewGuidV1(): string {
    const result = v1();
    return result;
  }

  getNewGuidV4() {
    const result = v4();
    return result;
  }

  sortShows(showsInfo: ShowsInfo): void {
    showsInfo.shows.sort((lhs: Show, rhs: Show) => {
      const lhsDate = new Date(lhs.date);
      const rhsDate = new Date(rhs.date);

      // const result = lhsDate.getTime() - rhsDate.getTime();
      const lhsTime = lhsDate.getTime();
      const rhsTime = rhsDate.getTime();

      if (lhsTime === rhsTime) {
        return lhs.id! < rhs.id! ? -1 : lhs.id! > rhs.id! ? 1 : 0;
      } else {
        return lhsTime - rhsTime;
      }
    });
  }
}
