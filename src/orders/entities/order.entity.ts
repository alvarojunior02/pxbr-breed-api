import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Player } from '../../players/entities/player.entity';
import { OrderPokemon } from './order-pokemon.entity';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    playerId: string;

    @ManyToOne(() => Player, (player) => player.orders, {
        onDelete: 'RESTRICT',
    })
    player: Player;

    @Column({ type: 'integer', default: 0 })
    subtotal: number;

    @Column({ type: 'integer', default: 0 })
    discount: number;

    @Column({ type: 'integer', default: 0 })
    total: number;

    @Column({ type: 'integer', default: 0 })
    paidAmount: number;

    @Column({ default: false })
    paid: boolean;

    @Column({ default: false })
    needsFemale: boolean;

    @Column({ type: 'text', nullable: true })
    observations?: string | null;

    @Column({ default: false })
    archived: boolean;

    @OneToMany(() => OrderPokemon, (pokemon) => pokemon.order, {
        cascade: true,
        eager: true,
    })
    pokemons: OrderPokemon[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
