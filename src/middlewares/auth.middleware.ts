import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AdministratorService } from 'src/services/administrator/administrator.service';
import * as jwt from 'jsonwebtoken';
import { jwtSecret } from 'config/jwt.secret';
import { JWTDataAdministratorDto } from 'src/dtos/administrator/jwt.data.administrator.dto';

@Injectable() // Ni pod razno ovo zaboraviti
export class AuthMiddleware implements NestMiddleware {
  // Svaki sljedeći middleware koji budemo pravili mora
  // da implemetira ovaj NestMiddleware
  // nakon toga nam se podvuće naziv klase, i kada idemo
  // desni klik na to imamo opciju implements da nam ubaci kod ispod (kreira nam se use metod)
  // Uraditi edit pod req, res, i next
  // Ovaj naš middleware ima Request i Response sa kojim radi, i next funkciju koju treba da pokrene
  constructor(private readonly administratorService: AdministratorService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      // ako naš header nema authorization prekidamo aplikaciju
      // Naš AuthMiddleware zahtjeva da ima header koji se zove authorization
      throw new HttpException('Nema tokena', HttpStatus.UNAUTHORIZED);
    }
    // Izvuci token iz headera
    const token = req.headers.authorization;
    // formiranje jwt objekta
    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2) {
      throw new HttpException('Ne valja token', HttpStatus.UNAUTHORIZED);
    }
    const tokensString = tokenParts[1];
    let jwtData: JWTDataAdministratorDto;
    try {
      jwtData = jwt.verify(tokensString, jwtSecret);
    } catch (e) {
      // u slučaju da ne postoji jwtData isto bacaj grešku
      throw new HttpException('Ne valja token', HttpStatus.UNAUTHORIZED);
    }
    // A ako sve prođe, potrebno je provjeriti jwtData
    if (jwtData.ip !== req.ip.toString()) {
      // Greška jwtData i request ip
      throw new HttpException('Ne valja token', HttpStatus.UNAUTHORIZED);
    }
    if (jwtData.ua !== req.headers['user-agent']) {
      // Greška jwtData i request ua
      throw new HttpException('Ne valja token', HttpStatus.UNAUTHORIZED);
    }

    const administrator = await this.administratorService.getById(
      jwtData.administratorId,
    );
    if (!administrator) {
      // Greška jwtData i request korisnik ne postoji
      throw new HttpException('Korisnik ne postoji', HttpStatus.UNAUTHORIZED);
    }

    const trenutnoVrijeme = new Date().getTime() / 1000;
    if (trenutnoVrijeme >= jwtData.exp) {
      // Greška ako je token istekao
      throw new HttpException('Token je istekao', HttpStatus.UNAUTHORIZED);
    }
    // Na kraju se uvijek ako je sve prošlo kako treba (ako ovaj middleware nije prekinuo aplikaciju)
    // ćemo pozvati next(); funkciju i to je to
    next();

    // Nakon što smo sve provjere završili, potrebo je AuthMiddleware implementirati u app.module.ts
  }
}
