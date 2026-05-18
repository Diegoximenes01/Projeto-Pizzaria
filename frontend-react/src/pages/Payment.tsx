import { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';

const CRIAR_PEDIDO = gql`
  mutation FazerPedido(
    $itens: [PedidoItemInput!]!
    $usuarioId: ID
    $tipoEntrega: String
    $taxaEntrega: Float
    $tipoPagamento: String
    $trocoPara: Float
  ) {
    criarPedido(
      itens: $itens
      usuarioId: $usuarioId
      tipoEntrega: $tipoEntrega
      taxaEntrega: $taxaEntrega
      tipoPagamento: $tipoPagamento
      trocoPara: $trocoPara
    ) {
      id
      total
    }
  }
`;

export default function Payment() {
  const { cart, user, orderDetails, setOrderDetails, clearStore } = useContext(StoreContext);
  const navigate = useNavigate();
  const [criarPedido, { loading }] = useMutation(CRIAR_PEDIDO);

  if (!user || cart.length === 0) {
    navigate('/');
    return null;
  }

  const subtotal = cart.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const totalFinal = subtotal + orderDetails.taxaEntrega;

  const handleSelect = (tipo: 'Cartão' | 'Pix' | 'Dinheiro') => {
    setOrderDetails({ ...orderDetails, tipoPagamento: tipo, trocoPara: undefined });
  };

  const confirmarPedido = async () => {
    try {
      await criarPedido({
        variables: {
          itens: cart.map(i => ({ pizzaId: i.pizzaId, quantidade: i.quantidade })),
          usuarioId: user.id,
          tipoEntrega: orderDetails.tipoEntrega,
          taxaEntrega: orderDetails.taxaEntrega,
          tipoPagamento: orderDetails.tipoPagamento,
          trocoPara: orderDetails.trocoPara ? Number(orderDetails.trocoPara) : undefined
        }
      });
      // Guarda o tempo para a proxima tela usando state da rota ou apenas passando a frente via session
      sessionStorage.setItem('lastOrderTime', orderDetails.tipoEntrega === 'Entrega' ? '40 min' : '15 min');
      clearStore();
      navigate('/sucesso');
    } catch (e: any) {
      alert('Erro ao fechar pedido: ' + e.message);
    }
  };

  return (
    <div style={{maxWidth: 600, margin: '0 auto'}}>
      <h2 className="section-title">Forma de Pagamento</h2>

      <div style={{display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32}}>
        <div onClick={() => handleSelect('Pix')} style={{...boxStyle, borderColor: orderDetails.tipoPagamento === 'Pix' ? 'var(--primary)' : '#eee'}}>
          <div style={{fontWeight: 600, fontSize: 18}}>Pix</div>
          {orderDetails.tipoPagamento === 'Pix' && (
            <div style={{marginTop: 16, textAlign: 'center'}}>
              <p style={{marginBottom: 8, fontSize: 14}}>Escaneie o QRCode abaixo com o app do seu banco:</p>
              <img src="/qrcode.png" alt="QRCode Pix" style={{width: 200, height: 200, borderRadius: 8, border: '1px solid #ccc'}} />
            </div>
          )}
        </div>

        <div onClick={() => handleSelect('Cartão')} style={{...boxStyle, borderColor: orderDetails.tipoPagamento === 'Cartão' ? 'var(--primary)' : '#eee'}}>
          <div style={{fontWeight: 600, fontSize: 18}}>Cartão de Crédito/Débito</div>
          {orderDetails.tipoPagamento === 'Cartão' && <p style={{color: '#777', fontSize: 14, marginTop: 4}}>Pagamento na entrega.</p>}
        </div>

        <div onClick={() => handleSelect('Dinheiro')} style={{...boxStyle, borderColor: orderDetails.tipoPagamento === 'Dinheiro' ? 'var(--primary)' : '#eee'}}>
          <div style={{fontWeight: 600, fontSize: 18}}>Dinheiro</div>
          {orderDetails.tipoPagamento === 'Dinheiro' && (
            <div style={{marginTop: 16}}>
              <label style={{fontSize: 14, display: 'block', marginBottom: 4}}>Precisa de troco para quanto?</label>
              <input 
                type="number" 
                placeholder="Ex: 100" 
                onChange={e => setOrderDetails({...orderDetails, trocoPara: e.target.value ? Number(e.target.value) : undefined})}
                style={{padding: '10px 14px', borderRadius: 6, border: '1px solid #ccc', width: '100%', maxWidth: 200}} 
              />
            </div>
          )}
        </div>
      </div>

      <div style={{background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #eee'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
          <span>Subtotal:</span>
          <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 16, color: 'var(--text-muted)'}}>
          <span>Taxa de Entrega:</span>
          <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orderDetails.taxaEntrega)}</span>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700, marginBottom: 24, paddingTop: 16, borderTop: '1px solid #eee'}}>
          <span>Total:</span>
          <span style={{color: 'var(--primary)'}}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFinal)}</span>
        </div>
        
        <button className="add-btn" style={{width: '100%', justifyContent: 'center'}} onClick={confirmarPedido} disabled={loading}>
          {loading ? 'Processando...' : 'Confirmar Pedido'}
        </button>
      </div>
    </div>
  );
}

const boxStyle = {
  padding: 24,
  border: '2px solid',
  borderRadius: 12,
  background: '#fff',
  cursor: 'pointer',
  transition: 'border-color 0.2s'
};
