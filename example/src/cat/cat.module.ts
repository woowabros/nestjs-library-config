import { Module } from '@nestjs/common';
import { CatService } from './cat.service';
import { CatController } from './cat.controller';
import { ConfigModule } from '../../../dist';
import { CatConfigService } from 'src/cat/configs/cat.config.service';
import { OwnerConfigService } from 'src/cat/configs/owner.config.service';
import { PetConfigService } from 'src/cat/configs/pet.config.service';

@Module({
  controllers: [CatController],
  providers: [CatService],
  imports: [
    ConfigModule.forFeature([
      CatConfigService,
      OwnerConfigService,
      PetConfigService,
    ]),
  ],
})
export class CatModule {}
