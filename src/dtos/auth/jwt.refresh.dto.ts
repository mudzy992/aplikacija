export class JwtRefreshDataDto {
  role: 'administrator' | 'user';
  id: number;
  identity: string;
  exp: number;
  ip: string;
  ua: string;
  
  toPlainObject() {
    return {
      role: this.role,
      id: this.id,
      identity: this.identity,
      ext: this.exp,
      ip: this.ip,
      ua: this.ua,
    };
  }
}
