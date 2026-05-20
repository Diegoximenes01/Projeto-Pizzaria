import { useContext, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';

const OBTER_PEDIDOS_USUARIO = gql`
  query ObterPedidosUsuario($usuarioId: ID!) {
    pedidosUsuario(usuarioId: $usuarioId) {
      id
      total
      status
      tipoEntrega
      taxaEntrega
      tipoPagamento
      trocoPara
      itens {
        quantidade
        pizza {
          id
          nome
          preco
        }
      }
    }
  }
`;

export default function OrdersHistory() {
  const { user } = useContext(StoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const { data, loading, error } = useQuery(OBTER_PEDIDOS_USUARIO, {
    variables: { usuarioId: user.id },
    fetchPolicy: 'cache-and-network'
  });

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 48, fontSize: 18, color: '#666' }}>Carregando histórico de pedidos...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 48, color: 'var(--primary)' }}>
        Erro ao carregar pedidos: {error.message}
      </div>
    );
  }

  const pedidos = data?.pedidosUsuario || [];

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', paddingBottom: 48 }}>
      <h2 className="section-title" style={{ marginBottom: 24 }}>Meu Histórico de Pedidos</h2>

      {pedidos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: '#fff', borderRadius: 12, border: '1px solid #eee' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍕</div>
          <h3 style={{ fontSize: 20, color: 'var(--text-main)', marginBottom: 12, fontWeight: 700 }}>
            Você nunca realizou um pedido antes!
          </h3>
          <p style={{ fontSize: 15, color: '#666', marginBottom: 24, maxWidth: 450, margin: '0 auto 24px', lineHeight: '1.5' }}>
            Que tal experimentar nossas deliciosas pizzas artesanais? Faça o seu primeiro pedido hoje mesmo e aproveite o melhor sabor!
          </p>
          <button className="add-btn" onClick={() => navigate('/')} style={{ margin: '0 auto', display: 'inline-flex', justifyContent: 'center' }}>
            Ir para o Cardápio
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {pedidos.map((pedido: any) => {
            const numItens = pedido.itens.reduce((acc: number, curr: any) => acc + curr.quantidade, 0);
            return (
              <div 
                key={pedido.id} 
                style={{
                  background: '#fff', 
                  borderRadius: 12, 
                  border: '1px solid #eee', 
                  padding: 24, 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                {/* Header do Pedido */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: 16, marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 14, color: '#999', display: 'block', marginBottom: 4 }}>Código do pedido</span>
                    <strong style={{ fontSize: 16, color: 'var(--text-main)' }}>#{pedido.id.slice(0, 8).toUpperCase()}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span 
                      style={{
                        padding: '6px 12px', 
                        borderRadius: 20, 
                        fontSize: 12, 
                        fontWeight: 600, 
                        backgroundColor: '#e6f4ea', 
                        color: '#137333'
                      }}
                    >
                      {pedido.status}
                    </span>
                  </div>
                </div>

                {/* Itens do Pedido */}
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>Itens ({numItens})</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pedido.itens.map((item: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-main)' }}>
                        <span>{item.quantidade}x {item.pizza.nome}</span>
                        <span style={{ color: '#666' }}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.pizza.preco * item.quantidade)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detalhes Adicionais */}
                <div style={{ background: '#f9f9f9', padding: 12, borderRadius: 8, fontSize: 13, color: '#666', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div>
                    <strong>Entrega:</strong> {pedido.tipoEntrega} {pedido.tipoEntrega === 'Entrega' && `(Taxa: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.taxaEntrega)})`}
                  </div>
                  <div>
                    <strong>Pagamento:</strong> {pedido.tipoPagamento}
                  </div>
                  {pedido.trocoPara && (
                    <div>
                      <strong>Troco para:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.trocoPara)} (Troco a receber: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.trocoPara - pedido.total)})
                    </div>
                  )}
                </div>

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Total Pago</span>
                  <strong style={{ fontSize: 18, color: 'var(--primary)' }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.total)}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
