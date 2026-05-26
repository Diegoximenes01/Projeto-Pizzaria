import os
import time
import uuid
import psycopg2
from urllib.parse import urlparse

def obter_conexao():
    db_url = os.getenv("DATABASE_URL", "postgresql://pizza_user:pizza_pass@localhost:5433/pizza_db")
    result = urlparse(db_url)
    
    # Adicionar retry em caso de inicialização lenta do Postgres
    tentativas = 10
    while tentativas > 0:
        try:
            conn = psycopg2.connect(
                database=result.path[1:],
                user=result.username,
                password=result.password,
                host=result.hostname,
                port=result.port
            )
            return conn
        except Exception as e:
            print(f"Aguardando banco de dados... Tentativas restantes: {tentativas}. Erro: {e}")
            time.sleep(3)
            tentativas -= 1
            
    raise Exception("Não foi possível conectar ao banco de dados PostgreSQL.")

def semear():
    print("Iniciando semeadura do banco de dados...")
    conn = obter_conexao()
    cursor = conn.cursor()

    try:
        # Criar tabelas
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS "Usuario" (
                "id" VARCHAR(36) PRIMARY KEY,
                "nome" VARCHAR(255) NOT NULL,
                "cpf" VARCHAR(11) UNIQUE NOT NULL,
                "email" VARCHAR(255) UNIQUE,
                "telefone" VARCHAR(20),
                "senha" VARCHAR(255) NOT NULL,
                "endereco" TEXT NOT NULL,
                "enderecos" TEXT[] DEFAULT '{}'::TEXT[]
            );
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS "Pizza" (
                "id" VARCHAR(36) PRIMARY KEY,
                "nome" VARCHAR(255) NOT NULL,
                "preco" DOUBLE PRECISION NOT NULL,
                "ingredientes" TEXT[] NOT NULL,
                "categoria" VARCHAR(50) DEFAULT 'Tradicional' NOT NULL
            );
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS "Pedido" (
                "id" VARCHAR(36) PRIMARY KEY,
                "total" DOUBLE PRECISION NOT NULL,
                "status" VARCHAR(50) NOT NULL,
                "tipoEntrega" VARCHAR(50) DEFAULT 'Retirada' NOT NULL,
                "taxaEntrega" DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
                "tipoPagamento" VARCHAR(100) DEFAULT 'Dinheiro' NOT NULL,
                "trocoPara" DOUBLE PRECISION,
                "usuarioId" VARCHAR(36) REFERENCES "Usuario"("id")
            );
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS "PedidoItem" (
                "id" VARCHAR(36) PRIMARY KEY,
                "quantidade" INTEGER NOT NULL,
                "pizzaId" VARCHAR(36) NOT NULL REFERENCES "Pizza"("id"),
                "pedidoId" VARCHAR(36) NOT NULL REFERENCES "Pedido"("id") ON DELETE CASCADE
            );
        ''')

        conn.commit()

        # Semeando dados iniciais de pizzas e bebidas
        itens_cardapio = [
            # TRADICIONAIS
            ('Mussarela', 39.9, ['Molho de tomate', 'Mussarela abundante', 'Orégano'], 'Tradicional'),
            ('Calabresa', 42.9, ['Molho de tomate', 'Mussarela', 'Calabresa fatiada', 'Cebola'], 'Tradicional'),
            ('Marguerita', 44.9, ['Molho de tomate', 'Mussarela', 'Manjericão fresco', 'Tomate'], 'Tradicional'),
            ('Portuguesa', 48.9, ['Molho de tomate', 'Mussarela', 'Presunto', 'Ovo', 'Cebola', 'Ervilha'], 'Tradicional'),
            # ESPECIAIS
            ('Pepperoni com Catupiry', 58.9, ['Molho de tomate', 'Mussarela', 'Pepperoni', 'Catupiry original'], 'Especial'),
            ('4 Queijos', 56.9, ['Molho de tomate', 'Mussarela', 'Provolone', 'Parmesão', 'Gorgonzola'], 'Especial'),
            ('Frango com Catupiry', 55.9, ['Molho de tomate', 'Mussarela', 'Frango desfiado temperado', 'Catupiry'], 'Especial'),
            ('Carne de Sol com Queijo Coalho', 64.9, ['Molho de tomate', 'Mussarela', 'Carne de sol desfiada', 'Queijo coalho', 'Cebola roxa'], 'Especial'),
            # BEBIDAS (Refrigerantes R$ 6.00, Água R$ 4.00/4.50)
            ('Coca-Cola Lata', 6.0, ['Lata de 350ml'], 'Bebida'),
            ('Coca-Cola Zero Lata', 6.0, ['Lata de 350ml'], 'Bebida'),
            ('Pepsi Lata', 6.0, ['Lata de 350ml'], 'Bebida'),
            ('Pepsi Black Lata', 6.0, ['Lata de 350ml'], 'Bebida'),
            ('Guaraná Antarctica Lata', 6.0, ['Lata de 350ml'], 'Bebida'),
            ('Guaraná Antarctica Zero Lata', 6.0, ['Lata de 350ml'], 'Bebida'),
            ('Água Mineral sem Gás', 4.0, ['Garrafa de 500ml'], 'Bebida'),
            ('Água Mineral com Gás', 4.5, ['Garrafa de 500ml'], 'Bebida')
        ]

        inseridos = 0
        atualizados = 0
        for nome, preco, ingredientes, categoria in itens_cardapio:
            cursor.execute('SELECT COUNT(*) FROM "Pizza" WHERE "nome" = %s', (nome,))
            if cursor.fetchone()[0] == 0:
                p_id = str(uuid.uuid4())
                cursor.execute(
                    'INSERT INTO "Pizza" ("id", "nome", "preco", "ingredientes", "categoria") VALUES (%s, %s, %s, %s, %s)',
                    (p_id, nome, preco, ingredientes, categoria)
                )
                inseridos += 1
            else:
                cursor.execute(
                    'UPDATE "Pizza" SET "preco" = %s, "ingredientes" = %s, "categoria" = %s WHERE "nome" = %s',
                    (preco, ingredientes, categoria, nome)
                )
                atualizados += 1
        
        if inseridos > 0 or atualizados > 0:
            conn.commit()
            print(f"Semeadura concluída! {inseridos} novos itens adicionados, {atualizados} atualizados.")
        else:
            print("Nenhuma alteração necessária no cardápio.")

    except Exception as e:
        conn.rollback()
        print(f"Erro ao semear o banco: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    semear()
