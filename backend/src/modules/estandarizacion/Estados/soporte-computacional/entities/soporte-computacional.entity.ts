import { Procedimiento } from "src/modules/identificacion-requerimientos/entities/procedimiento.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('soporte_computacional')
export class SoporteComputacional {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'procedimiento_id', nullable: true })
    procedimiento_id: number;

    @OneToOne(() => Procedimiento, (procedimiento) => procedimiento.soporteComputacional, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'procedimiento_id' })
    procedimiento: Procedimiento;

    @Column({ type: 'boolean', nullable: true })
    tiene_soporte: boolean | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    nombre: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    descripcion: string | null;

    @Column({ type: 'boolean', nullable: true })
    requiere_soporte: boolean | null;

    @Column({ type: 'boolean', default: false })
    computacional_completado: boolean;

}
