import { Procedimiento } from "src/modules/identificacion-requerimientos/entities/procedimiento.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity('socializacion')
export class Socializacion {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    lugar: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    mecanismo: string;

    @Column({ type: 'date' })
    fecha: Date;

    @Column({ type: 'time' })
    hora: string;

    @OneToOne(() => Procedimiento, (procedimiento) => procedimiento.socializacion, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'procedimiento_id' })
    procedimiento: Procedimiento;

}
