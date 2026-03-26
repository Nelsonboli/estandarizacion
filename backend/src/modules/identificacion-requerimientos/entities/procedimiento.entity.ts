import { DocumentoSoporte } from 'src/modules/estandarizacion/Estados/documento-soporte/documento-soporte/entities/documento-soporte.entity';
import { SoporteComputacional } from 'src/modules/estandarizacion/Estados/soporte-computacional/entities/soporte-computacional.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Reglamento } from 'src/modules/estandarizacion/Estados/reglamento/entities/reglamento.entity';
import { Socializacion } from 'src/modules/socializacion/entities/socializacion.entity';

@Entity('procedimientos')
export class Procedimiento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  procedimiento: string;

  @Column({ type: 'varchar', length: 255 })
  categoria: string;

  @Column({ type: 'json', nullable: true })
  roles: any;

  @Column({ type: 'varchar', length: 255 })
  estado: string;

  @Column({ type: 'json', nullable: true })
  actividades: any;

  @Column({ type: 'json', nullable: true })
  referencias: any;

  @OneToOne(() => DocumentoSoporte, doc => doc.procedimiento)
  documentoSoporte: DocumentoSoporte;

  @OneToOne(() => SoporteComputacional, doc => doc.procedimiento)
  soporteComputacional: SoporteComputacional;

  @OneToOne(() => Reglamento, doc => doc.procedimiento)
  reglamento: Reglamento;

  @OneToOne(() => Socializacion, doc => doc.procedimiento)
  socializacion: Socializacion;

} 