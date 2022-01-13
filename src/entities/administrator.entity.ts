import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import * as Validator from 'class-validator';

@Index('uq_administrator_username', ['username'], { unique: true })
@Entity('administrator')
export class Administrator {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'administrator_id',
    unsigned: true,
  })
  administratorId: number;

  @Column({ type: 'varchar', unique: true, length: 32 })
  @Validator.IsNotEmpty()
  @Validator.IsString()
  @Validator.Matches(/^[a-z][a-z0-9\.]{3,30}[a-z0-9]$/)
  username: string;

  @Column({ type: 'varchar', name: 'password_hash', length: 128 })
  @Validator.IsNotEmpty()
  @Validator.IsHash('sha512')
  passwordHash: string;
}

// Da bismo znali da je ova klasa entite moramo je anotirati
// Anotacija i isto ono što smo radili sa TypeOrmModulom u app.module.ts
// Ukucati na vrhu @Entity i tab, sve se samo doda
// Entiteti su u suštini klase koje objašnjavaju kako izgleda struktura tabele u bazi podataka
// Imena redova u tabeli ne može biti isto kao i ime u javascript (druge konvencije)
// Prvo polje u entitetima su primarni ključevi, baš kao u bazama
// anotiramo ga na sljedeći način @PrimaryGeneratedColumn({upisujemo atribute iz baze}) ,to je ona što ubacuje automacki ID,
// a da je PrimaryColumn ima primarni ključ ali mi zadajemo vrijednost
// ako se nekim slučajem anotacija entiteta i naziv red u bazi isto zovu ne treba se navoditi u objektima name
// nakon što smo definisali entite moramo ih dodati u entitete u app.module.ts
