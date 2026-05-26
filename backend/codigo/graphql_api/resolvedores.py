from ariadne import QueryType, MutationType, ObjectType
from codigo import banco

query = QueryType()
mutation = MutationType()

# --- RESOLVEDORES DE QUERY ---

@query.field("pizzas")
def resolve_pizzas(obj, info):
    return banco.buscar_pizzas()

@query.field("pizza")
def resolve_pizza(obj, info, id):
    return banco.buscar_pizza(id)

@query.field("pedidos")
def resolve_pedidos(obj, info):
    return banco.buscar_pedidos()

@query.field("pedido")
def resolve_pedido(obj, info, id):
    return banco.buscar_pedido(id)

@query.field("pedidosUsuario")
def resolve_pedidos_usuario(obj, info, usuarioId):
    return banco.buscar_pedidos_usuario(usuarioId)

@query.field("login")
def resolve_login(obj, info, cpf, senha):
    usuario = banco.buscar_usuario_por_cpf(cpf)
    if not usuario or usuario['senha'] != senha:
        raise Exception("CPF ou senha inválidos")
    return usuario

@query.field("verificarCpf")
def resolve_verificar_cpf(obj, info, cpf):
    usuario = banco.buscar_usuario_por_cpf(cpf)
    return usuario is not None

@query.field("verificarEmail")
def resolve_verificar_email(obj, info, email, usuarioId=None):
    usuario = banco.buscar_usuario_por_email(email, usuarioId)
    return usuario is not None

# --- RESOLVEDORES DE MUTATION ---

@mutation.field("cadastrarUsuario")
def resolve_cadastrar_usuario(obj, info, nome, cpf, email, telefone, senha, endereco):
    return banco.cadastrar_usuario(nome, cpf, email, telefone, senha, endereco)

@mutation.field("atualizarPerfil")
def resolve_atualizar_perfil(obj, info, usuarioId, nome, email, telefone):
    return banco.atualizar_perfil(usuarioId, nome, email, telefone)

@mutation.field("redefinirSenha")
def resolve_redefinir_senha(obj, info, cpf, novaSenha):
    return banco.redefinir_senha(cpf, novaSenha)

@mutation.field("atualizarEnderecos")
def resolve_atualizar_enderecos(obj, info, usuarioId, enderecos):
    return banco.atualizar_enderecos(usuarioId, enderecos)

@mutation.field("criarPedido")
def resolve_criar_pedido(obj, info, itens, usuarioId=None, tipoEntrega=None, taxaEntrega=None, tipoPagamento=None, trocoPara=None):
    return banco.criar_pedido(itens, usuarioId, tipoEntrega, taxaEntrega, tipoPagamento, trocoPara)

# --- RESOLVEDORES DE TIPOS ANINHADOS (RELACIONAMENTOS) ---

pedido_type = ObjectType("Pedido")

@pedido_type.field("itens")
def resolve_pedido_itens(obj, info):
    # 'obj' é o dicionário do Pedido. Buscamos todos os PedidoItem vinculados ao ID do pedido.
    return banco.buscar_itens_pedido(obj['id'])

@pedido_type.field("usuario")
def resolve_pedido_usuario(obj, info):
    # Buscamos o usuário correspondente ao 'usuarioId' do pedido (pode ser nulo se não logado)
    return banco.buscar_usuario(obj.get('usuarioId'))

pedido_item_type = ObjectType("PedidoItem")

@pedido_item_type.field("pizza")
def resolve_pedido_item_pizza(obj, info):
    # Buscamos a pizza correspondente ao 'pizzaId' do item
    return banco.buscar_pizza(obj['pizzaId'])

# Exportar a lista de tipos e resolvedores para compilar o executável GraphQL
resolvedores = [query, mutation, pedido_type, pedido_item_type]
