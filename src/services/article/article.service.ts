import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ArticleFeature } from 'entities/article-feature.entity';
import { ArticlePrice } from 'entities/article-price.entity';
import { Article } from 'entities/article.entity';
import { AddArticleDto } from 'src/dtos/article/add.article.dto';
import { ApiResponse } from 'src/misc/api.response.class';
import { Repository } from 'typeorm';

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
}
