import { Module, Global } from '@nestjs/common';
import { PgProvider, PG_CONNECTION } from './pg.provider';

@Global()
@Module({
  providers: [PgProvider],
  exports: [PG_CONNECTION],
})
export class DatabaseModule {}
