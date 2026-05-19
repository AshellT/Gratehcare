import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { RequestContextMiddleware } from "./common/middleware/request-context.middleware";
import { AiInsightsModule } from "./modules/ai-insights/ai-insights.module";
import { AuditLogsModule } from "./modules/audit-logs/audit-logs.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BillingModule } from "./modules/billing/billing.module";
import { CareNotesModule } from "./modules/care-notes/care-notes.module";
import { CarePlansModule } from "./modules/care-plans/care-plans.module";
import { ClientsModule } from "./modules/clients/clients.module";
import { ComplianceModule } from "./modules/compliance/compliance.module";
import { DocumentsModule } from "./modules/documents/documents.module";
import { IncidentsModule } from "./modules/incidents/incidents.module";
import { MedicationModule } from "./modules/medication/medication.module";
import { MessagesModule } from "./modules/messages/messages.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { RolesModule } from "./modules/roles/roles.module";
import { RosteringModule } from "./modules/rostering/rostering.module";
import { StaffModule } from "./modules/staff/staff.module";
import { TimesheetsModule } from "./modules/timesheets/timesheets.module";
import { UsersModule } from "./modules/users/users.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./redis/redis.module";
import { SupabaseModule } from "./supabase/supabase.module";
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    SupabaseModule,
    RedisModule,
    AuthModule,
    UsersModule,
    RolesModule,
    OrganizationsModule,
    StaffModule,
    ClientsModule,
    RosteringModule,
    TimesheetsModule,
    CarePlansModule,
    CareNotesModule,
    MedicationModule,
    IncidentsModule,
    BillingModule,
    ComplianceModule,
    DocumentsModule,
    MessagesModule,
    NotificationsModule,
    ReportsModule,
    AuditLogsModule,
    AiInsightsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes("*");
  }
}
