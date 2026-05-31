import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { SubscriptionGuard } from "@/common/guards/subscription.guard";
import { SupabaseModule } from "@/supabase/supabase.module";
import { SubscriptionsModule } from "@/modules/subscriptions/subscriptions.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Global()
@Module({
  imports: [JwtModule.register({}), SupabaseModule, SubscriptionsModule],
  controllers: [AuthController],
  providers: [AuthService, SubscriptionGuard, JwtAuthGuard],
  exports: [AuthService, JwtModule, JwtAuthGuard],
})
export class AuthModule {}
