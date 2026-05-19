import { Injectable } from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { AuthUser } from "@/common/types/auth-user.type";
import { AssignRoleDto } from "./dto/assign-role.dto";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  PLATFORM_OWNER: ["*"],
  SUPER_ADMIN: ["manage:system", "manage:tenants"],
  PLATFORM_SUPPORT: ["view:tenants", "manage:support"],
  ORGANIZATION_OWNER: ["manage:organization"],
  OPERATIONS_ADMIN: ["manage:operations"],
  CARE_COORDINATOR: ["manage:care"],
  SUPPORT_WORKER: ["own:care-notes", "own:timesheets"],
  BILLING_OFFICER: ["manage:billing"],
  COMPLIANCE_OFFICER: ["manage:compliance"],
  FAMILY_USER: ["shared:family-portal"],
  PRACTITIONER: ["assigned:clinical"],
};

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  listPermissions() {
    return ROLE_PERMISSIONS;
  }

  async assign(dto: AssignRoleDto, user: AuthUser) {
    const item = await this.prisma.roleAssignment.create({
      data: { userId: dto.userId, role: dto.role, tenantId: dto.tenantId || user.tenantId },
    });
    await this.prisma.auditLog.create({
      data: { tenantId: user.tenantId, actorId: user.sub, action: "assign_role", resource: "roleAssignment", resourceId: item.id },
    });
    return item;
  }
}
