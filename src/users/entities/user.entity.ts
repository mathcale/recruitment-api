import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Role } from '../enums/role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  @Exclude()
  id: number;

  @Column({ type: 'varchar' })
  @Generated('uuid')
  @Index({ unique: true })
  externalId: string;

  @Column()
  @Index()
  name: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  role: Role;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: string;

  @DeleteDateColumn({ type: 'timestamp with time zone' })
  deletedAt: string;
}
