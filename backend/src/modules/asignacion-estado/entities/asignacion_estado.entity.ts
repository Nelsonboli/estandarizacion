import { Procedimiento } from "src/modules/identificacion-requerimientos/entities/procedimiento.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity('asignacion_estado')
export class AsignacionEstado {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'boolean' })
    criterios_completos: boolean;

    @Column({ type: 'varchar', length: 255 })
    estado_procedimiento: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    estado_inicial: string;

    @OneToOne(() => Procedimiento, (procedimiento) => procedimiento.asignacion_estado, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'procedimiento_id' })
    procedimiento: Procedimiento;


}
