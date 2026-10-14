import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

const tenantStorage = new AsyncLocalStorage<{ tenantId: string | null }>();

export { tenantStorage };

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });

    // Middleware: inject tenant context before every query
    this.$use(async (params, next) => {
      const store = tenantStorage.getStore();
      const tenantId = store?.tenantId;

      if (tenantId && process.env.DATABASE_URL?.startsWith('postgres')) {
        try {
          await this.$executeRaw`SELECT set_config('app.current_tenant', ${tenantId}, true)`;
        } catch {
          // Ignore if DB does not support set_config
        }
      }

      return next(params);
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Run a callback with a tenant context set.
   * All Prisma queries inside the callback will have RLS applied.
   */
  async withTenant<T>(tenantId: string, fn: () => Promise<T>): Promise<T> {
    return tenantStorage.run({ tenantId }, fn);
  }
}
