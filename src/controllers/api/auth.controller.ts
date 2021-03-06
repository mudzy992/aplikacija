/* eslint-disable prettier/prettier */
// 1. Anotacija kontrolera (sa nekon rutom)
// 2. Export klase određenog naziva
// 3. Koristit će u sebi servis administratora
//    jer želimo da radimo sa mogućnošću provjere, da li neki
//    određeni zahtjev upućen nama (username, password),
//    odgovaraju nekom postojećem korisniku u bazi podataka

import { Controller, Post, Body, Req, HttpStatus, HttpException } from "@nestjs/common";
import { AdministratorService } from "src/services/administrator/administrator.service";
import { LoginAdministratorDto } from "src/dtos/administrator/login.administrator.dto";
import { ApiResponse } from "src/misc/api.response.class";
import * as crypto from 'crypto';
import { LoginInfoDto } from "src/dtos/auth/login.info.dto";
import * as jwt from 'jsonwebtoken';
import { JWTDataDto } from "src/dtos/auth/jwt.data.dto";
import { Request } from "express";
import { jwtSecret } from "config/jwt.secret";
import { UserRegistrationDto } from "src/dtos/user/user.registration.dto";
import { UserService } from "src/services/user/user.service";
import { LoginUserDto } from "src/dtos/user/login.user.dto";
import { JwtRefreshDataDto } from "src/dtos/auth/jwt.refresh.dto";
import { UserRefreshTokenDto } from "src/dtos/auth/user.refresh.token.dto";
import { AdministratorRefreshTokenDto } from "src/dtos/auth/administrator.refresh.token.dto";

@Controller('auth')
export class AuthController {
  constructor(
    public administratorService: AdministratorService,
    public userService: UserService,
  ) {}
  // Obzirom da se radi o Post metodu koji zahtjeva tijelo objekta,
  // potrebno je kreirati DTO (data transfer objekat)
  @Post('administrator/login')
  // Kada korisnik dodje @Post metodom na putanju auth/login, izvršava se doLogin metod
  async doAdministratorLogin(
    // Proslijeđujemo username i password putem DTO loginAdminDto
    @Body() data: LoginAdministratorDto,
    @Req() req: Request,
  ): Promise<LoginInfoDto | ApiResponse> {
    // Sada kada smo dobili informacije o korisniku
    // prvo što treba da uradimo da pokušamo da dopremimo informacije od adminu
    // sa tim određenim username
    const administrator = await this.administratorService.getByUsername(
      data.username,
    );
    // Smjestili smo administratora u konstantu administrator pomoću administratorServisa
    // i metoda u njemu getByUsername u kojem imamo dva moguća ishoda, admin uredan ili null
    if (!administrator) {
      // if - ako administrator ne postoji null radimo sljedeće
      return new Promise<ApiResponse>((resolve) =>
        resolve(new ApiResponse('error', -3001, 'ne valja username')),
      );
    }

    // Kada je administrator pronađen, mi ne želimo da dostavimo sve informacije o njemu
    // Sljedeće što moramo da provjerimo jeste njegova lozinka
    const passwordHash = crypto.createHash('sha512');
    passwordHash.update(data.password);
    const passwordHashString = passwordHash.digest('hex').toUpperCase();

    if (administrator.passwordHash !== passwordHashString) {
      // Ako se ispostavi da naš passwordHash koji smo dostavili nije isti kao u bazi
      // Znači password koji je korisnik ukucao u login formu nije ispravan
      return new Promise<ApiResponse>((resolve) =>
        // Vraćamo novu grešku
        resolve(new ApiResponse('error', -3002, 'ne valja password')),
      );
    }

    // Ako smo prešli sve moguće greške koje nas mogu sačekati, ostaje nam još uspješna prijava
    // Nikako ne smijemo dostavljati kompletne podatke o korisniku (isključivo ne password)
    // podatci koji nam mogu biti od koristi su npr.
    // administratorId
    // username
    // token (JWT)
    //          TAJNA ŠIFRA
    //          JSON = (administratorId, username, exp, ip, ua)
    //          Šifrovanje (tajna šifra -> json) -> Sifrat binarni -> base64 encode
    // HEXSTRING

    // Prvo ćemo generisati naš token

    // GENERISANJE TOKENA
    const jwtData = new JWTDataDto();
    jwtData.role = "administrator";
    jwtData.id = administrator.administratorId;
    jwtData.identity = administrator.username;
    jwtData.exp = this.getDatePlus(60 * 5);
    jwtData.ip = req.ip.toString();
    jwtData.ua = req.headers['user-agent'];

    const token: string = jwt.sign(jwtData.toPlainObject(), jwtSecret); // generisati ga ovdje

    const jwtRefreshData = new JwtRefreshDataDto();
        jwtRefreshData.role = jwtData.role;
        jwtRefreshData.id = jwtData.id;
        jwtRefreshData.identity = jwtData.identity;
        jwtRefreshData.exp = this.getDatePlus(60 * 60 * 24 * 31);
        jwtRefreshData.ip = jwtData.ip;
        jwtRefreshData.ua = jwtData.ua;

        const refreshToken: string = jwt.sign(jwtRefreshData.toPlainObject(), jwtSecret);

    const responseObject = new LoginInfoDto(
      administrator.administratorId,
      administrator.username,
      token,
      refreshToken,
            this.getIsoDate(jwtRefreshData.exp),
        );

        await this.administratorService.addToken(
            administrator.administratorId,
            refreshToken,
            this.getDatabaseDateFormat(this.getIsoDate(jwtRefreshData.exp))
        );

        return new Promise(resolve => resolve(responseObject));
    }

  @Post('administrator/refresh') // http://localhost:3000/auth/administrator/refresh/
    async administratorTokenRefresh(@Req() req: Request, @Body() data: AdministratorRefreshTokenDto): Promise<LoginInfoDto | ApiResponse> {
        const administratorToken = await this.administratorService.getAdministratorToken(data.token);

        if (!administratorToken) {
            return new ApiResponse("error", -10002, "No such refresh token!");
        }

        if (administratorToken.isValid === 0) {
            return new ApiResponse("error", -10003, "The token is no longer valid!");
        }

        const sada = new Date();
        const datumIsteka = new Date(administratorToken.expiresAt);

        if (datumIsteka.getTime() < sada.getTime()) {
            return new ApiResponse("error", -10004, "The token has expired!");
        }

        let jwtRefreshData: JwtRefreshDataDto;

        try {
            jwtRefreshData = jwt.verify(data.token, jwtSecret);
        } catch (e) {
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        if (!jwtRefreshData) {
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        if (jwtRefreshData.ip !== req.ip.toString()) {
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        if (jwtRefreshData.ua !== req.headers["user-agent"]) {
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        const jwtData = new JWTDataDto();
        jwtData.role = jwtRefreshData.role;
        jwtData.id = jwtRefreshData.id;
        jwtData.identity = jwtRefreshData.identity;
        jwtData.exp = this.getDatePlus(60 * 5);
        jwtData.ip = jwtRefreshData.ip;
        jwtData.ua = jwtRefreshData.ua;

        const token: string = jwt.sign(jwtData.toPlainObject(), jwtSecret);

        const responseObject = new LoginInfoDto(
            jwtData.id,
            jwtData.identity,
            token,
            data.token,
            this.getIsoDate(jwtRefreshData.exp),
        );

        return responseObject;
    }
    
  // REGISTRACIJA NOVOG KORISNIKA
  @Post('user/register')
  async userRegister(@Body() data: UserRegistrationDto) {
    return await this.userService.register(data);
  }

  @Post('user/login')
  async doUserLogin(

    @Body() data: LoginUserDto,
    @Req() req: Request,
  ): Promise<LoginInfoDto | ApiResponse> {

    const user = await this.userService.getByEmail(
      data.email,
    );
    if (!user) {
      return new Promise<ApiResponse>((resolve) =>
        resolve(new ApiResponse('error', -3001, 'ne valja username')),
      );
    }
    const passwordHash = crypto.createHash('sha512');
    passwordHash.update(data.password);
    const passwordHashString = passwordHash.digest('hex').toUpperCase();

    if (user.passwordHash !== passwordHashString) {
      return new Promise<ApiResponse>((resolve) =>
        resolve(new ApiResponse('error', -3002, 'ne valja password')),
      );
    }
    const jwtData = new JWTDataDto();
        jwtData.role = "user";
        jwtData.id = user.userId;
        jwtData.identity = user.email;
        jwtData.exp = this.getDatePlus(60 * 1);
        jwtData.ip = req.ip.toString();
        jwtData.ua = req.headers["user-agent"];

    const token: string = jwt.sign(jwtData.toPlainObject(), jwtSecret);

    const jwtRefreshData = new JwtRefreshDataDto();
        jwtRefreshData.role = jwtData.role;
        jwtRefreshData.id = jwtData.id;
        jwtRefreshData.identity = jwtData.identity;
        jwtRefreshData.exp = this.getDatePlus(60 * 60 * 24 * 31);
        jwtRefreshData.ip = jwtData.ip;
        jwtRefreshData.ua = jwtData.ua;

        const refreshToken: string = jwt.sign(jwtRefreshData.toPlainObject(), jwtSecret);

        const responseObject = new LoginInfoDto(
            user.userId,
            user.email,
            token,
            refreshToken,
            this.getIsoDate(jwtRefreshData.exp),
        );

        await this.userService.addToken(
            user.userId,
            refreshToken,
            this.getDatabaseDateFormat(this.getIsoDate(jwtRefreshData.exp))
        );

        return new Promise(resolve => resolve(responseObject));
    }

  @Post('user/refresh') // http://localhost:3000/auth/user/refresh/
    async userTokenRefresh(@Req() req: Request, @Body() data: UserRefreshTokenDto): Promise<LoginInfoDto | ApiResponse> {
        const userToken = await this.userService.getUserToken(data.token);

        if (!userToken) {
            return new ApiResponse("error", -10002, "No such refresh token!");
        }

        if (userToken.isValid === 0) {
            return new ApiResponse("error", -10003, "The token is no longer valid!");
        }

        const sada = new Date().toISOString();
        const datumIsteka = new Date(userToken.expiresAt).toISOString();

        if (datumIsteka < sada) {
            return new ApiResponse("error", -10004, "The token has expired!");
        }

        let jwtRefreshData: JwtRefreshDataDto;
        
        try {
            jwtRefreshData = jwt.verify(data.token, jwtSecret);
        } catch (e) {
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        if (!jwtRefreshData) {
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        if (jwtRefreshData.ip !== req.ip.toString()) {
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        if (jwtRefreshData.ua !== req.headers["user-agent"]) {
            throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        }

        const jwtData = new JWTDataDto();
        jwtData.role = jwtRefreshData.role;
        jwtData.id = jwtRefreshData.id;
        jwtData.identity = jwtRefreshData.identity;
        jwtData.exp = this.getDatePlus(60 * 5);
        jwtData.ip = jwtRefreshData.ip;
        jwtData.ua = jwtRefreshData.ua;

        const token: string = jwt.sign(jwtData.toPlainObject(), jwtSecret);

        const responseObject = new LoginInfoDto(
          jwtData.id,
          jwtData.identity,
          token,
          data.token,
          this.getIsoDate(jwtRefreshData.exp),
      );

        return responseObject;
    }
  
  private getDatePlus(numberOfSeconds: number): number {
    return new Date().getTime() / 1000 + numberOfSeconds;
}

private getIsoDate(timestamp: number): string {
  const date = new Date();
  date.setTime(timestamp * 1000);
  return date.toISOString();
}

  private getDatabaseDateFormat(isoFormat: string): string {
    return isoFormat.substr(0, 19).replace('T', ' ');
}
}
