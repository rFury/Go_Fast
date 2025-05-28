import { DecimalPipe, NgFor } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsService } from './analytics.service';

@Component({
  selector: 'analytics',
  templateUrl: './analytics.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatButtonToggleModule,
    NgApexchartsModule,
    MatTooltipModule,
    NgFor,
    DecimalPipe,
  ],
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  chartVisitors: ApexOptions;
  chartConversions: ApexOptions;
  chartImpressions: ApexOptions;
  chartVisits: ApexOptions;
  chartVisitorsVsPageViews: ApexOptions;
  chartNewVsReturning: ApexOptions;
  chartGender: ApexOptions;
  chartAge: ApexOptions;
  chartLanguage: ApexOptions;
  data: any;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    private _analyticsService: AnalyticsService,
    private _router: Router
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.data = {
      visitors: {
        series: {
          'this-year': [
            { x: '2024-07-01', y: 1200 },
            { x: '2024-08-01', y: 1400 },
            { x: '2024-09-01', y: 1600 },
            { x: '2024-10-01', y: 1800 },
            { x: '2024-11-01', y: 2000 },
            { x: '2024-12-01', y: 2200 },
            { x: '2025-01-01', y: 2400 },
            { x: '2025-02-01', y: 2600 },
            { x: '2025-03-01', y: 2800 },
            { x: '2025-04-01', y: 3000 },
            { x: '2025-05-01', y: 3200 },
          ],
          'last-year': [
            { x: '2023-07-01', y: 1000 },
            { x: '2023-08-01', y: 1200 },
            { x: '2023-09-01', y: 1400 },
            { x: '2023-10-01', y: 1600 },
            { x: '2023-11-01', y: 1800 },
            { x: '2023-12-01', y: 2000 },
            { x: '2024-01-01', y: 2200 },
            { x: '2024-02-01', y: 2400 },
            { x: '2024-03-01', y: 2600 },
            { x: '2024-04-01', y: 2800 },
            { x: '2024-05-01', y: 3000 },
          ],
        },
      },
      conversions: {
        amount: 4123,
        series: [
            {
                name: 'Conversions',
                data: [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]
            }
        ],
        labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11']
    },
      impressions: {
        amount: 46085,
        series: [
          {
            name: 'Impressions',
            data: [500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500],
          },
        ],
        labels: [
          'Day 1',
          'Day 2',
          'Day 3',
          'Day 4',
          'Day 5',
          'Day 6',
          'Day 7',
          'Day 8',
          'Day 9',
          'Day 10',
          'Day 11',
        ],
      },
      visits: {
        amount: 62083,
        series: [
          {
            name: 'Visits',
            data: [
              700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700,
            ],
          },
        ],
        labels: [
          'Day 1',
          'Day 2',
          'Day 3',
          'Day 4',
          'Day 5',
          'Day 6',
          'Day 7',
          'Day 8',
          'Day 9',
          'Day 10',
          'Day 11',
        ],
      },
      visitorsVsPageViews: {
        series: [
          {
            name: 'Visitors',
            data: [
              { x: '2025-04-25', y: 1000 },
              { x: '2025-04-28', y: 1200 },
              { x: '2025-05-01', y: 1400 },
              { x: '2025-05-04', y: 1600 },
              { x: '2025-05-07', y: 1800 },
              { x: '2025-05-10', y: 2000 },
              { x: '2025-05-13', y: 2200 },
              { x: '2025-05-16', y: 2400 },
              { x: '2025-05-19', y: 2600 },
              { x: '2025-05-22', y: 2800 },
              { x: '2025-05-25', y: 3000 },
            ],
          },
          {
            name: 'Page Views',
            data: [
              { x: '2025-04-25', y: 1500 },
              { x: '2025-04-28', y: 1800 },
              { x: '2025-05-01', y: 2100 },
              { x: '2025-05-04', y: 2400 },
              { x: '2025-05-07', y: 2700 },
              { x: '2025-05-10', y: 3000 },
              { x: '2025-05-13', y: 3300 },
              { x: '2025-05-16', y: 3600 },
              { x: '2025-05-19', y: 3900 },
              { x: '2025-05-22', y: 4200 },
              { x: '2025-05-25', y: 4500 },
            ],
          },
        ],
        overallScore: 472,
        averageRatio: 45,
        predictedRatio: 55,
      },
      newVsReturning: {
        labels: ['New', 'Returning'],
        series: [80, 20],
        uniqueVisitors: 46085,
      },
      gender: {
        labels: ['Male', 'Female'],
        series: [55, 45],
        uniqueVisitors: 46085,
      },
      age: {
        labels: ['Under 30', 'Over 30'],
        series: [35, 65],
        uniqueVisitors: 46085,
      },
      language: {
        labels: ['English', 'Other'],
        series: [25, 75],
        uniqueVisitors: 46085,
      },
    };

    // Attach SVG fill fixer to all ApexCharts
    window['Apex'] = {
      chart: {
        events: {
          mounted: (chart: any, options?: any): void => {
            this._fixSvgFill(chart.el);
          },
          updated: (chart: any, options?: any): void => {
            this._fixSvgFill(chart.el);
          },
        },
      },
    };
    this._prepareChartData();
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  private _fixSvgFill(element: Element): void {
    // Current URL
    const currentURL = this._router.url;

    // 1. Find all elements with 'fill' attribute within the element
    // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
    // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
    Array.from(element.querySelectorAll('*[fill]'))
      .filter((el) => el.getAttribute('fill')!.indexOf('url(') !== -1)
      .forEach((el) => {
        const attrVal = el.getAttribute('fill');
        el.setAttribute(
          'fill',
          `url(${currentURL}${attrVal!.slice(attrVal!.indexOf('#'))}`
        );
      });
  }

  /**
   * Prepare the chart data from the data
   *
   * @private
   */
  private _prepareChartData(): void {
    // Visitors
    this.chartVisitors = {
      chart: {
        animations: {
          speed: 400,
          animateGradually: {
            enabled: false,
          },
        },
        fontFamily: 'inherit',
        foreColor: 'inherit',
        width: '100%',
        height: '100%',
        type: 'area',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      colors: ['#818CF8'],
      dataLabels: {
        enabled: false,
      },
      fill: {
        colors: ['#312E81'],
      },
      grid: {
        show: true,
        borderColor: '#334155',
        padding: {
          top: 10,
          bottom: -40,
          left: 0,
          right: 0,
        },
        position: 'back',
        xaxis: {
          lines: {
            show: true,
          },
        },
      },
      series: this.data.visitors.series,
      stroke: {
        width: 2,
      },
      tooltip: {
        followCursor: true,
        theme: 'dark',
        x: {
          format: 'MMM dd, yyyy',
        },
        y: {
          formatter: (value: number): string => `${value}`,
        },
      },
      xaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          stroke: {
            color: '#475569',
            dashArray: 0,
            width: 2,
          },
        },
        labels: {
          offsetY: -20,
          style: {
            colors: '#CBD5E1',
          },
        },
        tickAmount: 20,
        tooltip: {
          enabled: false,
        },
        type: 'datetime',
      },
      yaxis: {
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        min: (min): number => min - 750,
        max: (max): number => max + 250,
        tickAmount: 5,
        show: false,
      },
    };

    // Conversions
    this.chartConversions = {
      chart: {
        animations: {
          enabled: false,
        },
        fontFamily: 'inherit',
        foreColor: 'inherit',
        height: '100%',
        type: 'area',
        sparkline: {
          enabled: true,
        },
      },
      colors: ['#38BDF8'],
      fill: {
        colors: ['#38BDF8'],
        opacity: 0.5,
      },
      series: this.data.conversions.series,
      stroke: {
        curve: 'smooth',
      },
      tooltip: {
        followCursor: true,
        theme: 'dark',
      },
      xaxis: {
        type: 'category',
        categories: this.data.conversions.labels,
      },
      yaxis: {
        labels: {
          formatter: (val): string => val.toString(),
        },
      },
    };

    // Impressions
    this.chartImpressions = {
      chart: {
        animations: {
          enabled: false,
        },
        fontFamily: 'inherit',
        foreColor: 'inherit',
        height: '100%',
        type: 'area',
        sparkline: {
          enabled: true,
        },
      },
      colors: ['#34D399'],
      fill: {
        colors: ['#34D399'],
        opacity: 0.5,
      },
      series: this.data.impressions.series,
      stroke: {
        curve: 'smooth',
      },
      tooltip: {
        followCursor: true,
        theme: 'dark',
      },
      xaxis: {
        type: 'category',
        categories: this.data.impressions.labels,
      },
      yaxis: {
        labels: {
          formatter: (val): string => val.toString(),
        },
      },
    };

    // Visits
    this.chartVisits = {
      chart: {
        animations: {
          enabled: false,
        },
        fontFamily: 'inherit',
        foreColor: 'inherit',
        height: '100%',
        type: 'area',
        sparkline: {
          enabled: true,
        },
      },
      colors: ['#FB7185'],
      fill: {
        colors: ['#FB7185'],
        opacity: 0.5,
      },
      series: this.data.visits.series,
      stroke: {
        curve: 'smooth',
      },
      tooltip: {
        followCursor: true,
        theme: 'dark',
      },
      xaxis: {
        type: 'category',
        categories: this.data.visits.labels,
      },
      yaxis: {
        labels: {
          formatter: (val): string => val.toString(),
        },
      },
    };

    // Visitors vs Page Views
    this.chartVisitorsVsPageViews = {
      chart: {
        animations: {
          enabled: false,
        },
        fontFamily: 'inherit',
        foreColor: 'inherit',
        height: '100%',
        type: 'area',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      colors: ['#64748B', '#94A3B8'],
      dataLabels: {
        enabled: false,
      },
      fill: {
        colors: ['#64748B', '#94A3B8'],
        opacity: 0.5,
      },
      grid: {
        show: false,
        padding: {
          bottom: -40,
          left: 0,
          right: 0,
        },
      },
      legend: {
        show: false,
      },
      series: this.data.visitorsVsPageViews.series,
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      tooltip: {
        followCursor: true,
        theme: 'dark',
        x: {
          format: 'MMM dd, yyyy',
        },
      },
      xaxis: {
        axisBorder: {
          show: false,
        },
        labels: {
          offsetY: -20,
          rotate: 0,
          style: {
            colors: 'var(--fuse-text-secondary)',
          },
        },
        tickAmount: 3,
        tooltip: {
          enabled: false,
        },
        type: 'datetime',
      },
      yaxis: {
        labels: {
          style: {
            colors: 'var(--fuse-text-secondary)',
          },
        },
        max: (max): number => max + 250,
        min: (min): number => min - 250,
        show: false,
        tickAmount: 5,
      },
    };

    // New vs. returning
    this.chartNewVsReturning = {
      chart: {
        animations: {
          speed: 400,
          animateGradually: {
            enabled: false,
          },
        },
        fontFamily: 'inherit',
        foreColor: 'inherit',
        height: '100%',
        type: 'donut',
        sparkline: {
          enabled: true,
        },
      },
      colors: ['#3182CE', '#63B3ED'],
      labels: this.data.newVsReturning.labels,
      plotOptions: {
        pie: {
          customScale: 0.9,
          expandOnClick: false,
          donut: {
            size: '70%',
          },
        },
      },
      series: this.data.newVsReturning.series,
      states: {
        hover: {
          filter: {
            type: 'none',
          },
        },
        active: {
          filter: {
            type: 'none',
          },
        },
      },
      tooltip: {
        enabled: true,
        fillSeriesColor: false,
        theme: 'dark',
        custom: ({
          seriesIndex,
          w,
        }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                                    <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                    <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                                    <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                                </div>`,
      },
    };

    // Gender
    this.chartGender = {
      chart: {
        animations: {
          speed: 400,
          animateGradually: {
            enabled: false,
          },
        },
        fontFamily: 'inherit',
        foreColor: 'inherit',
        height: '100%',
        type: 'donut',
        sparkline: {
          enabled: true,
        },
      },
      colors: ['#319795', '#4FD1C5'],
      labels: this.data.gender.labels,
      plotOptions: {
        pie: {
          customScale: 0.9,
          expandOnClick: false,
          donut: {
            size: '70%',
          },
        },
      },
      series: this.data.gender.series,
      states: {
        hover: {
          filter: {
            type: 'none',
          },
        },
        active: {
          filter: {
            type: 'none',
          },
        },
      },
      tooltip: {
        enabled: true,
        fillSeriesColor: false,
        theme: 'dark',
        custom: ({
          seriesIndex,
          w,
        }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                                     <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                     <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                                     <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                                 </div>`,
      },
    };

    // Age
    this.chartAge = {
      chart: {
        animations: {
          speed: 400,
          animateGradually: {
            enabled: false,
          },
        },
        fontFamily: 'inherit',
        foreColor: 'inherit',
        height: '100%',
        type: 'donut',
        sparkline: {
          enabled: true,
        },
      },
      colors: ['#DD6B20', '#F6AD55'],
      labels: this.data.age.labels,
      plotOptions: {
        pie: {
          customScale: 0.9,
          expandOnClick: false,
          donut: {
            size: '70%',
          },
        },
      },
      series: this.data.age.series,
      states: {
        hover: {
          filter: {
            type: 'none',
          },
        },
        active: {
          filter: {
            type: 'none',
          },
        },
      },
      tooltip: {
        enabled: true,
        fillSeriesColor: false,
        theme: 'dark',
        custom: ({
          seriesIndex,
          w,
        }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                                    <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                    <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                                    <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                                </div>`,
      },
    };

    // Language
    this.chartLanguage = {
      chart: {
        animations: {
          speed: 400,
          animateGradually: {
            enabled: false,
          },
        },
        fontFamily: 'inherit',
        foreColor: 'inherit',
        height: '100%',
        type: 'donut',
        sparkline: {
          enabled: true,
        },
      },
      colors: ['#805AD5', '#B794F4'],
      labels: this.data.language.labels,
      plotOptions: {
        pie: {
          customScale: 0.9,
          expandOnClick: false,
          donut: {
            size: '70%',
          },
        },
      },
      series: this.data.language.series,
      states: {
        hover: {
          filter: {
            type: 'none',
          },
        },
        active: {
          filter: {
            type: 'none',
          },
        },
      },
      tooltip: {
        enabled: true,
        fillSeriesColor: false,
        theme: 'dark',
        custom: ({
          seriesIndex,
          w,
        }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                                    <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                    <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                                    <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                                </div>`,
      },
    };
  }
  
}
