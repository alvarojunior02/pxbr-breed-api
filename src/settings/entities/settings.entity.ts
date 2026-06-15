import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('settings')
export class Settings {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'integer', default: 14000000 })
    breedableDefaultValue: number;

    @Column({ type: 'integer', default: 3500000 })
    castratedDefaultValue: number;

    @Column({ type: 'integer', default: 1 })
    backupVersion: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
