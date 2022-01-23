import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { JobPublicationStatus } from '../enums/job-publication-status.enum';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @Column()
  @Generated('uuid')
  @Index()
  externalId: string;

  @Column({ unique: true })
  @Index()
  name: string;

  @Column({ default: JobPublicationStatus.UNPUBLISHED })
  status: JobPublicationStatus;

  @ManyToMany(() => User, (user) => user.jobs)
  @JoinTable({ name: 'job_applications' })
  users: User[];

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @DeleteDateColumn()
  deletedAt: string;
}
