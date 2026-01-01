require('reflect-metadata');
const {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} = require('typeorm');

@Entity('user')
class User {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column({ type: 'varchar', length: 255, unique: true })
  email;

  @Column({ type: 'varchar', length: 255 })
  password_hash;

  @Column({ type: 'varchar', length: 100, nullable: true })
  first_name;

  @Column({ type: 'varchar', length: 100, nullable: true })
  last_name;

  @Column({ type: 'boolean', default: false })
  is_verified;

  @Column({ type: 'boolean', default: true })
  is_active;

  @Column({ type: 'datetime', nullable: true })
  last_login_at;

  @Column({ type: 'text', nullable: true, default: '{}' })
  preferences;

  @CreateDateColumn({ type: 'datetime' })
  created_at;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deleted_at;
}

module.exports = User;
