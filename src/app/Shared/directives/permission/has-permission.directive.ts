import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { FeatureActions } from '../../enums/feature-actions';
import { has } from 'lodash';

@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private userService = inject(UserService);

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input() set hasPermission(value: [string, string]) {
    const [code, action] = value;

    this.userService.checkPermission(code, action).subscribe(
      (hasPermission) => {
        if (hasPermission) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
          this.viewContainer.clear();
        }
      }
    )
  }
}
