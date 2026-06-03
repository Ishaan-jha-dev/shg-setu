#!/usr/bin/env bash
set -e

echo "Bootstrapping Monorepo..."
mkdir -p apps/api/src/modules/supabase
mkdir -p apps/mobile/lib/core/supabase
mkdir -p apps/admin/src/lib/supabase
mkdir -p packages/shared-types
mkdir -p supabase/migrations

echo "Creating package.json..."
cat << 'EOF' > package.json
{
  "name": "setu-shg-os",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  }
}
EOF

echo "Creating pnpm-workspace.yaml..."
cat << 'EOF' > pnpm-workspace.yaml
packages:
  - 'apps/api'
  - 'apps/admin'
  - 'packages/*'
EOF

echo "Creating supabase config..."
cat << 'EOF' > supabase/config.toml
project_id = "setu-shg-os-local"

[api]
port = 54321
host = "127.0.0.1"

[db]
port = 54322
host = "127.0.0.1"

[studio]
port = 54323
host = "127.0.0.1"

[auth]
site_url = "http://localhost:3000"
additional_redirect_urls = ["http://localhost:3000/dashboard"]
jwt_expiry = 3600
enable_signup = true

[auth.external.phone]
enabled = true

[storage.buckets.documents]
public = false
file_size_limit = "50MiB"
allowed_mime_types = ["application/pdf", "image/jpeg", "image/png"]
EOF

echo "Creating migration..."
cat << 'EOF' > supabase/migrations/20260601000000_init_schema.sql
CREATE TYPE kyc_status AS ENUM ('PENDING', 'VERIFIED', 'FAILED');

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  phone VARCHAR(15) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  status kyc_status DEFAULT 'PENDING'::kyc_status,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  ip_address INET,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone) VALUES (new.id, new.phone);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EOF

echo "Done."
