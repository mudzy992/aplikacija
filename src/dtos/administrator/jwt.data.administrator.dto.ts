export class JWTDataAdministratorDto {
  administratorId: number;
  username: string;
  ext: number; //UNIX timestamp
  ip: string;
  ua: string;
  // U slučaju da ovdje dodamo još  neki podatak koji će trebati u token
  // automacki će svi prethodni tokeni koji su generisani biti pogrešni
  // logično ako token kreiran sa podacima iznad (unikatni), ne sadrže podatke
  // koje smo naknadno dodali, nisu validni, tj. token nije validan
  // konverzija u plain objekat
  toPlainObject() {
    return {
      administratorId: this.administratorId,
      username: this.username,
      ext: this.ext,
      ip: this.ip,
      ua: this.ua,
    };
  }
}
