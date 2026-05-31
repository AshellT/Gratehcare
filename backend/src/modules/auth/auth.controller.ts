import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { OAuthCompleteDto } from "./dto/oauth-complete.dto";
import { RegisterDto } from "./dto/register.dto";
import type { Request } from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  /** Sync Supabase OAuth user into Prisma and return session payload. */
  @Post("oauth/complete")
  @UseGuards(JwtAuthGuard)
  oauthComplete(@Req() req: Request, @Body() dto: OAuthCompleteDto) {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : "";
    return this.auth.completeOAuthSession(token, dto);
  }
}
