import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UsersSeed } from "./users.seed";
import { UsersService } from "./users.service";

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UsersService, UsersSeed],
    exports: [UsersService]
})
export class UsersModule {}
