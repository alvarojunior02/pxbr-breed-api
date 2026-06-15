import { PartialType } from '@nestjs/swagger';
import { CreateOwnedHaDto } from './create-owned-ha.dto';

export class UpdateOwnedHaDto extends PartialType(CreateOwnedHaDto) {}
