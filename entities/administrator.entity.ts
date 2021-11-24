import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()

// Anotacija iznad sve
export class Administrator {
  @PrimaryGeneratedColumn({
    name: 'administrator_id',
    type: 'int',
    unsigned: true,
  })
  administratorId: number;

  @Column({
    type: 'varchar',
    length: '32',
    unique: true,
  })
  username: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: '128',
  })
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
