import { useContext, useState, useRef } from 'react';
import { StoreContext } from '../contexto/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

export default function Cart() {
  const { cart, setCart, user } = useContext(StoreContext);
  const navigate = useNavigate();
  const [showRemovedToast, setShowRemovedToast] = useState(false);
  const toastTimeoutRef = useRef(null);

  const total = cart.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

  const updateQtd = (id, delta) => {
    setCart(cart.map(item => {
      if (item.pizzaId === id) {
        const newQtd = Math.max(1, item.quantidade + delta);
        return { ...item, quantidade: newQtd };
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCart(cart.filter(item => item.pizzaId !== id));
    setShowRemovedToast(true);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setShowRemovedToast(false);
    }, 3000);
  };

  if (cart.length === 0) {
    return (
      <div style={{textAlign: 'center', padding: '60px 20px'}}>
        <h2>Seu carrinho está vazio 😕</h2>
        <button className="add-btn" style={{marginTop: 24, margin: '24px auto', maxWidth: 300}} onClick={() => navigate('/')}>
          Ver Cardápio
        </button>
      </div>
    );
  }

  return (
    <div style={{maxWidth: 600, margin: '0 auto'}}>
      <h2 className="section-title">Seu Carrinho</h2>
      <div style={{display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32}}>
        {cart.map(item => (
          <div key={item.pizzaId} style={{display: 'flex', alignItems: 'center', background: 'var(--card-bg)', padding: 16, borderRadius: 8, border: '1px solid var(--border)', gap: 16}}>
            <img src={item.imgUrl} alt={item.nome} style={{width: 60, height: 60, borderRadius: 8, objectFit: 'cover'}} />
            <div style={{flex: 1}}>
              <div style={{fontWeight: 600}}>{item.nome}</div>
              <div style={{color: '#ea1d2c', fontWeight: 500}}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco)}</div>
            </div>
            <div className="quantity-control" style={{padding: '4px 8px'}}>
              <button className="qty-btn" onClick={() => updateQtd(item.pizzaId, -1)}>-</button>
              <span>{item.quantidade}</span>
              <button className="qty-btn" onClick={() => updateQtd(item.pizzaId, 1)}>+</button>
            </div>
            <button onClick={() => removeItem(item.pizzaId)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#999'}}>
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
      
      <div style={{background: 'var(--card-bg)', padding: 24, borderRadius: 8, border: '1px solid var(--border)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700, marginBottom: 24}}>
          <span>Total:</span>
          <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
        </div>
        <button 
          className="add-btn" 
          style={{width: '100%'}} 
          onClick={() => {
            if (user) {
              navigate('/entrega');
            } else {
              navigate('/auth');
            }
          }}
        >
          Continuar
        </button>
      </div>

      {showRemovedToast && (
        <div className="removed-toast">
          <Trash2 size={16} style={{ marginRight: 8, color: '#ea1d2c' }} />
          <span>Item Removido</span>
        </div>
      )}
    </div>
  );
}
