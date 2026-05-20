import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import Delivery from './pages/Delivery';
import Payment from './pages/Payment';
import Success from './pages/Success';
import OrdersHistory from './pages/OrdersHistory';
import { ShoppingCart, ClipboardList, User, LogOut } from 'lucide-react';
import { useContext, useState, useEffect } from 'react';
import { StoreContext } from './context/StoreContext';

function EditProfileModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user, setUser } = useContext(StoreContext);
  const [nome, setNome] = useState(user?.nome || '');
  const [endereco, setEndereco] = useState(user?.endereco || '');

  if (!isOpen || !user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      ...user,
      nome,
      endereco
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: 24 }}>
        <h2 className="modal-title" style={{ fontSize: 20, marginBottom: 20 }}>Editar Informações</h2>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 6 }}>Nome Completo</label>
            <input 
              type="text" 
              value={nome} 
              onChange={e => setNome(e.target.value)} 
              required 
              style={{ ...inputStyle, width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 6 }}>CPF (Não alterável)</label>
            <input 
              type="text" 
              value={user.cpf} 
              disabled
              style={{ ...inputStyle, width: '100%', backgroundColor: '#f5f5f5', color: '#999', cursor: 'not-allowed' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 6 }}>Endereço de Entrega</label>
            <input 
              type="text" 
              value={endereco} 
              onChange={e => setEndereco(e.target.value)} 
              required 
              style={{ ...inputStyle, width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #ccc', background: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
            <button type="submit" className="add-btn" style={{ minWidth: 'auto', padding: '10px 20px' }}>Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Header() {
  const navigate = useNavigate();
  const { cart, user, setUser } = useContext(StoreContext);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  const totalItems = cart ? cart.reduce((acc, curr) => acc + curr.quantidade, 0) : 0;

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  useEffect(() => {
    const closeMenu = () => {
      setIsClicked(false);
    };
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  const isMenuOpen = isHovered || isClicked;

  return (
    <header className="header">
      <div className="logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
        🍕 Furetti Cucina
      </div>
      
      <div className="header-actions">
        {user ? (
          <div 
            className="user-menu-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span 
              className="user-menu-trigger"
              onClick={(e) => {
                e.stopPropagation();
                setIsClicked(!isClicked);
              }}
            >
              Olá, <strong>{user.nome}</strong>
            </span>
            <div className={`user-dropdown ${isMenuOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
              <button className="dropdown-item" style={{display: 'flex', alignItems: 'center', gap: 8}} onClick={() => { navigate('/pedidos'); setIsClicked(false); }}>
                <ClipboardList size={16} />
                Meus Pedidos
              </button>
              <button className="dropdown-item" style={{display: 'flex', alignItems: 'center', gap: 8}} onClick={() => { setIsEditOpen(true); setIsClicked(false); }}>
                <User size={16} />
                Editar Informações
              </button>
              <button className="dropdown-item logout" style={{display: 'flex', alignItems: 'center', gap: 8}} onClick={handleLogout}>
                <LogOut size={16} />
                Sair
              </button>
            </div>
            <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
          </div>
        ) : (
          <div className="auth-buttons">
            <button className="auth-btn login" onClick={() => navigate('/auth', { state: { signup: false } })}>
              Login
            </button>
            <button className="auth-btn signup" onClick={() => navigate('/auth', { state: { signup: true } })}>
              Cadastre-se
            </button>
          </div>
        )}
        
        <button className="cart-button" onClick={() => navigate('/carrinho')}>
          <ShoppingCart size={20} style={{marginRight: 8, verticalAlign: 'middle'}}/>
          Carrinho ({totalItems})
        </button>
      </div>
    </header>
  );
}

const inputStyle = {
  padding: '12px 16px',
  borderRadius: 8,
  border: '1px solid #ccc',
  fontSize: 16
};

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Header />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/carrinho" element={<Cart />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/entrega" element={<Delivery />} />
            <Route path="/pagamento" element={<Payment />} />
            <Route path="/sucesso" element={<Success />} />
            <Route path="/pedidos" element={<OrdersHistory />} />
          </Routes>
        </main>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
