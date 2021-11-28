import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { Category } from 'entities/category.entity';
import { CategoryService } from 'src/services/category/category.service';

@Controller('api/category')
@Crud({
  // Ako u tabeli imamo potrebu da radimo join nekih entiteta (tj. prilikom pravljenja baze da li smo join neke tabele)
  // potrebno je crud-u reći, ljudino odobravno join ovdje i to moramo na tačno precizan način da opišemo
  // kako su one formirane u našoj bazi podataka, kako se vezuju, pretražuju i kako želimo da budu prikazene

  model: {
    type: Category,
  },
  params: {
    id: {
      field: 'categoryId',
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
      categories: {
        // ako ovdje stavim eager: true automacki dobijam pregled podkategorija
        eager: true,
      },
      // ime mora biti isto kao što je definisano u entitetu
      parentCategory: {
        // a ako staviti eager: false kažem da ne zelim da podrazumjevano automacki učitava -- localhost:3003/api/category/?join=parentCategory (u link)
        eager: false,
      },
      features: {
        eager: true,
      },
      articles: {
        eager: false,
      },
    },
  },
})
export class CategoryController {
  constructor(public service: CategoryService) {}
}
