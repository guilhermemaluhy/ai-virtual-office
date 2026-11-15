# Fase 1 — configura a VPS Ferenz a partir do SEU Windows (PowerShell).
# Equivale ao docs/DEPLOY.md §1 a §3. Não contém segredos: a senha de root
# é digitada nos prompts do ssh; o .env é preenchido na VPS, nunca no Git.
# Uso:  powershell -ExecutionPolicy Bypass -File deploy\setup-from-windows.ps1
$ErrorActionPreference = 'Stop'
$Ip     = '74.1.74.208'
$Branch = 'claude/youthful-shannon-nrcjyc'   # main ainda não tem deploy/
$Raw    = "https://raw.githubusercontent.com/guilhermemaluhy/ai-virtual-office/$Branch/deploy/setup-vps.sh"
$Key    = Join-Path $env:USERPROFILE '.ssh\id_ed25519'

# 1) chave SSH (só se não existir)
if (-not (Test-Path "$Key.pub")) {
  New-Item -ItemType Directory -Force (Split-Path $Key) | Out-Null
  ssh-keygen -t ed25519 -f $Key -N '""' -C 'deploy-escritorio-ia'
}
$Pub = (Get-Content "$Key.pub" -Raw).Trim()

# 2) preparo da VPS (pede a senha de root UMA vez). O script é baixado na própria
#    VPS para evitar quebra de linha CRLF do Windows ao mandar por stdin.
ssh "root@$Ip" "curl -fsSL '$Raw' -o /root/setup-vps.sh && DEPLOY_PUBKEY='$Pub' bash /root/setup-vps.sh"

# 2b) conferir que a chave entrou e trocar a senha de root (digite a nova 2x)
ssh "deploy@$Ip" 'echo "login por chave OK: $(whoami)@$(hostname)"'
ssh -t "deploy@$Ip" 'sudo passwd root'

# 3) clonar e criar o .env (preencha ACME_EMAIL, DATABASE_URL e SUPABASE_SERVICE_ROLE_KEY no nano)
ssh "deploy@$Ip" "git clone --branch $Branch https://github.com/guilhermemaluhy/ai-virtual-office /opt/escritorio-ia && cd /opt/escritorio-ia/deploy && cp .env.example .env && sed -i 's/^DOMAIN=.*/DOMAIN=74-1-74-208.sslip.io/' .env && echo '.env criado'"
ssh -t "deploy@$Ip" 'nano /opt/escritorio-ia/deploy/.env'

# 4) subir e conferir
ssh -t "deploy@$Ip" 'cd /opt/escritorio-ia/deploy && docker compose up -d --build && docker compose ps'
Write-Host "Teste: https://74-1-74-208.sslip.io  e  https://74-1-74-208.sslip.io/api/health"
