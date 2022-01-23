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
import { Exclude } from 'class-transformer';

import { JobPublicationStatus } from '../enums/job-publication-status.enum';

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

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @DeleteDateColumn()
  deletedAt: string;
}
