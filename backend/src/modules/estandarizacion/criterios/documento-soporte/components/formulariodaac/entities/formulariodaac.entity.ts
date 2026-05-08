import { DocumentoSoporte } from "src/modules/estandarizacion/criterios/documento-soporte/documento-soporte/entities/documento-soporte.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('formulariodaac')
export class Formulariodaac {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  objetivo: string;

  @Column({ type: 'varchar', length: 255 })
  alcance: string;

  @Column({ type: 'json', nullable: true })
  responsable: any;

  @Column({ type: 'json', nullable: true })
  proveedores: any;

  @Column({ type: 'json', nullable: true })
  insumos: any;

  @Column({ type: 'json', nullable: true })
  resultados: any;

  @Column({ type: 'json', nullable: true })
  recibe: any;

  @Column({ type: 'json', nullable: true })
  requisitos: any;

  @Column({ type: 'json', nullable: true })
  documentos: any;

  @Column({ type: 'json', nullable: true })
  registros: any;

  @Column({ type: 'varchar', length: 255, nullable: true })
  indicador: any;

  @Column({ type: 'varchar', length: 255, nullable: true })
  formula: any;

  @Column({ type: 'varchar', length: 255, nullable: true })
  frecuencia: any;

  @OneToOne(() => DocumentoSoporte, doc => doc.formulariodaac, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'documento_soporte_id' })
  documentoSoporte: DocumentoSoporte;

}




