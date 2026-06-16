import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1781569311026 implements MigrationInterface {
    name = 'InitialSchema1781569311026';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "players" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nick" character varying NOT NULL, "avatarUrl" character varying NOT NULL, "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b61389fad33ed6329b08f8838f9" UNIQUE ("nick"), CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "order_pokemons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pokemonId" integer NOT NULL, "pokemonName" character varying NOT NULL, "sprite" text, "breedPokemonId" integer, "breedPokemonName" character varying, "nature" character varying NOT NULL, "abilityName" character varying, "abilityIsHa" boolean NOT NULL DEFAULT false, "regionalForm" character varying, "regionalFormLabel" character varying, "regionalFormDisplayName" character varying, "value" integer NOT NULL DEFAULT '0', "breedable" boolean NOT NULL DEFAULT false, "status" character varying NOT NULL, "orderId" uuid, CONSTRAINT "PK_0efc6fc1bfdd8e8e0c547a0507f" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "playerId" uuid NOT NULL, "subtotal" integer NOT NULL DEFAULT '0', "discount" integer NOT NULL DEFAULT '0', "total" integer NOT NULL DEFAULT '0', "paidAmount" integer NOT NULL DEFAULT '0', "paid" boolean NOT NULL DEFAULT false, "needsFemale" boolean NOT NULL DEFAULT false, "observations" text, "archived" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "order_status_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" uuid NOT NULL, "orderPokemonId" character varying, "pokemonDexId" integer, "pokemonName" character varying, "oldStatus" character varying, "newStatus" character varying NOT NULL, "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e6c66d853f155531985fc4f6ec8" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "owned_has" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "abilityName" character varying NOT NULL, "nature" character varying, "breedableValue" integer NOT NULL, "castratedValue" integer NOT NULL, "notes" text, "regionalForm" character varying, "regionalFormLabel" character varying, "regionalFormDisplayName" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3abdfe3901fe913fabf34fb4af4" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "owned_ha_pokemons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ownedHaId" uuid NOT NULL, "pokemonDexId" integer NOT NULL, "pokemonName" character varying NOT NULL, "pokemonSprite" character varying, "isBase" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_4982cc9bfdf90f15a697affa8a8" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "owned_pokemons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pokemonDexId" integer NOT NULL, "pokemonName" character varying NOT NULL, "pokemonSprite" character varying, "breedBaseDexId" integer, "breedBaseName" character varying, "regionalForm" character varying, "regionalFormLabel" character varying, "regionalFormDisplayName" character varying, "eggGroups" text, "evolutionLine" text, "status" character varying NOT NULL, "gender" character varying NOT NULL, "nature" character varying, "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2255a084ce433ae7cc5db7fea2e" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "breedableDefaultValue" integer NOT NULL DEFAULT '14000000', "castratedDefaultValue" integer NOT NULL DEFAULT '3500000', "backupVersion" integer NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "playerId" uuid NOT NULL, "orderId" uuid NOT NULL, "amount" integer NOT NULL, "type" character varying NOT NULL DEFAULT 'ORDER_PAYMENT', "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "refreshTokenHash" character varying, "role" character varying NOT NULL DEFAULT 'ADMIN', "isActive" boolean NOT NULL DEFAULT true, "lastLoginAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_pokemons" ADD CONSTRAINT "FK_ffc825a147cfc0a367fda36f01d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "orders" ADD CONSTRAINT "FK_97867f2741e3cecaf12a97c12c5" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_status_history" ADD CONSTRAINT "FK_689db3835e5550e68d26ca32676" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "owned_ha_pokemons" ADD CONSTRAINT "FK_a1c78b1cda3f6b10186a8b1af50" FOREIGN KEY ("ownedHaId") REFERENCES "owned_has"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" ADD CONSTRAINT "FK_3f4996e03c8fc7a32951a486af3" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" ADD CONSTRAINT "FK_2fdbbae70ff802bc8b703ee7c5c" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "transactions" DROP CONSTRAINT "FK_2fdbbae70ff802bc8b703ee7c5c"`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" DROP CONSTRAINT "FK_3f4996e03c8fc7a32951a486af3"`,
        );
        await queryRunner.query(
            `ALTER TABLE "owned_ha_pokemons" DROP CONSTRAINT "FK_a1c78b1cda3f6b10186a8b1af50"`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_status_history" DROP CONSTRAINT "FK_689db3835e5550e68d26ca32676"`,
        );
        await queryRunner.query(
            `ALTER TABLE "orders" DROP CONSTRAINT "FK_97867f2741e3cecaf12a97c12c5"`,
        );
        await queryRunner.query(
            `ALTER TABLE "order_pokemons" DROP CONSTRAINT "FK_ffc825a147cfc0a367fda36f01d"`,
        );
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TABLE "settings"`);
        await queryRunner.query(`DROP TABLE "owned_pokemons"`);
        await queryRunner.query(`DROP TABLE "owned_ha_pokemons"`);
        await queryRunner.query(`DROP TABLE "owned_has"`);
        await queryRunner.query(`DROP TABLE "order_status_history"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TABLE "order_pokemons"`);
        await queryRunner.query(`DROP TABLE "players"`);
    }
}
