import { Controller, Get } from "@nestjs/common";
import { PublicService } from "./public.service";

@Controller("public")
export class PublicController {
  constructor(private readonly service: PublicService) {}

  @Get("marketing")
  getMarketing() {
    return this.service.getMarketingContent();
  }
}
