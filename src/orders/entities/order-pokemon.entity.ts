import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_pokemons')
export class OrderPokemon {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    pokemonId: number;

    @Column()
    pokemonName: string;

    @Column({ type: 'text', nullable: true })
    sprite?: string | null;

    @Column({ type: 'integer', nullable: true })
    breedPokemonId?: number | null;

    @Column({ type: 'varchar', nullable: true })
    breedPokemonName?: string | null;

    @Column()
    nature: string;

    @Column()
    abilityName: string;

    @Column({ default: false })
    abilityIsHa: boolean;

    @Column({ type: 'varchar', nullable: true })
    regionalForm?: string | null;

    @Column({ type: 'varchar', nullable: true })
    regionalFormLabel?: string | null;

    @Column({ type: 'varchar', nullable: true })
    regionalFormDisplayName?: string | null;

    @Column({ type: 'integer', default: 0 })
    value: number;

    @Column({ default: false })
    breedable: boolean;

    @Column()
    status: string;

    @ManyToOne(() => Order, (order) => order.pokemons, {
        onDelete: 'CASCADE',
    })
    order: Order;
}
