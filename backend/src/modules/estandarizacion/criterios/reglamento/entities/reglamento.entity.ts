import { Procedimiento } from "src/modules/identificacion-requerimientos/entities/procedimiento.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('reglamento')
export class Reglamento {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Procedimiento, proc => proc.reglamento, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'procedimiento_id' })
    procedimiento: Procedimiento;

    @Column({ type: 'varchar', length: 255, nullable: true })
    formato_daac_descargado: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    formato_daac_subido: string | null;

    @Column({ type: 'json', nullable: true })
    actividades_completadas: {
        descarga_daac_completada: boolean;
        subida_daac_completada: boolean;
    } | null;

    @Column({ type: 'boolean', default: false })
    reglamento_completado: boolean;

}
