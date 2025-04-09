import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { FeatureActions } from '../../enums/feature-actions';

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

    if (this.userService.checkPermission(code, action)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
