import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfiguration } from 'config/database.configuration';
import { Administrator } from 'entities/administrator.entity';
import { ArticlePrice } from 'entities/article-price.entity';
import { ArticleFeature } from 'entities/article-feature.entity';
import { Category } from 'entities/category.entity';
import { AppController } from './controllers/app.controller';
import { Article } from 'entities/article.entity';
import { CartArticle } from 'entities/cart-article.entity';
import { Cart } from 'entities/cart.entity';
import { Feature } from 'entities/feature.entity';
import { Order } from 'entities/order.entity';
import { Photo } from 'entities/photo.entity';
import { User } from 'entities/user.entity';
import { AdministratorService } from './services/administrator/administrator.service';
import { AdministratorController } from './controllers/api/administrator.controller';
import { CategoryController } from './controllers/api/category.controller';
import { CategoryService } from './services/category/category.service';
import { ArticleService } from './services/article/article.service';
import { ArticleController } from './controllers/api/article.controller';
import { FeaturesService } from './services/features/feature.service';
import { FeaturesController } from './controllers/api/features.controller';
import { ArticleFeatureService } from './services/article-feature/article-feature.service';
import { ArticleFeatureController } from './controllers/api/article-feature.controller';
import { ArticlePriceController } from './controllers/api/article-price.controller';
import { ArticlePriceService } from './services/article-price/article-price.service';
import { CartArticleService } from './services/cart-article/cart-article.service';
import { CartArticleController } from './controllers/api/cart-article.controller';
import { CartService } from './services/cart/cart.service';
import { CartController } from './controllers/api/cart.controller';
import { OrderService } from './services/order/order.service';
import { OrderController } from './controllers/api/order.controller';
import { PhotoService } from './services/photo/photo.service';
import { PhotoController } from './controllers/api/photo.controller';
import { UserService } from './services/user/user.service';
import { UserController } from './controllers/api/user.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: DatabaseConfiguration.hostname,
      port: 3306,
      username: DatabaseConfiguration.username,
      password: DatabaseConfiguration.password,
      database: DatabaseConfiguration.database,
      entities: [
        Administrator,
        ArticleFeature,
        ArticlePrice,
        Article,
        CartArticle,
        Cart,
        Category,
        Feature,
        Order,
        Photo,
        User,
      ],
    }),
    // Repozitorijumi ispod (čim ga spomenemo, moramo da ga dodamo)
    TypeOrmModule.forFeature([
      Administrator, 
      Category, 
      Article, 
      Feature, 
      ArticleFeature,
      ArticlePrice,
      CartArticle,
      Cart,
      Order,
      Photo,
      User,
    ]),
  ],
  controllers: [
    AppController,
    AdministratorController,
    CategoryController,
    ArticleController,
    FeaturesController,
    ArticleFeatureController,
    ArticlePriceController,
    CartArticleController,
    CartController,
    OrderController,
    PhotoController,
    UserController,
  ],
  providers: [
    AdministratorService,
    CategoryService,
    ArticleService,
    FeaturesService,
    ArticleFeatureService,
    ArticlePriceService,
    CartArticleService,
    CartService,
    OrderService,
    PhotoService,
    UserService,
  ],
})
export class AppModule {}
