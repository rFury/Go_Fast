import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderService } from '../../Services/loader.service';

@Component({
  selector: 'app-container-loader',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: ` @if(loaderService.isLoading('auth')){
    <div
      class="loader-overlay 
      absolute inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm
      rounded-sm
      pointer-events-auto"
    >
      <mat-progress-spinner
        mode="indeterminate"
        diameter="50"
        color="primary"
      ></mat-progress-spinner>
    </div>
    }`,
  styles: `
      .loader-overlay {
      border-radius: 50px;
    }`,
})
export class ContainerLoaderComponent {
  public loaderService = inject(LoaderService);
}
