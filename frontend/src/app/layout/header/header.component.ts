import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  esMenuPrincipal = input(false);   // viene del layout
  toggleMenu = output<void>();

  colapsarMenu() {
    this.toggleMenu.emit();
  }
}
