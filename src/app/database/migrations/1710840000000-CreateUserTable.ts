import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm'
import { UserRole } from '../../modules/shared/enumeration'

export class CreateUserTable1710840000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'first_name',
            type: 'varchar',
          },
          {
            name: 'last_name',
            type: 'varchar',
          },
          {
            name: 'user_name',
            type: 'varchar',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'role',
            type: 'enum',
            enum: Object.values(UserRole),
            default: `'${UserRole.PARENT}'`,
          },
          {
            name: 'clerk_user_id',
            type: 'varchar',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'email_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    )

    // Add indexes using TableIndex
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_email',
        columnNames: ['email'],
        isUnique: true,
      }),
    )

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_clerk_id',
        columnNames: ['clerk_user_id'],
        isUnique: true,
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users')
  }
}
