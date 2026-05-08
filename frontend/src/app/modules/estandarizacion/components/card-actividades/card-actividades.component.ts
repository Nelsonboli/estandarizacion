import { Component, OnInit, OnChanges, SimpleChanges, input, output, inject, DestroyRef, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatosService } from '../../../../shared/services/datos.service';


@Component({
    standalone: true,
    selector: 'app-card-actividades',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './card-actividades.component.html',
    styleUrls: ['./card-actividades.component.css']
})
export class CardActividadesComponent implements OnInit, OnChanges {
    indice = input<number | null>(null);
    refrescar = input<boolean>(false);
    valoresExternos = input<boolean[] | null>(null);
    criterioCompleto = output<{ index: number; completo: boolean }>();

    //Servicios y dependencias
    private datosService = inject(DatosService);

    form!: FormGroup;
    subopciones: string[] = [];

    private fb = inject(FormBuilder);
    private destroyRef = inject(DestroyRef);

    constructor() {
        effect(() => {
            const ext = this.valoresExternos();
            if (ext && this.form) {
                ext.forEach((val, i) => {
                    if (this.checks && this.checks.at(i)) {
                        const control = this.checks.at(i);
                        if (control.value !== val) {
                            control.setValue(val, { emitEvent: true });
                        }

                        if (val === true) {
                            control.disable({ emitEvent: false });
                        } else {
                            control.enable({ emitEvent: false });
                        }
                    }
                });
            }
        });

        effect(() => {
            if (this.refrescar()) {
                this.verificarCriterioCompleto();
            }
        });
    }

    ngOnInit(): void {
        const idx = this.indice();
        if (typeof idx === 'number') {
            this.subopciones = this.datosService.opciones[idx] || [];
            this.initForm();
            this.listenToChanges();
            this.verificarCriterioCompleto();
        }
    }

    get checks(): FormArray {
        return this.form?.get('checks') as FormArray;
    }

    private initForm() {
        const idx = this.indice();
        const ext = this.valoresExternos();

        // Usar valoresExternos o inicializar en false
        const valoresIniciales = (ext && ext.length > 0) ? ext : this.subopciones.map(() => false);

        this.form = this.fb.group({
            checks: this.fb.array(
                this.subopciones.map((_, i) => this.fb.control(valoresIniciales[i] || false))
            )
        });

        // Deshabilitar checkboxes ya marcados (solo lectura)
        valoresIniciales.forEach((val, i) => {
            if (val === true && this.checks && this.checks.at(i)) {
                this.checks.at(i).disable({ emitEvent: false });
            }
        });
    }

    private listenToChanges() {
        // Reducido a solo verificar criterio completo, sin persistencia local
        this.checks.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.verificarCriterioCompleto();
            });
    }

    public verificarCriterioCompleto() {
        const idx = this.indice();
        if (idx === null || !this.checks) return;

        const completo = this.checks.controls.every(c => c.value === true);
        this.criterioCompleto.emit({ index: idx, completo });
    }

    ngOnChanges(changes: SimpleChanges) {
        // ngOnChanges kept for backward compatibility if needed, 
        // but logic moved to effects for signal inputs.
    }
}
