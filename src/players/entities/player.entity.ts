import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

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

    @BeforeInsert()
    @BeforeUpdate()
    normalizeNick() {
        this.nick = this.nick.trim();
        this.avatarUrl = `https://mc-heads.net/avatar/${this.nick}`;
    }
}
