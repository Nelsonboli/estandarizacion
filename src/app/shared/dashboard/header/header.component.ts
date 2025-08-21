import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() esMenuPrincipal = false;   // viene del layout
  @Output() toggleMenu = new EventEmitter<void>();

  colapsarMenu() {
    this.toggleMenu.emit();
  }
}
