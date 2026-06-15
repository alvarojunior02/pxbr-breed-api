import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity('players')
export class Player {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    nick: string;

    @Column()
    avatarUrl: string;

    @Column({ type: 'text', nullable: true })
    notes?: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Order, (order) => order.player)
    orders: Order[];

    @BeforeInsert()
    @BeforeUpdate()
    normalizeNick() {
        this.nick = this.nick.trim();
        this.avatarUrl = `https://mc-heads.net/avatar/${this.nick}`;
    }
}
