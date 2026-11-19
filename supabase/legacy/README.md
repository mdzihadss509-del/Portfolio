# Legacy database migration archive

001_initial_schema.sql is retained for historical reference only. Do not run it, copy it into supabase/migrations, or use it for a database reset.

It is a stale, earlier schema snapshot. The connected production database records its baseline as migration 20261118154243_initial_portfolio_cms_schema, and subsequent applied migrations moved the role helper to the private schema and replaced old contact-message permissions.

The original SQL for that remote baseline is not currently present in the active local migration directory under its registered version. Do not run supabase db push, supabase db reset, or a migration repair based on this archive until the canonical baseline history has been restored and reconciled.
