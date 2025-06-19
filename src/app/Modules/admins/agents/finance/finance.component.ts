import { CurrencyPipe, DatePipe, formatDate, NgClass } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'finance',
  templateUrl: './finance.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    NgApexchartsModule,
    MatTableModule,
    MatSortModule,
    NgClass,
    MatProgressBarModule,
    CurrencyPipe,
    DatePipe,
    MatButtonToggleModule
  ],
})
export class FinanceComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('recentTransactionsTable', { read: MatSort })
  recentTransactionsTableMatSort: MatSort;
  chartOrders: { [key: string]: ApexOptions } = {};
  orders: any;
  data: any;
  accountBalanceOptions: ApexOptions;
  recentTransactionsDataSource: MatTableDataSource<any> =
    new MatTableDataSource();
  recentTransactionsTableColumns: string[] = [
    'transactionId',
    'date',
    'name',
    'amount',
    'status',
  ];
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor() {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
    ngOnInit(): void {
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
        // Define the main data object for the dashboard
        this.data = {
            // Account Balance
            accountBalance: {
                series: [
                    {
                        name: 'Balance',
                        data: [
                            [new Date('2024-06-01').getTime(), 20000],
                            [new Date('2024-07-01').getTime(), 22000],
                            [new Date('2024-08-01').getTime(), 21000],
                            [new Date('2024-09-01').getTime(), 26000],
                            [new Date('2024-10-01').getTime(), 23000],
                            [new Date('2024-11-01').getTime(), 25000],
                            [new Date('2024-12-01').getTime(), 27000],
                            [new Date('2025-01-01').getTime(), 29000],
                            [new Date('2025-02-01').getTime(), 31000],
                            [new Date('2025-03-01').getTime(), 33000],
                            [new Date('2025-04-01').getTime(), 37000],
                            [new Date('2025-05-01').getTime(), 41000],
                        ],
                    },
                ],
                growRate: 38.33,  
                ami: 45320       
            }
        };
    
        // Store the table data for Recent Transactions
        this.recentTransactionsDataSource.data = [
            {
                transactionId: '528651571NT',
                date: new Date('2019-10-07'),
                name: 'GoFast',
                amount: 1358.75,
                status: 'completed',
            },
            {
                transactionId: '421436904YT',
                date: new Date('2019-12-18'),
                name: 'GoFast',
                amount: -1042.82,
                status: 'completed',
            },
            {
                transactionId: '685377421YT',
                date: new Date('2019-12-25'),
                name: 'GoFast',
                amount: 1828.16,
                status: 'pending',
            },
            {
                transactionId: '884960091RT',
                date: new Date('2019-11-29'),
                name: 'GoFast',
                amount: 1647.55,
                status: 'completed',
            },
            {
                transactionId: '361402213NT',
                date: new Date('2019-11-24'),
                name: 'GoFast',
                amount: -927.43,
                status: 'completed',
            },
        ];
    
        // Prepare the chart data
        this._prepareChartData();
    }

  /**
   * After view init
   */
  ngAfterViewInit(): void {
    // Make the data source sortable
    this.recentTransactionsDataSource.sort =
      this.recentTransactionsTableMatSort;
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

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Prepare the chart data from the data
   *
   * @private
   */
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
    // Account balance
    this.accountBalanceOptions = {
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
        sparkline: {
          enabled: true,
        },
      },
      colors: ['#A3BFFA', '#667EEA'],
      fill: {
        colors: ['#CED9FB', '#AECDFD'],
        opacity: 0.5,
        type: 'solid',
      },
      series: this.data.accountBalance.series,
      stroke: {
        curve: 'straight',
        width: 2,
      },
      tooltip: {
        followCursor: true,
        theme: 'dark',
        x: {
          format: 'MMM dd, yyyy',
        },
        y: {
          formatter: (value): string => value + '$',
        },
      },
      xaxis: {
        type: 'datetime',
      },
    };
  }
}
