import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "@/modules/auth/auth.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const header = request.headers.authorization as string | undefined;
    const queryToken =
      typeof request.query?.access_token === "string"
        ? request.query.access_token
        : undefined;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : queryToken;
    if (!token) throw new UnauthorizedException("Missing bearer token");

    try {
      request.user = await this.auth.resolveAuthUser(token);
      return true;
    } catch {
      throw new UnauthorizedException("Invalid bearer token");
    }
  }
}
