import { careApi } from "./care";
import { clientsApi } from "./clients";
import { incidentsApi } from "./incidents";
import { medicationApi } from "./medication";
import { rosteringApi } from "./rostering";
import { staffApi } from "./staff";
import { timesheetsApi } from "./timesheets";
import { toTenantRecord } from "./tenantRecord";

export type ModuleForm = {
  primary: string;
  secondary: string;
  owner: string;
  status: string;
  priority: string;
  date: string;
  location: string;
  detail: string;
};

export async function createModuleRecord(moduleKey: string, form: ModuleForm) {
  switch (moduleKey) {
    case "staff":
      return staffApi.create(
        toTenantRecord(form.primary, form.detail, { role: form.secondary }) as any,
      );
    case "clients":
      return clientsApi.create(
        toTenantRecord(form.primary, form.secondary, { coordinator: form.owner }) as any,
      );
    case "rostering":
    case "open-shifts":
      return rosteringApi.createShift(
        toTenantRecord(form.primary, form.detail, { location: form.location }) as any,
      );
    case "timesheets":
      return timesheetsApi.create(
        toTenantRecord(form.primary, form.detail, {
          staffId: form.owner,
          hours: Number(form.secondary) || 0,
        }) as any,
      );
    case "care-plans":
      return careApi.createPlan(
        toTenantRecord(`${form.primary} care plan`, form.detail) as any,
      );
    case "care-notes":
      return careApi.createNote(
        toTenantRecord(form.primary, form.detail, { workerName: form.owner }) as any,
      );
    case "medication":
      return medicationApi.create(toTenantRecord(form.primary, form.detail));
    case "incidents":
      return incidentsApi.create(
        toTenantRecord(form.primary, form.detail, {
          severity: form.priority.toUpperCase(),
        }) as any,
      );
    default:
      throw new Error(`Create is not supported for module: ${moduleKey}`);
  }
}
