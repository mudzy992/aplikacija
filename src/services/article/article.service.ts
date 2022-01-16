import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ArticleFeature } from 'src/entities/article-feature.entity';
import { ArticlePrice } from 'src/entities/article-price.entity';
import { Article } from 'src/entities/article.entity';
import { AddArticleDto } from 'src/dtos/article/add.article.dto';
import { ApiResponse } from 'src/misc/api.response.class';
import { In, Repository } from 'typeorm';
import { EditArticleDto } from 'src/dtos/article/edit.article.dto';
import { ArticleSearchDto } from 'src/dtos/article/article.seartch.dto';

@Injectable()
export class ArticleService extends TypeOrmCrudService<Article> {
  constructor(
    @InjectRepository(Article)
    private readonly article: Repository<Article>, //Čim spomenenom neki repozitorijum moramo da taj repozitoriju evidentiramo u našem osnovnom modulu (app.module.ts)
    // Ovo su novi repozitorijumi, koje koristimo da bi kreirali novi artikal
    @InjectRepository(ArticlePrice)
    private readonly articlePrice: Repository<ArticlePrice>, //Čim spomenenom neki repozitorijum moramo da taj repozitoriju evidentiramo u našem osnovnom modulu (app.module.ts)

    @InjectRepository(ArticleFeature)
    private readonly articleFeature: Repository<ArticleFeature>,
  ) {
    super(article);
  }
  // dodavanje novog artikla (koristi add.article.dto.ts)
  // Kreiranje novog metoda async je zbog toga što imamo rezultate koji su na await
  // createFullArticle(će uzimati podatke koji su tipa AddArtucleDto): vraćat će rezultat obećanje <Artikal ili grešku>
  // Kao što vidimo vraća nam full artikal, a mi znamo da u tom full artiklu imamo cijenu, features, slike koji nam trebaju
  // I to nije problem, jer ćemo dobiti articleId koji će biti na awaitu, i na osnovu tog articleId ćemo pridružiti cijenu, features, slike
  async createFullArticle(data: AddArticleDto): Promise<Article | ApiResponse> {
    // pravimo prvo jedan prazan artikal
    const newArticle: Article = new Article();
    // u koji ćemo ispuniti sve ono što nam AddArticleDto vraća
    // i to ubacujemo podatke koji su prvenstvno za artikal
    newArticle.name = data.name;
    newArticle.categoryId = data.categoryId;
    newArticle.excerpt = data.excerpt;
    newArticle.description = data.description;
    // snimamo u jednu konstantu taj novi artikal, i držimo ga na čekanju await
    const savedArticle = await this.article.save(newArticle);
    // Sada kada smo sačuvali artikal, u njemu imamo neke stvari koje su nam potrebne articleId
    // Prije svega u app.modul.ts treba dodavati repozitorijume koje koristimo, u ovom slučaju sljedeći nam je ArticlePrice
    // Kreirano novu konstantu, tj. ArticlePrice
    const newArticlePrice: ArticlePrice = new ArticlePrice();
    // i ubacujemo podatke u bazu koje zahtjeva tabela, articleId imamo u artiklu iznad kreiran savedArticle.articleId
    // a cijena nam je iz data (AddArticleDto)
    newArticlePrice.articleId = savedArticle.articleId;
    newArticlePrice.price = data.price;
    // i time je završeno kreiranje cijene
    await this.articlePrice.save(newArticlePrice);
    // ovaj proces se može ponavljati u nedogled, koliko god da je složen Dto, i može imati više varijacija, samo je bitno shvatiti proces rada
    // šta se prije čega treba da uradi, da bi u tom trenutku imao neki podatak koji je neophodan za sljedeći korak
    // dok u primjeru ispod (koda), prikazano kako izgleda kod kada neki podataka treba dodati kao niz objekata
    // kao što je u ovom slučaju niz features (detalja)
    // Za svaku feature od data.features(ako se vratimo u dto vidjeti možemo da smo rekli da features je niz objekata)
    for (const feature of data.features) {
      // pa kreirano novu konstantu koja će reci ovaj feature napravi kao novi
      const newArticleFeature: ArticleFeature = new ArticleFeature();
      // ispuni ga sljedećim podacima
      newArticleFeature.articleId = savedArticle.articleId; // kao što vidimo vadimo iz article ID
      newArticleFeature.featureId = feature.featureId; // featureId vadimo iz konstante for(const FEATURE of data.features)
      newArticleFeature.value = feature.value; // kao i value (tj. iz našeg AddArticleDto)
      // i naravno kao posljednji korak, spasi i taj podatak u neku konstantu i sačekaj sljedeći korak
      await this.articleFeature.save(newArticleFeature);
    }
    // Kada se sve završi iznad, trebamo vratiti kompletan Artikal nazad kao rezultat
    // da bi to uspjeli trebamo iskoristi funkciju pronalaženje jednog artikla (a pronaći ćemo ga opet uz pomoć articleId jer nam treba baš taj)
    // te da mu pridružimo relacije koje imamo u entitetu
    return await this.article.findOne(savedArticle.articleId, {
      relations: ['category', 'articleFeatures', 'features', 'articlePrices'],
    });
  }
  // Nakon svega kreiranog potrebno je u kontroleru pozvati funkciju za kreiranje novog artikla
  // METODA EDITOVANJA ARTIKLA, CIJENE i FEATURES
  async editFullArticle(
    articleId: number,
    data: EditArticleDto,
  ): Promise<Article | ApiResponse> {
    const existingArticle: Article = await this.article.findOne(articleId, {
      relations: ['articlePrices', 'articleFeatures'],
    });

    if (!existingArticle) {
      return new ApiResponse('error', -5001, 'Article not found.');
    }

    existingArticle.name = data.name;
    existingArticle.categoryId = data.categoryId;
    existingArticle.excerpt = data.excerpt;
    existingArticle.description = data.description;
    existingArticle.status = data.status;
    existingArticle.isPromoted = data.isPromoted;

    const savedArticle = await this.article.save(existingArticle);

    if (!savedArticle) {
      return new ApiResponse(
        'error',
        -5002,
        'Could not save new article data.',
      );
    }
    const newPriceString: string = Number(data.price).toFixed(2); // toFixed(2) konvertujemo na dvije decimale
    const lastPrice =
      existingArticle.articlePrices[existingArticle.articlePrices.length - 1]
        .price;
    const lastPriceString: string = Number(lastPrice).toFixed(2);

    if (newPriceString !== lastPriceString) {
      const newArticlePrice = new ArticlePrice();
      newArticlePrice.articleId = articleId;
      newArticlePrice.price = data.price;

      const savedArticlePrice = await this.articlePrice.save(newArticlePrice);

      if (!savedArticlePrice) {
        return new ApiResponse(
          'error',
          -5003,
          'Could not save new article price.',
        );
      }
    }

    if (data.features !== null) {
      await this.articleFeature.remove(existingArticle.articleFeatures);
      for (const feature of data.features) {
        const newArticleFeature: ArticleFeature = new ArticleFeature();
        newArticleFeature.articleId = articleId;
        newArticleFeature.featureId = feature.featureId;
        newArticleFeature.value = feature.value;
        await this.articleFeature.save(newArticleFeature);
      }
    }
    return await this.article.findOne(articleId, {
      relations: [
        'category',
        'articleFeatures',
        'features',
        'articlePrices',
        'photos',
      ],
    });
  }

  // PRETRAGA

  async search(data: ArticleSearchDto): Promise<Article[]> {
    const builder = await this.article.createQueryBuilder('article');

    builder.innerJoinAndSelect(
      'article.articlePrices',
      'ap',
      'ap.createdAt = (SELECT MAX(ap.created_at) FROM article_price AS ap WHERE ap.article_id = article.article_id)',
    );
    builder.leftJoinAndSelect('article.articleFeatures', 'af');

    builder.where('article.categoryId = :categoryId', {
      categoryId: data.categoryId,
    });

    if (data.keywords && data.keywords.length > 0) {
      builder.andWhere(
        '(article.name LIKE :kw OR article.excerpt LIKE :kw OR article.description LIKE :kw)',
        { kw: '%' + data.keywords.trim() + '%' },
      );
    }

    if (data.priceMin && typeof data.priceMin === 'number') {
      builder.andWhere('ap.price >= :min', { min: data.priceMin });
    }

    if (data.priceMax && typeof data.priceMax === 'number') {
      builder.andWhere('ap.price <= :max', { max: data.priceMax });
    }

    if (data.features && data.features.length > 0) {
      for (const feature of data.features) {
        builder.andWhere('af.featureId = :fId AND af.value IN (:fVals)', {
          fId: feature.featureId,
          fVals: feature.values,
        });
      }
    }

    let orderBy = 'article.name';
    let orderDirection: 'ASC' | 'DESC' = 'ASC';

    if (data.orderBy) {
      orderBy = data.orderBy;
      if (orderBy === 'price') {
        orderBy = 'ap.price';
      }
      if (orderBy === 'name') {
        orderBy = 'article.name';
      }
    }

    if (data.orderDirection) {
      orderDirection = data.orderDirection;
    }

    builder.orderBy(orderBy, orderDirection);

    let page = 0;
    let perPage: 5 | 10 | 25 | 50 | 75 = 25;

    if (data.page && typeof data.page === 'number') {
      page = data.page;
    }

    if (data.itemsPerPage && typeof data.itemsPerPage === 'number') {
      perPage = data.itemsPerPage;
    }

    builder.skip(page * perPage);
    builder.take(perPage);

    let articleIds = await (
      await builder.getMany()
    ).map((article) => article.articleId);

    return await this.article.find({
      where: { articleId: In(articleIds) },
      relations: [
        'category',
        'articleFeatures',
        'features',
        'articlePrices',
        'photos',
      ],
    });
  }
}
