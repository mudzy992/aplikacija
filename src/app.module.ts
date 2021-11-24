import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfiguration } from 'config/database.configuration';
import { Administrator } from 'entities/administrator.entity';
import { Category } from 'entities/categories.entitiy';
import { AppController } from './app.controller';
import { AdministratorService } from './services/administrator/administrator.service';
import { CategoryService } from './services/category/category.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: DatabaseConfiguration.hostname,
      port: 3306,
      username: DatabaseConfiguration.username,
      password: DatabaseConfiguration.password,
      database: DatabaseConfiguration.database,
      entities: [Administrator, Category],
    }),
    TypeOrmModule.forFeature([Administrator, Category]),
  ],
  controllers: [AppController],
  providers: [AdministratorService, CategoryService],
})
export class AppModule {}
