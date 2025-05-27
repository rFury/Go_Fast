import { CurrencyPipe, NgClass, NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { ProjectService } from './project.service';
import { User } from '../../../../../../Shared/Models/User.model';
import { UserService } from '../../../../../../Shared/Services/user.service';
import { Client } from '../../../../../../Shared/Models/Client.model';
import { Agent } from '../../../../../../Shared/Models/Agent.model';
@Component({
  selector: 'project',
  templateUrl: './project.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    MatMenuModule,
    MatTabsModule,
    MatButtonToggleModule,
    NgApexchartsModule,
    MatTableModule,
  ],
})
export class ProjectComponent implements OnInit, OnDestroy {
  chartOrders: { [key: string]: ApexOptions } = {};
  chartTaskDistribution: { [key: string]: ApexOptions } = {};
  chartBudgetDistribution: ApexOptions = {};
  chartWeeklyExpenses: ApexOptions = {};
  chartMonthlyExpenses: ApexOptions = {};
  chartYearlyExpenses: ApexOptions = {};
  data: any;
  orders: any;
  cards: any;
  team: any;
  user: User | Client | Agent | null;
  unreadCount: number = 0;
  selectedProject: string = 'GoFast';
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  constructor(
    private _projectService: ProjectService,
    private _router: Router,
    private _userService: UserService
  ) {}


  ngOnInit(): void {
    this._projectService.getData()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        this.data = data;
        this.cards = data.cards;
        this.orders = data.orders;
        this.team = data.team;
        this.orders = {
            three_weeks_ago: {
                dailyStats: {
                    labels: ["2025-04-29", "2025-05-01", "2025-05-02", "2025-05-04", "2025-05-05"],
                    series: [
                        { name: "Picked Up", data: [10, 15, 20, 5, 8] },
                        { name: "Delivered", data: [12, 18, 22, 7, 10] }
                    ]
                },
                overview: {
                    newOrders: 25,
                    deliveredOrders: 69,
                    canceledOrders: 5,
                    returnedOrders: 3,
                    picked_upOrders: 58
                },
                period: { start: "2025-04-29", end: "2025-05-05" }
            },
            two_weeks_ago: {
                dailyStats: {
                    labels: ["2025-05-07", "2025-05-09", "2025-05-11"],
                    series: [
                        { name: "Picked Up", data: [3, 7, 12] },
                        { name: "Delivered", data: [5, 9, 14] }
                    ]
                },
                overview: {
                    newOrders: 15,
                    deliveredOrders: 28,
                    canceledOrders: 2,
                    returnedOrders: 1,
                    picked_upOrders: 22
                },
                period: { start: "2025-05-06", end: "2025-05-12" }
            },
            last_week: {
                dailyStats: {
                    labels: ["2025-05-14", "2025-05-15", "2025-05-17", "2025-05-19"],
                    series: [
                        { name: "Picked Up", data: [8, 6, 10, 4] },
                        { name: "Delivered", data: [9, 7, 11, 5] }
                    ]
                },
                overview: {
                    newOrders: 20,
                    deliveredOrders: 32,
                    canceledOrders: 4,
                    returnedOrders: 2,
                    picked_upOrders: 28
                },
                period: { start: "2025-05-13", end: "2025-05-19" }
            },
            this_week: {
                dailyStats: {
                    labels: ["2025-05-20", "2025-05-21", "2025-05-22", "2025-05-24", "2025-05-25", "2025-05-26"],
                    series: [
                        { name: "Picked Up", data: [2, 4, 6, 8, 10, 12] },
                        { name: "Delivered", data: [3, 5, 7, 9, 11, 13] }
                    ]
                },
                overview: {
                    newOrders: 30,
                    deliveredOrders: 48,
                    canceledOrders: 3,
                    returnedOrders: 1,
                    picked_upOrders: 42
                },
                period: { start: "2025-05-20", end: "2025-05-26" }
            }
        };
        this._prepareChartData();
        console.log(this.chartOrders['this_week']);
      });


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
    this._userService.userObs.subscribe((user) => {
      this.user = user;
    });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
  private _fixSvgFill(element: Element): void {
    // Current URL
    const currentURL = this._router.url;
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
  private _prepareChartData(): void {
    this.chartOrders['this_week'] = {
      chart: {
        fontFamily: 'inherit',
        foreColor: 'inherit',
        height: '100%',
        type: 'line',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      colors: ['#64748B', '#94A3B8'],
      dataLabels: {
        enabled: true,
        enabledOnSeries: [0],
        background: {
          borderWidth: 0,
        },
      },
      grid: {
        borderColor: 'var(--fuse-border)',
      },
      labels: this.orders['this_week'].dailyStats.labels,
      legend: {
        show: false,
      },
      plotOptions: {
        bar: {
          columnWidth: '50%',
        },
      },
      series: this.orders['this_week'].dailyStats.series,
      states: {
        hover: {
          filter: {
            type: 'darken',
            value: 0.75,
          },
        } as any,
      },
      stroke: {
        width: [3, 0],
      },
      tooltip: {
        followCursor: true,
        theme: 'dark',
      },
      xaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          color: 'var(--fuse-border)',
        },
        labels: {
          style: {
            colors: 'var(--fuse-text-secondary)',
          },
        },
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        labels: {
          offsetX: -16,
          style: {
            colors: 'var(--fuse-text-secondary)',
          },
        },
      },
    };
    this.chartOrders['last_week'] = {
      chart: {
        fontFamily: 'inherit',
        foreColor: 'inherit',
        height: '100%',
        type: 'line',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      colors: ['#64748B', '#94A3B8'],
      dataLabels: {
        enabled: true,
        enabledOnSeries: [0],
        background: {
          borderWidth: 0,
        },
      },
      grid: {
        borderColor: 'var(--fuse-border)',
      },
      labels: this.orders['last_week'].dailyStats.labels,
      legend: {
        show: false,
      },
      plotOptions: {
        bar: {
          columnWidth: '50%',
        },
      },
      series: this.orders['last_week'].dailyStats.series,
      states: {
        hover: {
          filter: {
            type: 'darken',
            value: 0.75,
          },
        } as any,
      },
      stroke: {
        width: [3, 0],
      },
      tooltip: {
        followCursor: true,
        theme: 'dark',
      },
      xaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          color: 'var(--fuse-border)',
        },
        labels: {
          style: {
            colors: 'var(--fuse-text-secondary)',
          },
        },
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        labels: {
          offsetX: -16,
          style: {
            colors: 'var(--fuse-text-secondary)',
          },
        },
      },
    };
    /*// Task distribution
        this.chartTaskDistribution['last_week'] = {
            chart      : {
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'polarArea',
                toolbar   : {
                    show: false,
                },
                zoom      : {
                    enabled: false,
                },
            },
            labels     : this.data.taskDistribution.labels,
            legend     : {
                position: 'bottom',
            },
            plotOptions: {
                polarArea: {
                    spokes: {
                        connectorColors: 'var(--fuse-border)',
                    },
                    rings : {
                        strokeColor: 'var(--fuse-border)',
                    },
                },
            },
            series     : this.data.taskDistribution.series,
            states     : {
                hover: {
                    filter: {
                        type : 'darken',
                        value: 0.75,
                    },
                } as any,
            },
            stroke     : {
                width: 2,
            },
            theme      : {
                monochrome: {
                    enabled       : true,
                    color         : '#93C5FD',
                    shadeIntensity: 0.75,
                    shadeTo       : 'dark',
                },
            },
            tooltip    : {
                followCursor: true,
                theme       : 'dark',
            },
            yaxis      : {
                labels: {
                    style: {
                        colors: 'var(--fuse-text-secondary)',
                    },
                },
            },
        };

        // Budget distribution
        this.chartBudgetDistribution = {
            chart      : {
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'radar',
                sparkline : {
                    enabled: true,
                },
            },
            colors     : ['#818CF8'],
            dataLabels : {
                enabled   : true,
                formatter : (val: number): string | number => `${val}%`,
                textAnchor: 'start',
                style     : {
                    fontSize  : '13px',
                    fontWeight: 500,
                },
                background: {
                    borderWidth: 0,
                    padding    : 4,
                },
                offsetY   : -15,
            },
            markers    : {
                strokeColors: '#818CF8',
                strokeWidth : 4,
            },
            plotOptions: {
                radar: {
                    polygons: {
                        strokeColors   : 'var(--fuse-border)',
                        connectorColors: 'var(--fuse-border)',
                    },
                },
            },
            series     : this.data.budgetDistribution.series,
            stroke     : {
                width: 2,
            },
            tooltip    : {
                theme: 'dark',
                y    : {
                    formatter: (val: number): string => `${val}%`,
                },
            },
            xaxis      : {
                labels    : {
                    show : true,
                    style: {
                        fontSize  : '12px',
                        fontWeight: '500',
                    },
                },
                categories: this.data.budgetDistribution.categories,
            },
            yaxis      : {
                max       : (max: number): number => parseInt((max + 10).toFixed(0), 10),
                tickAmount: 7,
            },
        };

        // Weekly expenses
        this.chartWeeklyExpenses = {
            chart  : {
                animations: {
                    enabled: false,
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'line',
                sparkline : {
                    enabled: true,
                },
            },
            colors : ['#22D3EE'],
            series : this.data.weeklyExpenses.series,
            stroke : {
                curve: 'smooth',
            },
            tooltip: {
                theme: 'dark',
            },
            xaxis  : {
                type      : 'category',
                categories: this.data.weeklyExpenses.labels,
            },
            yaxis  : {
                labels: {
                    formatter: (val): string => `$${val}`,
                },
            },
        };

        // Monthly expenses
        this.chartMonthlyExpenses = {
            chart  : {
                animations: {
                    enabled: false,
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'line',
                sparkline : {
                    enabled: true,
                },
            },
            colors : ['#4ADE80'],
            series : this.data.monthlyExpenses.series,
            stroke : {
                curve: 'smooth',
            },
            tooltip: {
                theme: 'dark',
            },
            xaxis  : {
                type      : 'category',
                categories: this.data.monthlyExpenses.labels,
            },
            yaxis  : {
                labels: {
                    formatter: (val): string => `$${val}`,
                },
            },
        };

        // Yearly expenses
        this.chartYearlyExpenses = {
            chart  : {
                animations: {
                    enabled: false,
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'line',
                sparkline : {
                    enabled: true,
                },
            },
            colors : ['#FB7185'],
            series : this.data.yearlyExpenses.series,
            stroke : {
                curve: 'smooth',
            },
            tooltip: {
                theme: 'dark',
            },
            xaxis  : {
                type      : 'category',
                categories: this.data.yearlyExpenses.labels,
            },
            yaxis  : {
                labels: {
                    formatter: (val): string => `$${val}`,
                },
            },
        };*/
  }
}
