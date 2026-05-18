import { useNavigate } from 'react-router-dom';

export default function Success() {
  const navigate = useNavigate();
  const time = sessionStorage.getItem('lastOrderTime') || '40 min';

  return (
    <div style={{textAlign: 'center', padding: '60px 20px', maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 12, border: '1px solid #eee'}}>
      <div style={{fontSize: 64, marginBottom: 16}}>🎉</div>
      <h1 style={{color: 'var(--primary)', marginBottom: 16}}>Pedido Concluído!</h1>
      <p style={{fontSize: 18, color: 'var(--text-main)', marginBottom: 8}}>
        Seu pedido foi recebido pela cozinha da Furreti Cucina e já está sendo preparado.
      </p>
      
      <div style={{margin: '32px 0', padding: 24, background: '#f9f9f9', borderRadius: 8}}>
        <h3 style={{marginBottom: 8}}>Tempo estimado:</h3>
        <span style={{fontSize: 24, fontWeight: 800, color: '#28a745'}}>{time}</span>
      </div>

      <p style={{color: 'var(--text-muted)', fontSize: 14, marginBottom: 32}}>
        Em caso de atraso, por favor ligue para o nosso suporte no número:<br/>
        <strong style={{fontSize: 16, color: 'var(--text-main)'}}>(11) 4002-8922</strong>
      </p>

      <button className="cart-button" onClick={() => navigate('/')} style={{width: '100%', padding: 16}}>
        Voltar para o Cardápio
      </button>
    </div>
  );
}
