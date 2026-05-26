FROM python:3.10-slim

WORKDIR /usr/src/app

# Instalar dependências necessárias do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo o conteúdo do servidor
COPY . .

EXPOSE 4000

# Executar o principal.py como módulo em modo não buferizado para resolver as importações corretamente
CMD ["python", "-u", "-m", "codigo.principal"]
