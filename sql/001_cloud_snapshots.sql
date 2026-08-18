CREATE TABLE IF NOT EXISTS lad_cloud_snapshots (
  user_id text PRIMARY KEY,
  data jsonb NOT NULL,
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE lad_cloud_snapshots IS 'Private local-first backup snapshots keyed by Clerk user ID.';
