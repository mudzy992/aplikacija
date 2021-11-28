import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Article } from 'entities/article.entity';
import { ArticleService } from 'src/services/article/article.service';

@Controller('api/article')
@Crud({
  model: {
    type: Article,
  },
  params: {
    id: {
      field: 'articleId',
      type: 'number',
      primary: true,
      // ovim smo definisali da naš category entitet
      // ima kao svoj primarni ključ, nešto što se čuva
      // u polju id, ima tip number
      // (ovo se moglo izmjeniti u entitetu samo polje primarnog ključa da se zove id)
    },
  },
  // ---- JOIN ---
  // u CRUD omogućavamo korištenje query
  query: {
    // ovjde moramo da navedemo koje od relacija koje postoje u definiciji našeg Category modela
    // želimo da omogućimo da budu join, i moramo da navedemo koje su relacije upitanju
    // to je najbolje pogledati u modelu koji je automacki generisan za koje relacije je potreban join

    join: {
      // Želim da kategorije budu omogućene (uz eventualne parametre)
      category: {
        // ako ovdje stavim eager: true automacki dobijam pregled podkategorija
        eager: true,
      },
      // ime mora biti isto kao što je definisano u entitetu
      articleFeatures: {
        //Ovjde nam articleFeatures vraća podatak value, treba izvući i naziv tog features
        eager: true,
      },
      features: {
        // urađena izmjena u article i feature entitetima, naprvljena ManyToMany relacija
        eager: true,
      },
      articlePrices: {
        eager: true,
      },
      cartArticles: {
        eager: false,
      },
      photos: {
        eager: true,
      },
    },
  },
})
export class ArticleController {
  constructor(public service: ArticleService) {}
}
