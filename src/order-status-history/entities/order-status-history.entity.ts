import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity('order_status_history')
export class OrderStatusHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    orderId: string;

    @ManyToOne(() => Order, {
        onDelete: 'CASCADE',
    })
    order: Order;

    @Column({ type: 'varchar', nullable: true })
    orderPokemonId?: string | null;

    @Column({ type: 'integer', nullable: true })
    pokemonDexId?: number | null;

    @Column({ type: 'varchar', nullable: true })
    pokemonName?: string | null;

    @Column({ type: 'varchar', nullable: true })
    oldStatus?: string | null;

    @Column({ type: 'varchar' })
    newStatus: string;

    @Column({ type: 'text', nullable: true })
    notes?: string | null;

    @CreateDateColumn()
    createdAt: Date;
}
