import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorComponent } from './shared/components/error/error.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./app.component.scss'],
  imports: [ErrorComponent, RouterOutlet],
})
export class AppComponent {
  title = 'registry-fronted';
}
