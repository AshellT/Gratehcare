import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js";

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private readonly admin: SupabaseClient | null;
  private readonly public: SupabaseClient | null;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>("SUPABASE_URL");
    const serviceKey = this.config.get<string>("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = this.config.get<string>("SUPABASE_ANON_KEY");

    this.admin = url && serviceKey ? createClient(url, serviceKey, { auth: { persistSession: false } }) : null;
    this.public = url && anonKey ? createClient(url, anonKey, { auth: { persistSession: false } }) : null;

    if (!this.admin) {
      this.logger.warn("SUPABASE_SERVICE_ROLE_KEY missing — admin auth operations disabled");
    }
  }

  get isConfigured() {
    return Boolean(this.config.get<string>("SUPABASE_URL"));
  }

  async getUserFromAccessToken(accessToken: string): Promise<SupabaseUser | null> {
    const client = this.admin ?? this.public;
    if (!client) return null;

    const { data, error } = await client.auth.getUser(accessToken);
    if (error || !data.user) return null;
    return data.user;
  }

  async signInWithPassword(email: string, password: string) {
    const client = this.public ?? this.admin;
    if (!client) throw new Error("Supabase client is not configured");

    return client.auth.signInWithPassword({ email: email.toLowerCase(), password });
  }

  async signUp(email: string, password: string, metadata: Record<string, unknown>) {
    const client = this.public ?? this.admin;
    if (!client) throw new Error("Supabase client is not configured");

    return client.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: { data: metadata },
    });
  }

  async createConfirmedUser(input: {
    email: string;
    password: string;
    metadata?: Record<string, unknown>;
  }) {
    if (!this.admin) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required to seed auth users");

    return this.admin.auth.admin.createUser({
      email: input.email.toLowerCase(),
      password: input.password,
      email_confirm: true,
      user_metadata: input.metadata ?? {},
    });
  }

  async updateUserMetadata(userId: string, metadata: Record<string, unknown>) {
    if (!this.admin) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");

    return this.admin.auth.admin.updateUserById(userId, { user_metadata: metadata });
  }
}
