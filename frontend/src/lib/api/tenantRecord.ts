/** Maps UI form fields to backend CreateTenantRecordDto shape. */
export type TenantRecordInput = {
  title: string;
  description?: string;
  status?: string;
  severity?: string;
  metadata?: Record<string, unknown>;
};

export function toTenantRecord(
  title: string,
  description?: string,
  metadata?: Record<string, unknown>,
  extra?: Partial<TenantRecordInput>,
): TenantRecordInput & { tenantId?: string } {
  return {
    title,
    description,
    metadata,
    ...extra,
  };
}
