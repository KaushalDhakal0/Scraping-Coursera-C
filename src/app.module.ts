import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScrapController } from './scrap/scrap.controller';
import { ScrapModule } from './scrap/scrap.module';
@Module({
  imports: [ScrapModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
