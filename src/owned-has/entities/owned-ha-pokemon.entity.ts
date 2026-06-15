import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OwnedHa } from './owned-ha.entity';

@Entity('owned_ha_pokemons')
export class OwnedHaPokemon {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    ownedHaId: string;

    @ManyToOne(() => OwnedHa, (ownedHa) => ownedHa.pokemons, {
        onDelete: 'CASCADE',
    })
    ownedHa: OwnedHa;

    @Column({ type: 'integer' })
    pokemonDexId: number;

    @Column()
    pokemonName: string;

    @Column({ type: 'varchar', nullable: true })
    pokemonSprite?: string | null;

    @Column({ default: false })
    isBase: boolean;
}
