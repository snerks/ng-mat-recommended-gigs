import { Component, OnChanges, OnInit } from "@angular/core";
import * as moment from "moment";
import { ShowsInfo, Show } from "../models";
// import { ShowService } from "../show.service";
import { ActivatedRoute } from "@angular/router";
import { GigService } from "../gig.service";

@Component({
  selector: "app-gig-list",
  templateUrl: "./gig-list.component.html",
  styleUrls: ["./gig-list.component.css"]
})
export class GigListComponent implements OnInit, OnChanges {
  showsInfo: ShowsInfo | undefined;

  artistsSearchTerm?: string;

  showPastEvents = false;

  thresholdInDays = 0;

  constructor(
    private showService: GigService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const paramMap = this.route.snapshot.paramMap;
    const days = paramMap.get("days");

    this.thresholdInDays = !!days ? +days : 0;

    this.getShowsInfo();
  }

  ngOnChanges() {

  }

  getShowsInfo(): void {
    this.showService
      .getShowsInfo()
      .subscribe({
        next: (value: ShowsInfo): void => { this.showsInfo = value; }
      });
  }

  get inDateRangeShows(): Show[] {
    const shows = this.showsInfo?.shows || [];

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

  get inThresholdShows(): Show[] {
    const results = this.inDateRangeShows.filter(show =>
      this.isRecentlyAdded(show, this.thresholdInDays)
    );

    return results;
  }

  get artistFilterShows(): Show[] {
    //     const results = this.inDateRangeShows.filter(show => {
    const results = this.inThresholdShows.filter(show => {
      if (!this.artistsSearchTerm) {
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
          .indexOf(this.artistsSearchTerm.toLowerCase()) > -1
      );
    });

    return results;
  }

  getEventIdBtsForUrl(show: Show): string {
    if (!show) {
      return "";
    }

    if (!show.eventIdBts) {
      return "";
    }

    return show.eventIdBts.toString().trim();
  }

  get sortedShows(): Show[] {
    const results = this.artistFilterShows.sort((lhs: Show, rhs: Show) => {
      const lhsDate = new Date(lhs.date);
      const rhsDate = new Date(rhs.date);

      const result = lhsDate.getTime() - rhsDate.getTime();

      return result;
    });

    return results;
  }

  getAddedInThresholdShows(thresholdInDays = 0): Show[] {
    if (!this.showsInfo) {
      return [];
    }

    return this.showsInfo.shows.filter(show => {
      return this.isRecentlyAdded(show, thresholdInDays);
    });
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

    // tslint:disable-next-line:semicolon
  };

  get allShows(): Show[] {
    if (!this.showsInfo) {
      return [];
    }

    return this.showsInfo.shows;
  }

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
}
