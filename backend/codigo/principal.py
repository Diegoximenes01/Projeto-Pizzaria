import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ariadne import load_schema_from_path, make_executable_schema
from ariadne.asgi import GraphQL

# Caminho para o schema.graphql
schema_path = os.path.join(os.path.dirname(__file__), "graphql_api", "schema.graphql")
type_defs = load_schema_from_path(schema_path)

# Importar resolvedores
from codigo.graphql_api.resolvedores import resolvedores
schema = make_executable_schema(type_defs, *resolvedores)

app = FastAPI(title="Furetti Cucina Backend")

# Habilitar CORS para o frontend (Vite React na porta 5173 e outros)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em desenvolvimento, permite todas as origens
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

is_production = os.getenv("NODE_ENV") == "production"

# Montar a rota GraphQL utilizando Ariadne ASGI
app.mount("/graphql", GraphQL(schema, debug=not is_production))

if __name__ == "__main__":
    import uvicorn
    # Executa a semeadura do banco de dados antes do servidor iniciar
    from codigo.semeador import semear
    try:
        semear()
    except Exception as e:
        print(f"Erro crítico ao rodar o semeador de banco de dados: {e}")
        
    port = int(os.getenv("PORT", 4000))
    print(f"🚀 Servidor rodando em http://localhost:{port}/graphql")
    # Usamos o caminho qualificado do módulo para permitir hot reload no desenvolvimento
    uvicorn.run("codigo.principal:app", host="0.0.0.0", port=port, reload=not is_production)
