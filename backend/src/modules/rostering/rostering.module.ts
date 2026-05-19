import { Module } from "@nestjs/common";
import { RosteringController } from "./rostering.controller";
import { RosteringService } from "./rostering.service";

@Module({ controllers: [RosteringController], providers: [RosteringService] })
export class RosteringModule {}
