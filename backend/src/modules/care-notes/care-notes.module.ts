import { Module } from "@nestjs/common";
import { CareNotesController } from "./care-notes.controller";
import { CareNotesService } from "./care-notes.service";

@Module({ controllers: [CareNotesController], providers: [CareNotesService] })
export class CareNotesModule {}
