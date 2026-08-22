import { Body, Controller, Get, HttpCode, Post, ServiceUnavailableException } from "@nestjs/common";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { PublicService } from "./public.service";

@Controller("public")
export class PublicController {
  constructor(private readonly service: PublicService) {}

  /** Unauthenticated liveness probe */
  @Get("health")
  @HttpCode(200)
  async health() {
    const result = await this.service.getHealth();
    if (result.db !== "connected") {
      throw new ServiceUnavailableException(result);
    }
    return result;
  }

  @Get("marketing")
  getMarketing() {
    return this.service.getMarketingContent();
  }

  @Post("leads")
  createLead(@Body() dto: CreateLeadDto) {
    return this.service.createLead(dto);
  }
}
