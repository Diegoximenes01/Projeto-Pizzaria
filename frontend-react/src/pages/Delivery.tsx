import { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

export default function Delivery() {
  const { user, setUser, orderDetails, setOrderDetails } = useContext(StoreContext);
  const navigate = useNavigate();

  const [addressOption, setAddressOption] = useState<'registered' | 'custom'>('registered');
  const [customAddress, setCustomAddress] = useState('');
  
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleSelectDeliveryType = (tipo: 'Entrega' | 'Retirada') => {
    setOrderDetails({
      ...orderDetails,
      tipoEntrega: tipo,
      taxaEntrega: tipo === 'Entrega' ? 5.0 : 0.0
    });
  };

  const handleContinue = () => {
    if (orderDetails.tipoEntrega === 'Entrega') {
      if (addressOption === 'custom') {
        if (!customAddress.trim()) {
          alert('Por favor, digite o novo endereço de entrega.');
          return;
        }
        setUser({
          ...user,
          endereco: customAddress.trim()
        });
      }
    }
    navigate('/pagamento');
  };

  return (
    <div style={{maxWidth: 600, margin: '0 auto'}}>
      <h2 className="section-title">Informações de Entrega</h2>
      
      {/* 1. Address Selection */}
      <div style={{background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #eee', marginBottom: 24}}>
        <h3 style={{fontSize: 16, fontWeight: 600, marginBottom: 16}}>1. Endereço de Entrega</h3>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          {/* Registered Address Option */}
          <label style={{
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: 12, 
            padding: 16, 
            borderRadius: 8, 
            border: '1px solid',
            borderColor: addressOption === 'registered' ? 'var(--primary)' : '#eee',
            cursor: 'pointer',
            background: addressOption === 'registered' ? '#fff9f9' : '#fff'
          }}>
            <input 
              type="radio" 
              name="addressOption" 
              checked={addressOption === 'registered'}
              onChange={() => setAddressOption('registered')}
              style={{marginTop: 4}}
            />
            <div>
              <strong style={{display: 'block', fontSize: 15, marginBottom: 4}}>Usar Endereço Cadastrado</strong>
              <span style={{fontSize: 14, color: '#555'}}>{user.endereco}</span>
            </div>
          </label>

          {/* Custom Address Option */}
          <label style={{
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: 12, 
            padding: 16, 
            borderRadius: 8, 
            border: '1px solid',
            borderColor: addressOption === 'custom' ? 'var(--primary)' : '#eee',
            cursor: 'pointer',
            background: addressOption === 'custom' ? '#fff9f9' : '#fff'
          }}>
            <input 
              type="radio" 
              name="addressOption" 
              checked={addressOption === 'custom'}
              onChange={() => setAddressOption('custom')}
              style={{marginTop: 4}}
            />
            <div style={{flex: 1}}>
              <strong style={{display: 'block', fontSize: 15, marginBottom: 8}}>Usar Outro Endereço</strong>
              {addressOption === 'custom' && (
                <input 
                  type="text" 
                  placeholder="Digite o novo endereço completo"
                  value={customAddress}
                  onChange={e => setCustomAddress(e.target.value)}
                  style={{
                    width: '100%', 
                    padding: '10px 14px', 
                    borderRadius: 6, 
                    border: '1px solid #ccc',
                    fontSize: 14
                  }}
                  onClick={e => e.stopPropagation()}
                />
              )}
            </div>
          </label>
        </div>
      </div>

      {/* 2. Delivery Type Selection */}
      <div style={{background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #eee', marginBottom: 24}}>
        <h3 style={{fontSize: 16, fontWeight: 600, marginBottom: 16}}>2. Tipo de Entrega</h3>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          {/* Motoboy Option */}
          <div 
            onClick={() => handleSelectDeliveryType('Entrega')}
            style={{
              ...boxStyle, 
              borderColor: orderDetails.tipoEntrega === 'Entrega' ? 'var(--primary)' : '#eee',
              background: orderDetails.tipoEntrega === 'Entrega' ? '#fff9f9' : '#fff'
            }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontWeight: 600, fontSize: 16}}>Motoboy (Entrega)</span>
              <span style={{color: 'var(--primary)', fontWeight: 600}}>R$ 5,00</span>
            </div>
            <div style={{color: 'var(--text-muted)', fontSize: 13, marginTop: 4}}>Tempo estimado: 40 min</div>
          </div>

          {/* Pickup Option */}
          <div 
            onClick={() => handleSelectDeliveryType('Retirada')}
            style={{
              ...boxStyle, 
              borderColor: orderDetails.tipoEntrega === 'Retirada' ? 'var(--primary)' : '#eee',
              background: orderDetails.tipoEntrega === 'Retirada' ? '#fff9f9' : '#fff'
            }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontWeight: 600, fontSize: 16}}>Retirar na Loja</span>
              <span style={{color: '#28a745', fontWeight: 600}}>Grátis</span>
            </div>
            <div style={{color: 'var(--text-muted)', fontSize: 13, marginTop: 4}}>Tempo estimado: 15 min</div>
          </div>
        </div>
      </div>

      <button className="add-btn" style={{width: '100%', justifyContent: 'center', marginTop: 16}} onClick={handleContinue}>
        Ir para Pagamento
      </button>
    </div>
  );
}

const boxStyle = {
  padding: 16,
  border: '2px solid',
  borderRadius: 8,
  cursor: 'pointer',
  transition: 'border-color 0.2s'
};
