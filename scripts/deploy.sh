#!/usr/bin/env bash
set -euo pipefail

# Zenda Production Deployment Script
# Run on a fresh VPS (Ubuntu 22.04+) with root access.
#
# Prerequisites:
#   - DNS: zenda.bot A record pointing to this server's IP
#   - A .env file at /opt/zenda/.env with all required variables (see .env.example)
#
# Usage:
#   ./deploy.sh              # Full fresh deployment
#   ./deploy.sh update       # Pull latest and restart (no DB reset)
#   ./deploy.sh seed         # Run DB seed only

COMPOSE_FILE="docker-compose.prod.yml"
APP_DIR="/opt/zenda"
BRANCH="main"

echo "=== Zenda Production Deploy ==="
echo "Mode: ${1:-full}"
echo "Directory: $APP_DIR"
echo ""

# --- Install dependencies if missing ---
install_deps() {
  echo "[1/6] Installing dependencies..."
  if ! command -v docker &>/dev/null; then
    echo "  Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker
  fi

  if ! command -v caddy &>/dev/null; then
    echo "  Installing Caddy..."
    apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
    apt-get update
    apt-get install -y caddy
  fi

  echo "  Dependencies OK."
}

# --- Clone / update repo ---
setup_repo() {
  echo "[2/6] Setting up repository..."
  if [ -d "$APP_DIR/.git" ]; then
    echo "  Pulling latest from $BRANCH..."
    cd "$APP_DIR"
    git fetch origin "$BRANCH"
    git reset --hard "origin/$BRANCH"
  else
    echo "  Cloning repository..."
    mkdir -p "$APP_DIR"
    git clone -b "$BRANCH" "$(git -C "$(dirname "$0")/.." remote get-url origin 2>/dev/null || echo 'https://github.com/user/zenda.git')" "$APP_DIR"
    cd "$APP_DIR"
  fi
  echo "  Repository ready."
}

# --- Validate environment ---
validate_env() {
  echo "[3/6] Validating environment..."
  if [ ! -f "$APP_DIR/.env" ]; then
    echo "ERROR: No .env file found at $APP_DIR/.env"
    echo "Copy .env.example and fill in production values."
    exit 1
  fi

  # Source env for validation
  set -a; source "$APP_DIR/.env"; set +a

  local missing=0
  for var in POSTGRES_PASSWORD JWT_SECRET JWT_REFRESH_SECRET ADMIN_SECRET CORS_ORIGINS STRIPE_SECRET_KEY; do
    if [ -z "${!var:-}" ]; then
      echo "  MISSING: $var"
      missing=$((missing + 1))
    fi
  done

  if [ "$missing" -gt 0 ]; then
    echo "ERROR: $missing required environment variable(s) missing."
    exit 1
  fi

  # Warn if still using test Stripe keys
  if [[ "$STRIPE_SECRET_KEY" == sk_test_* ]]; then
    echo "  WARNING: Using Stripe TEST keys. Switch to live keys for production."
  fi

  echo "  Environment OK."
}

# --- Build and start services ---
start_services() {
  echo "[4/6] Building and starting services..."
  cd "$APP_DIR"

  # Build images
  docker compose -f "$COMPOSE_FILE" build --no-cache

  # Start services (API will auto-run migrations via Dockerfile CMD)
  docker compose -f "$COMPOSE_FILE" up -d

  echo "  Waiting for services to be healthy..."
  sleep 10

  # Verify API health
  local retries=0
  while [ $retries -lt 30 ]; do
    if curl -sf http://localhost:3001/health | grep -q '"ok"'; then
      echo "  API is healthy."
      return 0
    fi
    retries=$((retries + 1))
    sleep 2
  done

  echo "ERROR: API health check failed after 60 seconds."
  docker compose -f "$COMPOSE_FILE" logs api --tail=50
  exit 1
}

# --- Seed database ---
seed_db() {
  echo "[5/6] Seeding database..."
  cd "$APP_DIR"
  docker compose -f "$COMPOSE_FILE" exec api sh -c "cd packages/db && bun run src/seed/index.ts" || true
  echo "  Seed complete."
}

# --- Configure Caddy ---
setup_caddy() {
  echo "[6/6] Configuring Caddy..."
  if [ -f "$APP_DIR/config/Caddyfile" ]; then
    cp "$APP_DIR/config/Caddyfile" /etc/caddy/Caddyfile
    systemctl reload caddy || systemctl restart caddy
    echo "  Caddy configured and reloaded."
  else
    echo "  WARNING: No Caddyfile found at config/Caddyfile"
  fi
}

# --- Print summary ---
print_summary() {
  echo ""
  echo "=== Deployment Complete ==="
  echo ""
  echo "  API:      http://localhost:3001/health"
  echo "  Web:      http://localhost:3000"
  echo "  Public:   https://zenda.bot"
  echo ""
  echo "  Next steps:"
  echo "  1. Verify https://zenda.bot loads in a browser"
  echo "  2. Run 'bun run scripts/stripe-setup.ts' to create Stripe products"
  echo "  3. Set STRIPE_WEBHOOK_SECRET after configuring webhook in Stripe dashboard"
  echo "  4. Test the full signup flow end-to-end"
  echo ""
  echo "  Useful commands:"
  echo "  docker compose -f $COMPOSE_FILE logs -f api   # Follow API logs"
  echo "  docker compose -f $COMPOSE_FILE logs -f web   # Follow web logs"
  echo "  docker compose -f $COMPOSE_FILE restart api    # Restart API"
  echo ""
}

# --- Main ---
case "${1:-full}" in
  full)
    install_deps
    setup_repo
    validate_env
    start_services
    seed_db
    setup_caddy
    print_summary
    ;;
  update)
    validate_env
    setup_repo
    docker compose -f "$COMPOSE_FILE" build --no-cache
    docker compose -f "$COMPOSE_FILE" up -d
    echo "Update complete. API health: $(curl -sf http://localhost:3001/health || echo 'FAILED')"
    ;;
  seed)
    seed_db
    ;;
  *)
    echo "Usage: $0 [full|update|seed]"
    exit 1
    ;;
esac
