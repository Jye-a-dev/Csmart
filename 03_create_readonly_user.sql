-- 03_create_readonly_user.sql: Create dedicated read-only database user for AI Text-to-SQL
DO 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'csmart_readonly') THEN
    CREATE ROLE csmart_readonly WITH LOGIN PASSWORD 'csmart_ro_pass';
  END IF;
END
;

GRANT CONNECT ON DATABASE csmart_db TO csmart_readonly;
GRANT USAGE ON SCHEMA public TO csmart_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO csmart_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO csmart_readonly;
