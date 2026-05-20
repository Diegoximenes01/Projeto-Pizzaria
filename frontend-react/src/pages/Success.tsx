import { useNavigate } from 'react-router-dom';

export default function Success() {
  const navigate = useNavigate();
  const time = sessionStorage.getItem('lastOrderTime') || '40 min';

  return (
    <div style={{textAlign: 'center', padding: '60px 20px', maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 12, border: '1px solid #eee'}}>
      <div style={{fontSize: 64, marginBottom: 16}}>✅</div>
      <h1 style={{color: '#28a745', marginBottom: 16}}>Pagamento Concluído com Sucesso!</h1>
      
      <p style={{fontSize: 18, color: 'var(--text-main)', marginBottom: 12, fontWeight: 500}}>
        Seu pedido está sendo preparado.
      </p>
      
      <p style={{fontSize: 16, color: '#555', marginBottom: 24, lineHeight: '1.6'}}>
        Os status do seu pedido serão enviados diretamente para o seu <strong>WhatsApp</strong>.
      </p>

      <div style={{margin: '32px 0', padding: 24, background: '#f9f9f9', borderRadius: 8}}>
        <h3 style={{marginBottom: 8, fontSize: 16, color: '#666'}}>Tempo estimado para entrega/retirada:</h3>
        <span style={{fontSize: 24, fontWeight: 800, color: '#28a745'}}>{time}</span>
      </div>

      <p style={{color: 'var(--text-muted)', fontSize: 14, marginBottom: 32, lineHeight: '1.5'}}>
        Para mais informações, ligue para a nossa pizzaria no número:<br/>
        <strong style={{fontSize: 18, color: 'var(--primary)'}}>(11) 98765-4321</strong>
      </p>

      <button className="cart-button" onClick={() => navigate('/')} style={{width: '100%', padding: 16}}>
        Voltar para o Cardápio
      </button>
    </div>
  );
}
