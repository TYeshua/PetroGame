# ── Imagem base leve com Python 3.12 ──────────────────────────────────────────
FROM python:3.12-slim

# Variáveis de ambiente para Python (sem buffer de saída e sem .pyc)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Diretório de trabalho dentro do container
WORKDIR /app

# Instala curl (usado no healthcheck) e limpa cache do apt
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copia e instala dependências primeiro (aproveita cache de camadas)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante do código
COPY . .

# Expõe a porta configurada no .env (padrão: 3000)
EXPOSE 3000

# Inicia o Uvicorn com reload para desenvolvimento local
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000", "--reload"]
