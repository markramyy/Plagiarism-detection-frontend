import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef, ComponentRef } from '@angular/core';
import { SessionExpiredComponent } from '../Components/session-expired/session-expired.component';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessionExpiredComponentRef: ComponentRef<SessionExpiredComponent> | null = null;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) { }

  showSessionExpiredDialog(): void {
    // Create component dynamically
    if (!this.sessionExpiredComponentRef) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(SessionExpiredComponent);
      this.sessionExpiredComponentRef = componentFactory.create(this.injector);

      // Attach component to the appRef to make it part of the detection cycle
      this.appRef.attachView(this.sessionExpiredComponentRef.hostView);

      // Get DOM element from component
      const domElement = (this.sessionExpiredComponentRef.hostView as EmbeddedViewRef<any>).rootNodes[0];

      // Append to the body
      document.body.appendChild(domElement);

      // Show dialog
      this.sessionExpiredComponentRef.instance.show();

      // Clean up when dialog closes
      this.sessionExpiredComponentRef.instance.showDialog = false;
      setTimeout(() => {
        if (this.sessionExpiredComponentRef) {
          this.appRef.detachView(this.sessionExpiredComponentRef.hostView);
          this.sessionExpiredComponentRef.destroy();
          this.sessionExpiredComponentRef = null;
        }
      }, 3000);
    }
  }
}
