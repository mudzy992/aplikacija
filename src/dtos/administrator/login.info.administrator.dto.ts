export class LoginInfoAdministratorDto {
  administratorid: number;
  username: string;
  token: string;

  constructor(id: number, un: string, jwt: string) {
    this.administratorid = id;
    this.username = un;
    this.token = jwt;
  }
}
