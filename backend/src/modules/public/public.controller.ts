import { Body, Controller, Get, Post } from "@nestjs/common";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { PublicService } from "./public.service";

@Controller("public")
export class PublicController {
  constructor(private readonly service: PublicService) {}

  @Get("marketing")
  getMarketing() {
    return this.service.getMarketingContent();
  }

  @Post("leads")
  createLead(@Body() dto: CreateLeadDto) {
    return this.service.createLead(dto);
  }
}
