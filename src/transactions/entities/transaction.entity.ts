import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Player } from '../../players/entities/player.entity';

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    playerId: string;

    @ManyToOne(() => Player, {
        onDelete: 'RESTRICT',
    })
    player: Player;

    @Column()
    orderId: string;

    @ManyToOne(() => Order, {
        onDelete: 'CASCADE',
    })
    order: Order;

    @Column({ type: 'integer' })
    amount: number;

    @Column({ default: 'ORDER_PAYMENT' })
    type: string;

    @Column({ type: 'text', nullable: true })
    notes?: string | null;

    @CreateDateColumn()
    createdAt: Date;
}
