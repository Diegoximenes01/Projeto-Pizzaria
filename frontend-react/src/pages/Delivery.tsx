import { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

export default function Delivery() {
  const { user, orderDetails, setOrderDetails } = useContext(StoreContext);
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSelect = (tipo: 'Entrega' | 'Retirada') => {
    setOrderDetails({
      ...orderDetails,
      tipoEntrega: tipo,
      taxaEntrega: tipo === 'Entrega' ? 5.0 : 0.0
    });
  };

  return (
    <div style={{maxWidth: 600, margin: '0 auto'}}>
      <h2 className="section-title">Como você deseja receber seu pedido?</h2>
      
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <div 
          onClick={() => handleSelect('Entrega')}
          style={{...boxStyle, borderColor: orderDetails.tipoEntrega === 'Entrega' ? 'var(--primary)' : '#eee'}}>
          <div style={{fontWeight: 600, fontSize: 18}}>Motoboy (Entrega)</div>
          <div style={{color: 'var(--text-muted)'}}>Tempo estimado: 40 min</div>
          <div style={{color: 'var(--primary)', fontWeight: 600, marginTop: 8}}>Taxa: R$ 5,00</div>
          {orderDetails.tipoEntrega === 'Entrega' && (
            <div style={{marginTop: 16, padding: 12, background: '#f9f9f9', borderRadius: 8}}>
              <strong>Entregar em:</strong> {user.endereco}
            </div>
          )}
        </div>

        <div 
          onClick={() => handleSelect('Retirada')}
          style={{...boxStyle, borderColor: orderDetails.tipoEntrega === 'Retirada' ? 'var(--primary)' : '#eee'}}>
          <div style={{fontWeight: 600, fontSize: 18}}>Retirar na Loja</div>
          <div style={{color: 'var(--text-muted)'}}>Tempo estimado: 15 min</div>
          <div style={{color: '#28a745', fontWeight: 600, marginTop: 8}}>Grátis</div>
        </div>
      </div>

      <button className="add-btn" style={{width: '100%', justifyContent: 'center', marginTop: 32}} onClick={() => navigate('/pagamento')}>
        Ir para Pagamento
      </button>
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
