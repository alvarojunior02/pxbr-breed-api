import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnedHaPokemon } from './entities/owned-ha-pokemon.entity';
import { OwnedHa } from './entities/owned-ha.entity';
import { OwnedHasController } from './owned-has.controller';
import { OwnedHasService } from './owned-has.service';

@Module({
    imports: [TypeOrmModule.forFeature([OwnedHa, OwnedHaPokemon])],
    controllers: [OwnedHasController],
    providers: [OwnedHasService],
    exports: [OwnedHasService],
})
export class OwnedHasModule {}
