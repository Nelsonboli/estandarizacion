import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({ providedIn: 'root' })

export class AlertService {

  /**
   * Confirmación genérica
   */
  confirmar(

    titulo: string,
    texto: string,
    icono: SweetAlertIcon = 'question',
    confirmColor: string = '#3085d6',
    cancelColor: string = '#d33',
    textoConfirmar: string = 'Aceptar',
    textoCancelar: string = 'Cancelar'
  ) {
    return Swal.fire({
      title: titulo,
      text: texto,
      icon: icono,
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: cancelColor,
      confirmButtonText: textoConfirmar,
      cancelButtonText: textoCancelar,
    });
  }

  /**
   * Confirmación para guardar
   */
  alertGuardar() {
    return this.confirmar(
      '¿Deseas guardar?',
      'Se guardarán los cambios realizados.',
      'question',
      '#00b248',
      '#d33',
      'Guardar',
      'Cancelar',
    );
  }


alertArriba(titulo: string) {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    background: "#ffffff", // verde (Tailwind: green-600)
    color: "16a34a",       // texto blanco
    showClass: {
      popup: ''             // sin animación al mostrar
    },
    hideClass: {
      popup: ''             // sin animación al ocultar
    }
  });

  Toast.fire({
    icon: "success",
    title: titulo
  });
}



  /**
   * Confirmación para eliminar
   */
  alertEliminar() {
    return this.confirmar(
      '¡Atención!',
      'Si elimina este procedimiento, no podra revertir los cambios',
      'warning',
      '#00b248',
      '#d33',
      'Eliminar',
      'Cancelar',
    );
  }

  /**
   * Confirmación para cancelar
   */
  alertCancelar() {
    return this.confirmar(
      '¡Atención!',
      'Si Cancela esta acción, no pódra revertir los cambios ',
      'warning',
      '#00b248',
      '#d33',
      'Confirmar',
      'Cancelar',
    );
  }

  /**
   * Mensaje de éxito
   */
  exito(mensaje: string, titulo: string = 'Éxito') {
    return Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'success',
      confirmButtonText: 'De acuerdo',
      confirmButtonColor: '#2563eb'
    });
  }

  /**
   * Mensaje de error
   */
  error(mensaje: string, titulo: string = 'Error') {
    return Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'error',
      confirmButtonText: 'De acuerdo',
      confirmButtonColor: '#2563eb'
    });

  }

  /**
   * Mensaje de información
   */
  info(mensaje: string, titulo: string = 'Información') {
    return Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'info',
      confirmButtonText: 'De acuerdo',
      confirmButtonColor: '#2563eb'
    });
  }

  /**
   * Mensaje de advertencia
   */
  advertencia(mensaje: string, titulo: string = 'Atención') {
    return Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'warning',
      confirmButtonText: 'De acuerdo',
      confirmButtonColor: '#2563eb'
    });
  }


}
