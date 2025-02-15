import { Injectable, signal, WritableSignal } from '@angular/core';

export type LoaderType = 'auth' | 'global';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loaders: { [key in LoaderType]: WritableSignal<boolean> } = {
    auth: signal(false),
    global: signal(false),
  };

  private counters: { [key in LoaderType]: number } = {
    auth: 0,
    global: 0,
  };

  show(loaderType: LoaderType = 'global') {
    this.counters[loaderType]++;
    this.loaders[loaderType].set(true);
  }

  hide(loaderType: LoaderType = 'global') {
    this.counters[loaderType]--;
    if (this.counters[loaderType] <= 0) {
      this.counters[loaderType] = 0;
      this.loaders[loaderType].set(false);
    }
  }

  isLoading(loaderType: LoaderType): boolean {
    return this.loaders[loaderType]() || false;
  }
}