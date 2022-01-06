/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Crud } from '@nestjsx/crud';
import { Article } from 'entities/article.entity';
import { AddArticleDto } from 'src/dtos/article/add.article.dto';
import { ArticleService } from 'src/services/article/article.service';
import { diskStorage } from 'multer';
import { StorageConfig } from 'config/storage.config';
import { PhotoService } from 'src/services/photo/photo.service';
import { Photo } from 'entities/photo.entity';
import { ApiResponse } from 'src/misc/api.response.class';
import * as fileType from 'file-type';
import * as fs from 'fs'; // korišteno za brisanje datoteka i fajlova
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
    },
  },
  query: {
    join: {
      category: {
        eager: true,
      },
      articleFeatures: {
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
  constructor(
    public service: ArticleService,
    public photoService: PhotoService,
  ) {}

  // ANOTACIJA za kreiranje novog artikla
  // Anotiram createFull funkciju
  @Post('createFull') // ruta
  // koja će da uzima isto cijeli AddArticleDto
  // obavezno data anotirati kao Body
  createFullArticle(@Body() data: AddArticleDto) {
    // i vraća rezultat servisa kreiranog novog artikla na osnovu tih data
    return this.service.createFullArticle(data);
  }
  @Post(':id/uploadPhoto/') // POST http://localhost:3000/api/article/:id/uploadPhoto
  @UseInterceptors(
    // Prihvata rad sa presretačima
    FileInterceptor('photo', {
      // te koristi FIleUploadPresretač (FileIntercepto), gdje uzima iz photo vrijednosti
      // dest: StorageConfig.photos // Najjednostavniji način (definisati destinaciji u tjt.)
      storage: diskStorage({
        // i tu fotografiju pokušava da sačuva na diskStorage
        destination: StorageConfig.photoDestination, // na lokaciji koja je definisana u StorageConfig
        filename: (req, file, callback) => {
          // filename se formira tako što mi ručno pravimo funkciju koja će formirati filename
          const original: string = file.originalname;
          let normalized = original.replace(/\s+/g, '-'); // u slučaju da se pojavi whitespace /\s+ globalno ga zamjeniti /g, sa '-'
          normalized = normalized.replace(/[^A-z0-9\.\-]/g, '');
          const sada = new Date(); // 'sada' je novi datum
          let datePart = ''; // datePart u startu je prazan
          datePart += sada.getFullYear().toString(); // izvlačimo godinu
          datePart += (sada.getMonth() + 1).toString(); // izvlačimo mjesec (pošto mjeseci kreću od 0 do 11 dodajemo +1)
          datePart += sada.getDate().toString(); // izvlačimo dan u mjesecu

          const randomPart: string = new Array(10) // kreiramo niz od radnom 10 brojeva
            .fill(0) // u startu ga je potrebno popuniti sa nekim karakterom/broje koji će biti promjenjen
            .map((e) => (Math.random() * 9).toFixed(0).toString()) // uradimo mapiranje
            .join(''); // i na kraju ih spojimo

          let fileName = datePart + '-' + randomPart + '-' + normalized; //spajanje svih atributa i fileName
          fileName = fileName.toLowerCase();
          callback(null, fileName); // vrati fileName tj. ime fajla
        },
      }),
      fileFilter: (req, file, callback) => {
        // prihvatamo file, fileFilter zahtjeva true/false
        // provjera fajlova
        // 1. Provjera extenzije jpg, png
        if (!file.originalname.toLowerCase().match(/\.(jpg|png)$/)) {
          // provjeravamo da li u svom orginalnom imenu ima jpg|png na kraju $
          req.fileFilterError = 'Bad file extension'; // Pristupamo requestu i izmišljamo mu neko novi property
          callback(null, false); // ako nema, izbaci grešku i prekini (fatamo grešku u uploadedPhoto)
          // Da sam u callbacku naveo grešku new Error('Bad file extension', false) - ona bi s eprikazala u backendu(konzoli)
          return;
        }
        // 2. Provjera tipa sadržaja: image/jpeg, image/png (mimetype) (fatamo grešku u uploadedPhoto)
        if (
          !(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))
        ) {
          req.fileFilterError = 'Bad file content type';
          callback(null, false);
          return;
        }
        // ako je sve uredno vrati true
        callback(null, true);
      },
      limits: {
        files: 1, // max količina fajlova za upload
        fileSize: StorageConfig.photoMaxFileSize, // max veličina fajla (definisano u photo config)
      },
    }),
  )
  // Datoteka uploadPhoto uzima jedan parametar id (koji je dat u URL articleId)
  // UploadedFile() file koji je prošao sve provjere, premještanja, preimenovanje, te uzimamo taj photo
  async uploadPhoto(
    @Param('id') articleId: number,
    @UploadedFile() photo,
    @Req() req,
  ): Promise<ApiResponse | Photo> {
    // Fatanje grešaka filtera
    // Pitamo da li u req.fileFilterError postoji greška, i u slučaju da postoji, vraćamo ApiResponse
    if (req.fileFilterError) {
      return new ApiResponse('error', -4002, req.fileFilterError); // Uključili smo u ApiResponse i message kao treći argument, req.fileFilterError
    }
    // Ili postavljamo pitanje, ako uopšte iz bilo kojeg razloga nije dodana fotka
    if (!photo) {
      return new ApiResponse('error', -4002, 'Slika nije dodana');
    }
    // // Pravi mimetype
    const fileTypeResult = await fileType.fileTypeFromFile(photo.path);
    if (!fileTypeResult) {
      fs.unlinkSync(photo.path); // prije ApiResponse obrisati fajl
      return new ApiResponse('error', -4002, 'Ne mogu detektovati file type');
    }

    const realMimeType = fileTypeResult.mime;
    if (!(realMimeType.includes('jpeg') || realMimeType.includes('png'))) {
      fs.unlinkSync(photo.path); // prije ApiResponse obrisati fajl
      return new ApiResponse('error', -4002, 'Bad content type');
    }
    // Pravljenje i čuvanje umanjene sličice (thumbnail)
    // Kreirano novi photo entitet
    const newPhoto: Photo = new Photo();
    // Koji u sebi sadrži adticleId i imagePath
    newPhoto.articleId = articleId;
    newPhoto.imagePath = photo.filename;
    // Uzimamo sačuvani photo (savedPhoto) koji je servis sa funkcijom add(newPhoto)
    const savedPhoto = await this.photoService.add(newPhoto);

    if (!savedPhoto) {
      // ili da nije sačuvana slika
      return new ApiResponse('error', -4001); // vraća grešku
    }
    return savedPhoto; // te vraća informaciju da je uspješno sačuvan
  }
}
