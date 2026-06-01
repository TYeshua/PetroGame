# 🚀 CI/CD — PetroGame Backend

Este guia explica como configurar o pipeline de deploy automático do backend.

## Como funciona

```
Você faz push → GitHub Actions faz o build → Imagem publicada no Docker Hub → Servidor faz pull da imagem nova
```

Cada vez que você fizer **push na branch `main`** e houver alterações em `project/backend/`, o GitHub Actions vai:
1. Fazer o build da imagem Docker
2. Publicar no Docker Hub com a tag `latest` e a tag do commit (`sha-xxxxxxx`)
3. Mostrar um resumo no GitHub

---

## ⚙️ Configuração inicial (apenas uma vez)

### 1. Criar conta no Docker Hub
Acesse [hub.docker.com](https://hub.docker.com) e crie uma conta gratuita.  
Anote seu **username** (ex: `thiagolima`).

### 2. Gerar um Access Token no Docker Hub
1. Acesse [hub.docker.com/settings/personal-access-tokens](https://hub.docker.com/settings/personal-access-tokens)
2. Clique em **Generate New Token**
3. Nome: `github-actions-petrogame`
4. Permissões: `Read & Write`
5. Copie o token gerado (**aparece só uma vez!**)

### 3. Adicionar Secrets no GitHub
No seu repositório GitHub:
1. Vá em **Settings → Secrets and variables → Actions**
2. Clique em **New repository secret** e adicione:

| Secret Name | Valor |
|---|---|
| `DOCKERHUB_USERNAME` | Seu username do Docker Hub (ex: `thiagolima`) |
| `DOCKERHUB_TOKEN` | O token gerado no passo anterior |

### 4. Atualizar o docker-compose.yml
No arquivo `project/backend/docker-compose.yml`, substitua `SEU_USUARIO` pelo seu username do Docker Hub:

```yaml
image: thiagolima/petrogame-backend:latest
```

### 5. Fazer push para o GitHub
```bash
git add .
git commit -m "feat: adiciona CI/CD com GitHub Actions"
git push origin main
```

O pipeline vai rodar automaticamente. Você pode acompanhar em:  
`GitHub → aba Actions`

---

## 🔄 Como fazer um novo deploy

1. Edite o código em `project/backend/`
2. Faça commit e push para `main`
3. Aguarde ~2-3 minutos o GitHub Actions terminar
4. No seu servidor/Portainer, clique em **"Pull latest"** ou **"Redeploy"**

> **Dica:** Você também pode rodar o workflow manualmente pela aba Actions → "Build & Push Docker Image" → "Run workflow"

---

## 🛟 Troubleshooting

**O workflow falhou com "unauthorized":**  
→ Verifique se os secrets `DOCKERHUB_USERNAME` e `DOCKERHUB_TOKEN` estão corretos no GitHub.

**A imagem não atualiza no servidor:**  
→ Certifique-se de que o docker-compose usa `:latest` e force o pull:
```bash
docker compose pull && docker compose up -d
```

**O workflow não está rodando:**  
→ O workflow só roda em push para a branch `main`. Verifique o nome da sua branch padrão.
