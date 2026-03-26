import { DocumentoSoporte } from "src/modules/estandarizacion/Estados/documento-soporte/documento-soporte/entities/documento-soporte.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('diagrama_de_flujo')
export class DiagramaFlujo {
    @PrimaryGeneratedColumn()
    id_diagrama: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    documento_diagrama: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    ubicacion_diagrama: string | null;

    @Column({ type: 'json', nullable: true })
    json_diagrama: any | null;

    @Column({ name: 'documento_soporte_id', nullable: true })
    documento_soporte_id: number;

    @OneToOne(() => DocumentoSoporte, doc => doc.diagramaFlujo, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'documento_soporte_id' })
    documentoSoporte: DocumentoSoporte;
}
