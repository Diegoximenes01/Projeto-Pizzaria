import { useContext, useState, useEffect, useRef } from 'react';
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

  const [precisaDeTroco, setPrecisaDeTroco] = useState(false);
  const [trocoInput, setTrocoInput] = useState('');

  // Estados para dados do cartão
  const [opcaoCartao, setOpcaoCartao] = useState<'online' | 'entrega'>('online');
  const [tipoCartao, setTipoCartao] = useState<'crédito' | 'débito'>('crédito');
  const [cartaoDados, setCartaoDados] = useState({
    numero: '',
    nome: '',
    validade: '',
    cvv: ''
  });

  const checkoutSuccessRef = useRef(false);

  // Redirecionamento correto em useEffect para evitar crash/tela em branco durante render
  useEffect(() => {
    if (checkoutSuccessRef.current) return;
    if (!user || cart.length === 0) {
      navigate('/');
    }
  }, [user, cart, navigate]);

  if (!user || cart.length === 0) {
    return null;
  }

  const subtotal = cart.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const totalFinal = subtotal + orderDetails.taxaEntrega;

  const handleSelect = (tipo: 'Cartão' | 'Pix' | 'Dinheiro') => {
    setOrderDetails({ ...orderDetails, tipoPagamento: tipo, trocoPara: undefined });
    if (tipo !== 'Dinheiro') {
      setPrecisaDeTroco(false);
      setTrocoInput('');
    }
  };

  const handleTrocoChange = (val: string) => {
    setTrocoInput(val);
  };

  const calcularTroco = () => {
    const valor = Number(trocoInput);
    if (!isNaN(valor) && valor > totalFinal) {
      return valor - totalFinal;
    }
    return 0;
  };

  const trocoResultado = calcularTroco();

  // Formatação dinâmica dos campos do cartão
  const handleNumeroCartaoChange = (val: string) => {
    const limpo = val.replace(/\D/g, '').slice(0, 16);
    const formatado = limpo.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCartaoDados({ ...cartaoDados, numero: formatado });
  };

  const handleValidadeChange = (val: string) => {
    const limpo = val.replace(/\D/g, '').slice(0, 4);
    let formatado = limpo;
    if (limpo.length > 2) {
      formatado = limpo.slice(0, 2) + '/' + limpo.slice(2);
    }
    setCartaoDados({ ...cartaoDados, validade: formatado });
  };

  const handleCvvChange = (val: string) => {
    const limpo = val.replace(/\D/g, '').slice(0, 4);
    setCartaoDados({ ...cartaoDados, cvv: limpo });
  };

  const confirmarPedido = async () => {
    if (orderDetails.tipoPagamento === 'Dinheiro' && precisaDeTroco) {
      const valorTroco = Number(trocoInput);
      if (isNaN(valorTroco) || valorTroco <= 0) {
        alert('Por favor, insira um valor de troco válido.');
        return;
      }
      if (valorTroco < totalFinal) {
        alert(`O valor para troco deve ser maior ou igual ao total do pedido (${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFinal)}).`);
        return;
      }
    }

    if (orderDetails.tipoPagamento === 'Cartão' && opcaoCartao === 'online') {
      const { numero, nome, validade, cvv } = cartaoDados;
      const numDigits = numero.replace(/\s/g, '');
      if (numDigits.length < 16) {
        alert('Por favor, insira um número de cartão de crédito válido (16 dígitos).');
        return;
      }
      if (!nome.trim()) {
        alert('Por favor, insira o nome impresso no cartão.');
        return;
      }
      if (validade.length < 5) {
        alert('Por favor, insira uma data de validade válida (MM/AA).');
        return;
      }
      const parts = validade.split('/');
      const mes = Number(parts[0]);
      if (mes < 1 || mes > 12) {
        alert('Mês de validade inválido. Use um valor de 01 a 12.');
        return;
      }
      if (cvv.length < 3) {
        alert('Por favor, insira um código de segurança (CVV) válido.');
        return;
      }
    }

    try {
      const tipoPg = orderDetails.tipoPagamento === 'Cartão'
        ? (opcaoCartao === 'online'
            ? `Cartão de ${tipoCartao === 'crédito' ? 'Crédito' : 'Débito'} (Online)`
            : 'Cartão (Na entrega)')
        : orderDetails.tipoPagamento;

      await criarPedido({
        variables: {
          itens: cart.map(i => ({ pizzaId: i.pizzaId, quantidade: i.quantidade })),
          usuarioId: user.id,
          tipoEntrega: orderDetails.tipoEntrega,
          taxaEntrega: orderDetails.taxaEntrega,
          tipoPagamento: tipoPg,
          trocoPara: orderDetails.tipoPagamento === 'Dinheiro' && precisaDeTroco ? Number(trocoInput) : undefined
        }
      });
      checkoutSuccessRef.current = true;
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
        {/* Opção Pix */}
        <div 
          onClick={() => handleSelect('Pix')} 
          style={{
            ...boxStyle, 
            borderColor: orderDetails.tipoPagamento === 'Pix' ? 'var(--primary)' : 'var(--border)',
            backgroundColor: orderDetails.tipoPagamento === 'Pix' ? 'var(--card-selected-bg)' : 'var(--card-bg)'
          }}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{fontWeight: 600, fontSize: 18}}>⚡ Pix</div>
            {orderDetails.tipoPagamento === 'Pix' && <span style={{color: 'var(--primary)', fontWeight: 600}}>Selecionado</span>}
          </div>
          {orderDetails.tipoPagamento === 'Pix' && (
            <div style={{marginTop: 16, textAlign: 'center', background: 'var(--card-bg)', padding: 16, borderRadius: 8, border: '1px solid var(--border)'}}>
              <p style={{marginBottom: 12, fontSize: 14, color: 'var(--text-muted)'}}>
                Escaneie o código QR abaixo com o aplicativo do seu banco:
              </p>
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=FurretiCucinaMockPixPaymentCode" 
                alt="QRCode Pix" 
                style={{width: 180, height: 180, borderRadius: 8, border: '1px solid var(--border)', display: 'block', margin: '0 auto 12px'}} 
              />
              <button 
                type="button" 
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText("00020101021126580014br.gov.bcb.pix0136FurretiCucinaMockPixPaymentCode");
                  alert("Código Pix copia e cola copiado com sucesso!");
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid var(--primary)',
                  background: 'none',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13
                }}
              >
                Copiar Chave Pix Copia e Cola
              </button>
            </div>
          )}
        </div>

        {/* Opção Cartão */}
        <div 
          onClick={() => handleSelect('Cartão')} 
          style={{
            ...boxStyle, 
            borderColor: orderDetails.tipoPagamento === 'Cartão' ? 'var(--primary)' : 'var(--border)',
            backgroundColor: orderDetails.tipoPagamento === 'Cartão' ? 'var(--card-selected-bg)' : 'var(--card-bg)'
          }}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{fontWeight: 600, fontSize: 18}}>💳 Cartão de Crédito ou Débito</div>
            {orderDetails.tipoPagamento === 'Cartão' && <span style={{color: 'var(--primary)', fontWeight: 600}}>Selecionado</span>}
          </div>
          {orderDetails.tipoPagamento === 'Cartão' && (
            <div style={{marginTop: 16, background: 'var(--card-bg)', padding: 16, borderRadius: 8, border: '1px solid var(--border)'}} onClick={e => e.stopPropagation()}>
              <div style={{display: 'flex', gap: 24, marginBottom: 16}}>
                <label style={{display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500}}>
                  <input 
                    type="radio" 
                    name="opcaoCartao" 
                    checked={opcaoCartao === 'online'} 
                    onChange={() => setOpcaoCartao('online')} 
                  />
                  Pagar online agora
                </label>
                <label style={{display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500}}>
                  <input 
                    type="radio" 
                    name="opcaoCartao" 
                    checked={opcaoCartao === 'entrega'} 
                    onChange={() => setOpcaoCartao('entrega')} 
                  />
                  Pagamento na entrega
                </label>
              </div>

              {opcaoCartao === 'online' ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                  {/* Tipo de Cartão (Crédito ou Débito) */}
                  <div style={{display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 4}}>
                    <label style={{display: 'block', fontSize: 12, color: 'var(--text-muted)'}}>Modalidade do Cartão</label>
                    <div style={{display: 'flex', gap: 16}}>
                      <label style={{display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500}}>
                        <input 
                          type="radio" 
                          name="tipoCartao" 
                          checked={tipoCartao === 'crédito'} 
                          onChange={() => setTipoCartao('crédito')} 
                        />
                        Crédito
                      </label>
                      <label style={{display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500}}>
                        <input 
                          type="radio" 
                          name="tipoCartao" 
                          checked={tipoCartao === 'débito'} 
                          onChange={() => setTipoCartao('débito')} 
                        />
                        Débito
                      </label>
                    </div>
                  </div>

                  <div>
                    <label style={{display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4}}>Número do Cartão</label>
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000"
                      value={cartaoDados.numero}
                      onChange={e => handleNumeroCartaoChange(e.target.value)}
                      style={cardInputStyle}
                    />
                  </div>
                  <div>
                    <label style={{display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4}}>Nome Impresso no Cartão</label>
                    <input 
                      type="text" 
                      placeholder="Nome impresso no cartão"
                      value={cartaoDados.nome}
                      onChange={e => setCartaoDados({ ...cartaoDados, nome: e.target.value.toUpperCase() })}
                      style={cardInputStyle}
                    />
                  </div>
                  <div style={{display: 'flex', gap: 12}}>
                    <div style={{flex: 1}}>
                      <label style={{display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4}}>Validade</label>
                      <input 
                        type="text" 
                        placeholder="MM/AA"
                        value={cartaoDados.validade}
                        onChange={e => handleValidadeChange(e.target.value)}
                        style={cardInputStyle}
                      />
                    </div>
                    <div style={{flex: 1}}>
                      <label style={{display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4}}>CVV</label>
                      <input 
                        type="text" 
                        placeholder="123"
                        value={cartaoDados.cvv}
                        onChange={e => handleCvvChange(e.target.value)}
                        style={cardInputStyle}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{color: 'var(--text-muted)', fontSize: 14, margin: '8px 0 0 0'}}>
                  O entregador levará a maquininha para que o pagamento seja realizado no momento da entrega.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Opção Dinheiro */}
        <div 
          onClick={() => handleSelect('Dinheiro')} 
          style={{
            ...boxStyle, 
            borderColor: orderDetails.tipoPagamento === 'Dinheiro' ? 'var(--primary)' : 'var(--border)',
            backgroundColor: orderDetails.tipoPagamento === 'Dinheiro' ? 'var(--card-selected-bg)' : 'var(--card-bg)'
          }}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{fontWeight: 600, fontSize: 18}}>💵 Dinheiro</div>
            {orderDetails.tipoPagamento === 'Dinheiro' && <span style={{color: 'var(--primary)', fontWeight: 600}}>Selecionado</span>}
          </div>
          {orderDetails.tipoPagamento === 'Dinheiro' && (
            <div style={{marginTop: 16, background: 'var(--card-bg)', padding: 16, borderRadius: 8, border: '1px solid var(--border)'}} onClick={e => e.stopPropagation()}>
              <label style={{display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 12}}>
                <input 
                  type="checkbox" 
                  checked={precisaDeTroco} 
                  onChange={e => {
                    setPrecisaDeTroco(e.target.checked);
                    if (!e.target.checked) setTrocoInput('');
                  }} 
                />
                <span style={{fontSize: 14, fontWeight: 500}}>Preciso de troco</span>
              </label>

              {precisaDeTroco && (
                <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                  <span style={{fontSize: 13, color: 'var(--text-muted)'}}>Precisa de troco para quanto?</span>
                  <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <span style={{fontWeight: 600}}>R$</span>
                    <input 
                      type="number" 
                      placeholder="Ex: 100" 
                      value={trocoInput}
                      onChange={e => handleTrocoChange(e.target.value)}
                      style={{padding: '10px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-main)', width: '100%', maxWidth: 120, fontSize: 15}} 
                    />
                  </div>
                  {trocoInput && Number(trocoInput) >= totalFinal && (
                    <div style={{color: '#28a745', fontSize: 14, fontWeight: 600, marginTop: 4}}>
                      Troco a receber: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(trocoResultado)}
                    </div>
                  )}
                  {trocoInput && Number(trocoInput) < totalFinal && (
                    <div style={{color: 'var(--primary)', fontSize: 13, fontWeight: 500, marginTop: 4}}>
                      O valor do troco deve ser maior ou igual ao total do pedido.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{background: 'var(--card-bg)', padding: 24, borderRadius: 12, border: '1px solid var(--border)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
          <span>Subtotal:</span>
          <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 16, color: 'var(--text-muted)'}}>
          <span>Taxa de Entrega:</span>
          <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orderDetails.taxaEntrega)}</span>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700, marginBottom: 24, paddingTop: 16, borderTop: '1px solid var(--border)'}}>
          <span>Total:</span>
          <span style={{color: 'var(--primary)'}}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFinal)}</span>
        </div>
        
        <button 
          className="add-btn" 
          style={{width: '100%', justifyContent: 'center'}} 
          onClick={confirmarPedido} 
          disabled={
            loading || 
            (orderDetails.tipoPagamento === 'Dinheiro' && precisaDeTroco && (Number(trocoInput) < totalFinal || !trocoInput)) ||
            (orderDetails.tipoPagamento === 'Cartão' && opcaoCartao === 'online' && (
              cartaoDados.numero.replace(/\s/g, '').length < 16 || 
              !cartaoDados.nome.trim() || 
              cartaoDados.validade.length < 5 || 
              cartaoDados.cvv.length < 3
            ))
          }
        >
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
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
};

const cardInputStyle = {
  padding: '10px 14px',
  borderRadius: 6,
  border: '1px solid var(--border)',
  background: 'var(--input-bg)',
  color: 'var(--text-main)',
  width: '100%',
  fontSize: 14,
  boxSizing: 'border-box' as const
};
