import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Administrator } from 'src/entities/administrator.entity';
import { AddAdministratorDto } from 'src/dtos/administrator/add.administrator.dto';
import { EditAdministratorDto } from 'src/dtos/administrator/edit.administrator.dto';
import { ApiResponse } from 'src/misc/api.response.class';
import { AdministratorService } from 'src/services/administrator/administrator.service';
import { AllowToRoles } from 'src/misc/allow.to.roles.descriptor';
import { RoleCheckedGuard } from 'src/misc/role.checker.guard';

@Controller('api/administrator') //kada ovdje dodamo prefiks, onda ne moramo dolje ispod, podrazumijeva se
export class AdministratorController {
  constructor(
    // Uključiti servise administratora
    private administratorService: AdministratorService,
  ) {}

  @Get() // ovdje sada idu metode, parametri
  /* @SetMetadata('allow_to_roles', ['administrator']) // a može i ova opcija */
  @UseGuards(RoleCheckedGuard)
  @AllowToRoles('administrator')
  getAll(): Promise<Administrator[]> {
    // Vraća isto što i servis, obećanje da će vratiti niz administratora
    return this.administratorService.getAll();
  }
  @Get(':id') // dodajemo link localhost:3000/api/administrator/4(:id)
  // Potrebno je uraditi anotaciju atributa (parametra) :id
  // tu anotaciju vršimo kao ispod getById(anotacija)
  // Param je specijalna anotacija koja kaže: Ovaj parametar (u zagradi)
  // uzmi iz linka (iznad), i stavi u konstantu administratorId: number
  @UseGuards(RoleCheckedGuard)
  @AllowToRoles('administrator')
  getById(
    @Param('id') administratorId: number,
  ): Promise<Administrator | ApiResponse> {
    // Vraća isto što i servis, obećanje da će vratiti jednog administratora
    return new Promise(async (resolve) => {
      const admin = await this.administratorService.getById(administratorId);
      if (admin === undefined) {
        resolve(new ApiResponse('error', -1002));
      }
      resolve(admin);
    });
  }
  // Dodavanje novog administratora
  // prvo što treba jeste da postoji ruta preko koje će se to izvršavati
  // i ta ruta je takođe važno da se znam kojim će se http metodom doprema
  // kada radimo dodavanje novih zapisa koristi se PUT metod
  // PUT metod se izvršava nad istom glavnom rutom

  @Post()
  // Otvori taj neki link localhost:3003/api/administrator/
  // i uzmi iz tijela tog linka data
  // u formatu koji je definisan u Dto (AddAdministratorDto)
  @UseGuards(RoleCheckedGuard)
  @AllowToRoles('administrator')
  add(@Body() data: AddAdministratorDto): Promise<Administrator | ApiResponse> {
    return this.administratorService.add(data);
  }

  @Patch(':id')
  @UseGuards(RoleCheckedGuard)
  @AllowToRoles('administrator')
  edit(
    @Param('id') id: number,
    @Body() data: EditAdministratorDto,
  ): Promise<Administrator | ApiResponse> {
    return this.administratorService.editById(id, data);
  }
}
