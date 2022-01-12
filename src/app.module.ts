import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfiguration } from 'config/database.configuration';
import { Administrator } from 'src/entities/administrator.entity';
import { ArticlePrice } from 'src/entities/article-price.entity';
import { ArticleFeature } from 'src/entities/article-feature.entity';
import { Category } from 'src/entities/category.entity';
import { AppController } from './controllers/app.controller';
import { Article } from 'src/entities/article.entity';
import { CartArticle } from 'src/entities/cart-article.entity';
import { Cart } from 'src/entities/cart.entity';
import { Feature } from 'src/entities/feature.entity';
import { Order } from 'src/entities/order.entity';
import { Photo } from 'src/entities/photo.entity';
import { User } from 'src/entities/user.entity';
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
import { UserCartController } from './controllers/api/user.cart.controller';
import { OrderService } from './services/order/order.service';
import { OrderController } from './controllers/api/order.controller';
import { PhotoService } from './services/photo/photo.service';
import { PhotoController } from './controllers/api/photo.controller';
import { UserService } from './services/user/user.service';
import { UserController } from './controllers/api/user.controller';
import { AuthController } from './controllers/api/auth.controller';
import { AuthMiddleware } from './middlewares/auth.middleware';

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
    UserCartController,
    OrderController,
    PhotoController,
    UserController,
    AuthController,
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
  exports: [
    // zbog middleware potrebno je exportovati servis
    // da bi svi ostali elementi koji se nalaze van okvira modula
    AdministratorService,
    UserService,
  ],
})

// Konzumer middleware-a
// sve što se dešava u ovom modulu (kontroleri, sve rute),
// mogu da budu podložene tih nekih presretača requestova
// potrebno je konvertovati AppModule u nestModul (implementirati)
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Nema throw već mi treba da odredimo šta treba da radi
    // a mi želimo da on primjeni određeni middleware
    consumer
      .apply(AuthMiddleware)
      // kada kažemo koji middleware naš konzumer treba da primjenjuje
      // moramo da damo nekoliko izuzetaka, i spisak ruta za koje će važiti
      .exclude('auth/*') // Izbjegni sve što počinje sa auth/*, 'assets/*', 'uploads/*'itd.
      .forRoutes('api/*'); // Ali primjeni se na sve što počinje sa api/
  }
}
