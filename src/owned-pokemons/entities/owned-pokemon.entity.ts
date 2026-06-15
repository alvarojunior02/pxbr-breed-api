import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('owned_pokemons')
export class OwnedPokemon {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'integer' })
    pokemonDexId: number;

    @Column()
    pokemonName: string;

    @Column({ type: 'varchar', nullable: true })
    pokemonSprite?: string | null;

    @Column({ type: 'integer', nullable: true })
    breedBaseDexId?: number | null;

    @Column({ type: 'varchar', nullable: true })
    breedBaseName?: string | null;

    @Column({ type: 'varchar', nullable: true })
    regionalForm?: string | null;

    @Column({ type: 'varchar', nullable: true })
    regionalFormLabel?: string | null;

    @Column({ type: 'varchar', nullable: true })
    regionalFormDisplayName?: string | null;

    @Column({ type: 'simple-json', nullable: true })
    eggGroups?: string[] | null;

    @Column({ type: 'simple-json', nullable: true })
    evolutionLine?: Array<{
        pokemonId: number;
        pokemonName: string;
        sprite?: string | null;
    }> | null;

    @Column()
    status: string;

    @Column()
    gender: string;

    @Column({ type: 'varchar', nullable: true })
    nature?: string | null;

    @Column({ type: 'text', nullable: true })
    notes?: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
