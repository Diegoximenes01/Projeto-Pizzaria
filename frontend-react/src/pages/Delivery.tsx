import { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';

const ATUALIZAR_ENDERECOS = gql`
  mutation AtualizarEnderecos($usuarioId: ID!, $enderecos: [String!]!) {
    atualizarEnderecos(usuarioId: $usuarioId, enderecos: $enderecos) {
      id
      endereco
      enderecos
    }
  }
`;

export default function Delivery() {
  const { user, setUser, orderDetails, setOrderDetails } = useContext(StoreContext);
  const navigate = useNavigate();

  const [atualizarEnderecos] = useMutation(ATUALIZAR_ENDERECOS);

  const addressList = user?.enderecos && user.enderecos.length > 0 
    ? user.enderecos.filter(addr => addr.trim() !== '') 
    : (user?.endereco && user.endereco.trim() !== '' ? [user.endereco.trim()] : []);
  const [selectedAddress, setSelectedAddress] = useState<string>(addressList[0] || '');
  const [isCustom, setIsCustom] = useState(addressList.length === 0);
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

  const handleContinue = async () => {
    if (orderDetails.tipoEntrega === 'Entrega') {
      let finalAddress = selectedAddress;
      if (isCustom) {
        if (!customAddress.trim()) {
          alert('Por favor, digite o novo endereço de entrega.');
          return;
        }
        finalAddress = customAddress.trim();

        // Save new address to the user's addresses in db
        const updatedList = [...addressList, finalAddress];
        try {
          await atualizarEnderecos({
            variables: {
              usuarioId: user.id,
              enderecos: updatedList
            }
          });
          
          setUser({
            ...user,
            enderecos: updatedList,
            endereco: finalAddress
          });
        } catch (e: any) {
          alert('Erro ao salvar endereço: ' + e.message);
          return;
        }
      } else {
        // If selecting a registered address, make it the active address in context
        setUser({
          ...user,
          endereco: finalAddress
        });
      }
    }
    navigate('/pagamento');
  };

  return (
    <div style={{maxWidth: 600, margin: '0 auto'}}>
      <h2 className="section-title">Informações de Entrega</h2>
      
      {/* 1. Address Selection */}
      <div style={{background: 'var(--card-bg)', padding: 24, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 24}}>
        <h3 style={{fontSize: 16, fontWeight: 600, marginBottom: 16}}>1. Endereço de Entrega</h3>
        
        {addressList.length > 0 ? (
          <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            {/* Registered Address Options */}
            {addressList.map((addr, index) => (
              <label key={index} style={{
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 12, 
                padding: 16, 
                borderRadius: 8, 
                border: '1px solid',
                borderColor: !isCustom && selectedAddress === addr ? 'var(--primary)' : 'var(--border)',
                cursor: 'pointer',
                background: !isCustom && selectedAddress === addr ? 'var(--card-selected-bg)' : 'var(--card-bg)'
              }}>
                <input 
                  type="radio" 
                  name="addressOption" 
                  checked={!isCustom && selectedAddress === addr}
                  onChange={() => {
                    setSelectedAddress(addr);
                    setIsCustom(false);
                  }}
                  style={{marginTop: 4}}
                />
                <div>
                  <strong style={{display: 'block', fontSize: 15, marginBottom: 4}}>Usar Endereço Cadastrado {addressList.length > 1 ? index + 1 : ''}</strong>
                  <span style={{fontSize: 14, color: 'var(--text-muted)'}}>{addr}</span>
                </div>
              </label>
            ))}

            {/* Custom Address Option */}
            <label style={{
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: 12, 
              padding: 16, 
              borderRadius: 8, 
              border: '1px solid',
              borderColor: isCustom ? 'var(--primary)' : 'var(--border)',
              cursor: 'pointer',
              background: isCustom ? 'var(--card-selected-bg)' : 'var(--card-bg)'
            }}>
              <input 
                type="radio" 
                name="addressOption" 
                checked={isCustom}
                onChange={() => setIsCustom(true)}
                style={{marginTop: 4}}
              />
              <div style={{flex: 1}}>
                <strong style={{display: 'block', fontSize: 15, marginBottom: 8}}>Usar Outro Endereço</strong>
                {isCustom && (
                  <input 
                    type="text" 
                    placeholder="Digite o novo endereço completo"
                    value={customAddress}
                    onChange={e => setCustomAddress(e.target.value)}
                    style={{
                      width: '100%', 
                      padding: '10px 14px', 
                      borderRadius: 6, 
                      border: '1px solid var(--border)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-main)',
                      fontSize: 14
                    }}
                    onClick={e => e.stopPropagation()}
                  />
                )}
              </div>
            </label>
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            <p style={{fontSize: 14, color: 'var(--text-muted)', marginBottom: 8, lineHeight: '1.5'}}>
              Você ainda não possui nenhum endereço cadastrado. Insira os dados do seu endereço abaixo para realizar a entrega:
            </p>
            <input 
              type="text" 
              placeholder="Rua, número, bairro, cidade e pontos de referência"
              value={customAddress}
              onChange={e => setCustomAddress(e.target.value)}
              style={{
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: 8, 
                border: '2px solid var(--border)',
                background: 'var(--input-bg)',
                color: 'var(--text-main)',
                fontSize: 15,
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        )}
      </div>

      {/* 2. Delivery Type Selection */}
      <div style={{background: 'var(--card-bg)', padding: 24, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 24}}>
        <h3 style={{fontSize: 16, fontWeight: 600, marginBottom: 16}}>2. Tipo de Entrega</h3>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          {/* Motoboy Option */}
          <div 
            onClick={() => handleSelectDeliveryType('Entrega')}
            style={{
              ...boxStyle, 
              borderColor: orderDetails.tipoEntrega === 'Entrega' ? 'var(--primary)' : 'var(--border)',
              background: orderDetails.tipoEntrega === 'Entrega' ? 'var(--card-selected-bg)' : 'var(--card-bg)'
            }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontWeight: 600, fontSize: 16}}>Entregador (Entrega)</span>
              <span style={{color: 'var(--primary)', fontWeight: 600}}>R$ 5,00</span>
            </div>
            <div style={{color: 'var(--text-muted)', fontSize: 13, marginTop: 4}}>Tempo estimado: 40 min</div>
          </div>

          {/* Pickup Option */}
          <div 
            onClick={() => handleSelectDeliveryType('Retirada')}
            style={{
              ...boxStyle, 
              borderColor: orderDetails.tipoEntrega === 'Retirada' ? 'var(--primary)' : 'var(--border)',
              background: orderDetails.tipoEntrega === 'Retirada' ? 'var(--card-selected-bg)' : 'var(--card-bg)'
            }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontWeight: 600, fontSize: 16}}>Retirar na Loja</span>
              <span style={{color: '#28a745', fontWeight: 600}}>Grátis</span>
            </div>
            <div style={{color: 'var(--text-muted)', fontSize: 13, marginTop: 4}}>Tempo estimado: 15 min</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
        <button 
          className="back-btn" 
          type="button"
          onClick={() => navigate('/carrinho')} 
          style={{
            flex: 1, 
            padding: '12px 16px', 
            borderRadius: 8, 
            border: '1px solid var(--primary)', 
            background: 'none', 
            color: 'var(--primary)', 
            cursor: 'pointer', 
            fontWeight: 600, 
            fontSize: 16, 
            textAlign: 'center'
          }}
        >
          Voltar
        </button>
        <button 
          className="add-btn" 
          style={{ flex: 2, justifyContent: 'center' }} 
          onClick={handleContinue}
        >
          Ir para Pagamento
        </button>
      </div>
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
