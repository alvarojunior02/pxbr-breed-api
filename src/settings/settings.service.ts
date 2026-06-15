import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Settings } from './entities/settings.entity';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(Settings)
        private readonly settingsRepository: Repository<Settings>,
    ) {}

    async getSettings() {
        const currentSettings = await this.settingsRepository.findOne({
            where: {},
            order: {
                createdAt: 'ASC',
            },
        });

        if (currentSettings) {
            return currentSettings;
        }

        return this.settingsRepository.save(
            this.settingsRepository.create({
                breedableDefaultValue: 14000000,
                castratedDefaultValue: 3500000,
                backupVersion: 1,
            }),
        );
    }

    async update(updateSettingsDto: UpdateSettingsDto) {
        const settings = await this.getSettings();

        Object.assign(settings, updateSettingsDto);

        return this.settingsRepository.save(settings);
    }
}
