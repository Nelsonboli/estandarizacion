import { DocumentoSoporte } from "src/modules/estandarizacion/Estados/documento-soporte/documento-soporte/entities/documento-soporte.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('reglamento_base')
export class ReglamentoBase {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    documento: string | undefined;

    @ManyToOne(() => DocumentoSoporte, (doc) => doc.reglamentosBase, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'documento_soporte_id' })
    documentoSoporte: DocumentoSoporte;

}


