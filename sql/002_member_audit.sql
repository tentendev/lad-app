CREATE TABLE IF NOT EXISTS lad_member_audit (
  id bigserial PRIMARY KEY,
  actor_id text NOT NULL,
  target_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('ban', 'unban')),
  reason text NOT NULL DEFAULT '',
  result text NOT NULL DEFAULT 'requested' CHECK (result IN ('requested', 'succeeded', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lad_member_audit_created_at_idx ON lad_member_audit (created_at DESC);
