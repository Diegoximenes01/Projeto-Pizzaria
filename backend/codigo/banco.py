import os
import uuid
import psycopg2
from urllib.parse import urlparse

def obter_conexao():
    db_url = os.getenv("DATABASE_URL", "postgresql://pizza_user:pizza_pass@localhost:5433/pizza_db")
    result = urlparse(db_url)
    return psycopg2.connect(
        database=result.path[1:],
        user=result.username,
        password=result.password,
        host=result.hostname,
        port=result.port
    )

def row_to_dict(cursor, row):
    if row is None:
        return None
    return {desc[0]: val for desc, val in zip(cursor.description, row)}

def rows_to_list(cursor, rows):
    return [row_to_dict(cursor, r) for r in rows]

# --- QUERIES DE PIZZA ---

def buscar_pizzas():
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM "Pizza"')
        return rows_to_list(cursor, cursor.fetchall())
    finally:
        cursor.close()
        conn.close()

def buscar_pizza(pizza_id):
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM "Pizza" WHERE "id" = %s', (pizza_id,))
        return row_to_dict(cursor, cursor.fetchone())
    finally:
        cursor.close()
        conn.close()

# --- QUERIES DE USUARIO ---

def buscar_usuario(usuario_id):
    if not usuario_id:
        return None
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM "Usuario" WHERE "id" = %s', (usuario_id,))
        return row_to_dict(cursor, cursor.fetchone())
    finally:
        cursor.close()
        conn.close()

def buscar_usuario_por_cpf(cpf):
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM "Usuario" WHERE "cpf" = %s', (cpf,))
        return row_to_dict(cursor, cursor.fetchone())
    finally:
        cursor.close()
        conn.close()

def buscar_usuario_por_email(email, excluir_usuario_id=None):
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        if excluir_usuario_id:
            cursor.execute('SELECT * FROM "Usuario" WHERE "email" = %s AND "id" != %s', (email, excluir_usuario_id))
        else:
            cursor.execute('SELECT * FROM "Usuario" WHERE "email" = %s', (email,))
        return row_to_dict(cursor, cursor.fetchone())
    finally:
        cursor.close()
        conn.close()

# --- MUTATIONS DE USUARIO ---

def cadastrar_usuario(nome, cpf, email, telefone, senha, endereco):
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        u_id = str(uuid.uuid4())
        # Guarda a lista de endereços contendo o endereço inicial
        enderecos = [endereco]
        cursor.execute(
            'INSERT INTO "Usuario" ("id", "nome", "cpf", "email", "telefone", "senha", "endereco", "enderecos") VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING *',
            (u_id, nome, cpf, email, telefone, senha, endereco, enderecos)
        )
        usuario = row_to_dict(cursor, cursor.fetchone())
        conn.commit()
        return usuario
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

def redefinir_senha(cpf, nova_senha):
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute('UPDATE "Usuario" SET "senha" = %s WHERE "cpf" = %s RETURNING *', (nova_senha, cpf))
        usuario = row_to_dict(cursor, cursor.fetchone())
        if not usuario:
            raise Exception("Usuário com este CPF não foi cadastrado")
        conn.commit()
        return usuario
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

def atualizar_enderecos(usuario_id, list_enderecos):
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        # Busca usuário atual
        cursor.execute('SELECT "endereco" FROM "Usuario" WHERE "id" = %s', (usuario_id,))
        res = cursor.fetchone()
        if not res:
            raise Exception("Usuário não encontrado")
        
        endereco_atual = res[0]
        # Pega o último endereço da lista ou mantém o atual
        novo_endereco = list_enderecos[-1] if list_enderecos else endereco_atual

        cursor.execute(
            'UPDATE "Usuario" SET "enderecos" = %s, "endereco" = %s WHERE "id" = %s RETURNING *',
            (list_enderecos, novo_endereco, usuario_id)
        )
        usuario = row_to_dict(cursor, cursor.fetchone())
        conn.commit()
        return usuario
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

def atualizar_perfil(usuario_id, nome, email, telefone):
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute(
            'UPDATE "Usuario" SET "nome" = %s, "email" = %s, "telefone" = %s WHERE "id" = %s RETURNING *',
            (nome, email, telefone, usuario_id)
        )
        usuario = row_to_dict(cursor, cursor.fetchone())
        if not usuario:
            raise Exception("Usuário não encontrado")
        conn.commit()
        return usuario
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

def salvar_cartao(usuario_id, cartao_ultimos_digitos, cartao_tipo):
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute(
            'UPDATE "Usuario" SET "cartaoUltimosDigitos" = %s, "cartaoTipo" = %s WHERE "id" = %s RETURNING *',
            (cartao_ultimos_digitos, cartao_tipo, usuario_id)
        )
        usuario = row_to_dict(cursor, cursor.fetchone())
        if not usuario:
            raise Exception("Usuário não encontrado")
        conn.commit()
        return usuario
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

# --- QUERIES DE PEDIDO ---

def buscar_pedidos():
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM "Pedido"')
        return rows_to_list(cursor, cursor.fetchall())
    finally:
        cursor.close()
        conn.close()

def buscar_pedido(pedido_id):
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM "Pedido" WHERE "id" = %s', (pedido_id,))
        return row_to_dict(cursor, cursor.fetchone())
    finally:
        cursor.close()
        conn.close()

def buscar_pedidos_usuario(usuario_id):
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM "Pedido" WHERE "usuarioId" = %s', (usuario_id,))
        return rows_to_list(cursor, cursor.fetchall())
    finally:
        cursor.close()
        conn.close()

def buscar_itens_pedido(pedido_id):
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT * FROM "PedidoItem" WHERE "pedidoId" = %s', (pedido_id,))
        return rows_to_list(cursor, cursor.fetchall())
    finally:
        cursor.close()
        conn.close()

# --- MUTATIONS DE PEDIDO ---

def criar_pedido(itens, usuario_id, tipo_entrega, taxa_entrega, tipo_pagamento, troco_para):
    conn = obter_conexao()
    cursor = conn.cursor()
    try:
        # 1. Calcular o total com base nos preços reais do banco
        total_itens = 0.0
        pizzas_validadas = []
        
        for item in itens:
            pizza_id = item['pizzaId']
            quantidade = item['quantidade']
            
            cursor.execute('SELECT "preco" FROM "Pizza" WHERE "id" = %s', (pizza_id,))
            res = cursor.fetchone()
            if not res:
                raise Exception("Pizza não encontrada")
            
            preco = res[0]
            total_itens += preco * quantidade
            pizzas_validadas.append((pizza_id, quantidade))
            
        taxa = taxa_entrega if taxa_entrega is not None else 0.0
        total_final = round(total_itens + taxa, 2)
        
        # 2. Criar o pedido
        pedido_id = str(uuid.uuid4())
        status = 'Recebido'
        tipo_ent = tipo_entrega if tipo_entrega else 'Retirada'
        tipo_pag = tipo_pagamento if tipo_pagamento else 'Dinheiro'
        
        cursor.execute(
            'INSERT INTO "Pedido" ("id", "total", "status", "tipoEntrega", "taxaEntrega", "tipoPagamento", "trocoPara", "usuarioId") VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING *',
            (pedido_id, total_final, status, tipo_ent, taxa, tipo_pag, troco_para, usuario_id)
        )
        pedido = row_to_dict(cursor, cursor.fetchone())
        
        # 3. Criar os itens do pedido
        for pizza_id, quantidade in pizzas_validadas:
            item_id = str(uuid.uuid4())
            cursor.execute(
                'INSERT INTO "PedidoItem" ("id", "quantidade", "pizzaId", "pedidoId") VALUES (%s, %s, %s, %s)',
                (item_id, quantidade, pizza_id, pedido_id)
            )
            
        conn.commit()
        return pedido
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()
