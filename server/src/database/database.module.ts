import { Module, Global } from '@nestjs/common';
import { PgProvider, PgReadonlyProvider, PG_CONNECTION, PG_READONLY_CONNECTION } from './pg.provider';

@Global()
@Module({
  providers: [PgProvider, PgReadonlyProvider],
  exports: [PG_CONNECTION, PG_READONLY_CONNECTION],
})
export class DatabaseModule {}
