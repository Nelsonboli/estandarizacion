import { Procedimiento } from "src/modules/identificacion-requerimientos/entities/procedimiento.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity('recoleccion_informacion')
export class RecoleccionInformacion {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'procedimiento_id', nullable: true })
    procedimiento_id: number;

    @OneToOne(() => Procedimiento, (procedimiento) => procedimiento.recoleccionInformacion, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'procedimiento_id' })
    procedimiento: Procedimiento;

    @Column({ type: 'varchar', nullable: false, length: 3000 })
    encuesta: string;

}


