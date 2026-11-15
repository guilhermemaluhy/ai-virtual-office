#!/usr/bin/env bash
# Fase 1 — prepara a VPS Ferenz (Ubuntu LTS) uma única vez. Rode do SEU computador:
#   DEPLOY_PUBKEY="$(cat ~/.ssh/id_ed25519.pub)" ssh root@74.1.74.208 \
#     "DEPLOY_PUBKEY='$DEPLOY_PUBKEY' bash -s" < deploy/setup-vps.sh
# O que faz: usuário "deploy" com a sua chave SSH, SSH só por chave (apenas se a chave
# foi informada), firewall (22/80/443), atualizações automáticas, Docker + Compose,
# pasta /opt/escritorio-ia.
set -euo pipefail

DEPLOY_USER="${DEPLOY_USER:-deploy}"
APP_DIR="/opt/escritorio-ia"

if [[ $EUID -ne 0 ]]; then echo "rode como root" >&2; exit 1; fi

echo "==> pacotes"
export DEBIAN_FRONTEND=noninteractive
apt-get update -q
apt-get upgrade -yq
apt-get install -yq ca-certificates curl gnupg ufw unattended-upgrades fail2ban git

echo "==> usuário ${DEPLOY_USER}"
if ! id "${DEPLOY_USER}" >/dev/null 2>&1; then
  adduser --disabled-password --gecos '' "${DEPLOY_USER}"
  usermod -aG sudo "${DEPLOY_USER}"
  echo "${DEPLOY_USER} ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/${DEPLOY_USER}"
fi
install -d -m 700 -o "${DEPLOY_USER}" -g "${DEPLOY_USER}" "/home/${DEPLOY_USER}/.ssh"
KEYS="/home/${DEPLOY_USER}/.ssh/authorized_keys"
touch "${KEYS}"
if [[ -n "${DEPLOY_PUBKEY:-}" ]]; then
  grep -qxF "${DEPLOY_PUBKEY}" "${KEYS}" || echo "${DEPLOY_PUBKEY}" >> "${KEYS}"
fi
if [[ -f /root/.ssh/authorized_keys ]]; then
  cat /root/.ssh/authorized_keys >> "${KEYS}"
fi
sort -u -o "${KEYS}" "${KEYS}"
chown "${DEPLOY_USER}:${DEPLOY_USER}" "${KEYS}"
chmod 600 "${KEYS}"

if [[ -s "${KEYS}" ]]; then
  echo "==> SSH só por chave (senha desligada)"
  cat > /etc/ssh/sshd_config.d/90-hardening.conf <<'SSH'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
MaxAuthTries 3
X11Forwarding no
SSH
  systemctl reload ssh || systemctl reload sshd
else
  echo "AVISO: nenhuma chave SSH informada (DEPLOY_PUBKEY vazio e root sem authorized_keys)."
  echo "       Login por senha continua ligado para você não ficar trancado fora."
  echo "       Gere uma chave (ssh-keygen -t ed25519) e rode o script de novo com DEPLOY_PUBKEY."
fi

echo "==> firewall"
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> atualizações automáticas"
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'APT'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
APT
systemctl enable --now unattended-upgrades fail2ban

echo "==> docker"
if ! command -v docker >/dev/null 2>&1; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -q
  apt-get install -yq docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi
usermod -aG docker "${DEPLOY_USER}"

echo "==> pasta da aplicação"
install -d -o "${DEPLOY_USER}" -g "${DEPLOY_USER}" "${APP_DIR}"

echo
echo "Pronto. Troque a senha de root agora (passwd) se ela já circulou por e-mail ou chat."
echo "Próximos passos (como ${DEPLOY_USER}, com ssh ${DEPLOY_USER}@IP):"
echo "  git clone https://github.com/guilhermemaluhy/ai-virtual-office ${APP_DIR}"
echo "  cp ${APP_DIR}/deploy/.env.example ${APP_DIR}/deploy/.env   # e preencha"
echo "  cd ${APP_DIR}/deploy && docker compose up -d --build"
