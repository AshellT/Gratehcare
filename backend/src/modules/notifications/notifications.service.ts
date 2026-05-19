import { TenantCrudService } from "@/common/services/tenant-crud.service";
import { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Observable, Subject } from "rxjs";
import { filter } from "rxjs/operators";

export interface NotificationEvent {
  id: string;
  tenantId: string;
  userId?: string;
  type:
    | "shift_update"
    | "incident_alert"
    | "missed_visit"
    | "compliance_alert"
    | "message"
    | "general";
  title: string;
  body: string;
  severity: "critical" | "warning" | "info" | "success";
  createdAt: string;
}

@Injectable()
export class NotificationsService extends TenantCrudService {
  /** Shared event bus – every emitted event is broadcast to SSE subscribers */
  private readonly eventBus = new Subject<NotificationEvent>();

  constructor(prisma: PrismaService) {
    super(prisma, "notification", {
      createData: (dto, tenantId) => ({
        tenantId,
        userId: dto.metadata?.userId as string | undefined,
        title: dto.title,
        body: dto.description,
      }),
      updateData: (dto) => ({ title: dto.title, body: dto.description }),
      archiveData: { readAt: new Date() },
      defaultOrderBy: { createdAt: "desc" },
    });
  }

  /**
   * Push a live notification into the SSE stream and persist it.
   * Call this from other services (incidents, rostering, compliance, etc.)
   */
  push(event: Omit<NotificationEvent, "createdAt">): void {
    this.eventBus.next({ ...event, createdAt: new Date().toISOString() });
  }

  /**
   * Returns an Observable that emits events scoped to the given tenantId.
   * Consumed by the SSE controller endpoint.
   */
  streamForTenant(tenantId: string): Observable<NotificationEvent> {
    return this.eventBus
      .asObservable()
      .pipe(filter((e) => e.tenantId === tenantId));
  }
}
