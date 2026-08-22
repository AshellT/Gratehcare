import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { SubscriptionGuard } from "@/common/guards/subscription.guard";
import { SubscriptionsModule } from "@/modules/subscriptions/subscriptions.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Global()
@Module({
  imports: [JwtModule.register({}), SubscriptionsModule],
  controllers: [AuthController],
  providers: [AuthService, SubscriptionGuard, JwtAuthGuard],
  exports: [AuthService, JwtModule, JwtAuthGuard, SubscriptionGuard],
})
export class AuthModule {}
