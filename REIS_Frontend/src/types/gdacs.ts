// Types for the API response
export type GdacsReportResponse = {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    eventtype: string;
    eventid: number;
    episodeid: number;
    eventname: string;
    glide: string;
    name: string;
    description: string;
    htmldescription: string;
    icon: string;
    iconoverall: string | null;
    url: {
      geometry: string;
      report: string;
      media: string;
    };
    alertlevel: string;
    alertscore: number;
    episodealertlevel: string;
    episodealertscore: number;
    istemporary: string;
    iscurrent: string;
    country: string;
    fromdate: string;
    todate: string;
    datemodified: string;
    iso3: string;
    source: string;
    sourceid: string;
    polygonlabel: string;
    Class: string;
    affectedcountries: {
      iso2: string;
      iso3: string;
      countryname: string;
    }[];
    severitydata: {
      severity: number;
      severitytext: string;
      severityunit: string;
    };
    episodes: {
      details: string;
    }[];
    sendai?: {
      latest: boolean;
      sendaitype: string;
      sendainame: string;
      sendaivalue: string;
      country: string;
      region: string;
      dateinsert: string;
      description: string;
      onset_date: string;
      expires_date: string;
      effective_date: string | null;
    }[];
    impacts: any[];
    images: {
      populationmap?: string;
      floodmap_cached: string;
      thumbnailmap_cached: string;
      rainmap_cached: string;
      overviewmap_cached: string;
      overviewmap: string;
      floodmap: string;
      rainmap: string;
      rainmap_legend: string;
      floodmap_legend: string;
      overviewmap_legend: string;
      rainimage: string;
      meteoimages: string;
      mslpimages: string;
      event_icon_map: string;
      event_icon: string;
      thumbnailmap: string;
      npp_icon: string;
      
    };
    additionalinfos: Record<string, any>;
    documents: Record<string, any>;
    report_id?: string;
    user_id?: string;
    disaster_type?: string;
    summary?: string;
    created_at?: string;
  };
}