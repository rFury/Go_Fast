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
import { FinanceService } from './finance.service';

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
  ],
})
export class FinanceComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('recentTransactionsTable', { read: MatSort })
  recentTransactionsTableMatSort: MatSort;

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
  constructor(private _financeService: FinanceService) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
    ngOnInit(): void {
        // Define the main data object for the dashboard
        this.data = {
            // Previous Statement
            previousStatement: {
                date: 'May 13, 2025',
                limit: 34500,
                spent: 27221.21,
                minimum: 7331.94
            },
            // Current Statement
            currentStatement: {
                date: 'June 13, 2025',
                limit: 34500,
                spent: 39819.41,
                minimum: 9112.51
            },
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
            },
            // Budget
            budget: {
                expenses: 11763.34,
                expensesLimit: 500000,  
                savings: 10974.12,
                savingsGoal: 100000,    
                bills: 1789.22,
                billsLimit: 1700        
            }
        };
    
        // Store the table data for Recent Transactions
        this.recentTransactionsDataSource.data = [
            {
                transactionId: '528651571NT',
                date: new Date('2019-10-07'),
                name: 'Morgan Page',
                amount: 1358.75,
                status: 'completed',
            },
            {
                transactionId: '421436904YT',
                date: new Date('2019-12-18'),
                name: 'Nita Hebert',
                amount: -1042.82,
                status: 'completed',
            },
            {
                transactionId: '685377421YT',
                date: new Date('2019-12-25'),
                name: 'Marsha Chambers',
                amount: 1828.16,
                status: 'pending',
            },
            {
                transactionId: '884960091RT',
                date: new Date('2019-11-29'),
                name: 'Charmaine Jackson',
                amount: 1647.55,
                status: 'completed',
            },
            {
                transactionId: '361402213NT',
                date: new Date('2019-11-24'),
                name: 'Maura Carey',
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
