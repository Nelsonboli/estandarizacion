import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Procedimiento } from 'src/modules/identificacion-requerimientos/entities/procedimiento.entity';
import { Formulariodaac } from 'src/modules/estandarizacion/Estados/documento-soporte/components/formulariodaac/entities/formulariodaac.entity';
import { ReglamentoBase } from 'src/modules/estandarizacion/Estados/documento-soporte/components/reglamento-base/entities/reglamento-base.entity';
import { DiagramaFlujo } from 'src/modules/estandarizacion/Estados/documento-soporte/components/diagrama-flujo/entities/diagrama-flujo.entity';

@Entity('documento_soporte')
export class DocumentoSoporte {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean', default: false })
  documento_completado: boolean;

  @Column({ type: 'json', nullable: true })
  actividades_completadas: {
    reglamentoBase: boolean;
    formulario: boolean;
    diagramaFlujo: boolean;
  } | null;

  @OneToOne(() => Procedimiento, proc => proc.documentoSoporte, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'procedimiento_id' })
  procedimiento: Procedimiento;

  @OneToOne(() => Formulariodaac, (form) => form.documentoSoporte, { cascade: false, nullable: true })
  formulariodaac: Formulariodaac;

  @OneToMany(() => ReglamentoBase, (reg) => reg.documentoSoporte)
  reglamentosBase: ReglamentoBase[];

  @OneToOne(() => DiagramaFlujo, (diag) => diag.documentoSoporte, { cascade: false, nullable: true })
  diagramaFlujo: DiagramaFlujo;
}
