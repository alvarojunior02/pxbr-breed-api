import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { OwnedHaPokemon } from './owned-ha-pokemon.entity';

@Entity('owned_has')
export class OwnedHa {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    abilityName: string;

    @Column({ type: 'varchar', nullable: true })
    nature?: string | null;

    @Column({ type: 'integer' })
    breedableValue: number;

    @Column({ type: 'integer' })
    castratedValue: number;

    @Column({ type: 'text', nullable: true })
    notes?: string | null;

    @OneToMany(() => OwnedHaPokemon, (pokemon) => pokemon.ownedHa, {
        cascade: true,
        eager: true,
    })
    pokemons: OwnedHaPokemon[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
