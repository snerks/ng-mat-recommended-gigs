import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";

import { ShowsInfo } from "./models";

@Injectable({
  providedIn: "root"
})
export class GigService {
  private showsInfoGithubUrl =
    "https://snerks.github.io/recommended-shows-ts01/recommended-shows.json";

  // private showsInfoUrl = "https://api.myjson.com/bins/6blgs";
  // private showsInfoUrl = "https://api.myjson.com/bins/BOGUS";
  private showsInfoUrl = "https://show01-cd72d.firebaseio.com/.json";

  showsInfo: ShowsInfo | null = null;
  errorMessage: string | undefined;

  constructor(private http: HttpClient) {
    const getSuccessFn = (showsInfo: ShowsInfo) => {
      // console.log("getShowsInfo:getSuccessFn");
      // console.log(showsInfo);

      this.showsInfo = showsInfo;
    };

    const getErrorFn = (error: any) => {
      // console.log("getShowsInfo:errorFn");
      // console.log(error);

      this.errorMessage = error.message;
    };

    const getCompleteFn = () => {
      // console.log("getShowsInfo:completeFn");
    };

    this.getShowsInfo().subscribe({
      next: getSuccessFn,
      error: getErrorFn,
      complete: getCompleteFn
    });
  }

  set ShowsInfo(showsInfo: ShowsInfo) {
    this.showsInfo = showsInfo;
  }

  getShowsInfo(): Observable<ShowsInfo> {
    if (this.showsInfo == null) {
      return this.http.get<ShowsInfo>(this.showsInfoUrl);
    }

    return of(this.showsInfo);
  }

  putShowsInfo(showsInfo: ShowsInfo): Observable<ShowsInfo> {
    return this.http.put<ShowsInfo>(this.showsInfoUrl, showsInfo);
  }
}
