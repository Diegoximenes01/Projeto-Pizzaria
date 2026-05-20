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
import { useMutation, useLazyQuery, gql } from '@apollo/client';

const VERIFICAR_EMAIL = gql`
  query VerificarEmail($email: String!, $usuarioId: ID) {
    verificarEmail(email: $email, usuarioId: $usuarioId)
  }
`;

const ATUALIZAR_PERFIL = gql`
  mutation AtualizarPerfil($usuarioId: ID!, $nome: String!, $email: String!, $telefone: String!) {
    atualizarPerfil(usuarioId: $usuarioId, nome: $nome, email: $email, telefone: $telefone) {
      id
      nome
      email
      telefone
    }
  }
`;

const formatPhoneNumber = (value: string) => {
  const numbersOnly = value.replace(/\D/g, '').slice(0, 11);
  if (numbersOnly.length <= 2) {
    return numbersOnly;
  }
  if (numbersOnly.length <= 7) {
    return `(${numbersOnly.slice(0, 2)}) ${numbersOnly.slice(2)}`;
  }
  return `(${numbersOnly.slice(0, 2)}) ${numbersOnly.slice(2, 7)}-${numbersOnly.slice(7)}`;
};

function EditProfileModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user, setUser } = useContext(StoreContext);
  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.email || '');
  const [telefone, setTelefone] = useState(user?.telefone || '');
  const [emailError, setEmailError] = useState('');

  const [verificarEmailQuery] = useLazyQuery(VERIFICAR_EMAIL);
  const [atualizarPerfil] = useMutation(ATUALIZAR_PERFIL);

  useEffect(() => {
    if (user) {
      setNome(user.nome || '');
      setEmail(user.email || '');
      setTelefone(formatPhoneNumber(user.telefone || ''));
      setEmailError('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleEmailBlur = async () => {
    if (!email) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Por favor, insira um e-mail válido.');
      return;
    }

    try {
      const { data } = await verificarEmailQuery({
        variables: { email, usuarioId: user.id }
      });
      if (data && data.verificarEmail) {
        setEmailError('Este e-mail já está sendo utilizado em outra conta.');
      } else {
        setEmailError('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatPhoneNumber(e.target.value));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError) return;

    try {
      const { data: checkData } = await verificarEmailQuery({
        variables: { email, usuarioId: user.id }
      });
      if (checkData && checkData.verificarEmail) {
        setEmailError('Este e-mail já está sendo utilizado em outra conta.');
        return;
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const { data } = await atualizarPerfil({
        variables: {
          usuarioId: user.id,
          nome,
          email,
          telefone: telefone.replace(/\D/g, '') // Save clean numbers to DB
        }
      });
      if (data && data.atualizarPerfil) {
        setUser({
          ...user,
          nome: data.atualizarPerfil.nome,
          email: data.atualizarPerfil.email,
          telefone: data.atualizarPerfil.telefone
        });
        onClose();
      }
    } catch (err: any) {
      alert('Erro ao atualizar perfil: ' + err.message);
    }
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
            <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 6 }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={handleEmailChange} 
              onBlur={handleEmailBlur}
              required 
              style={{ 
                ...inputStyle, 
                width: '100%',
                borderColor: emailError ? 'var(--primary)' : '#ccc' 
              }}
            />
            {emailError && (
              <span style={{ color: 'var(--primary)', fontSize: 12, marginTop: 4, display: 'block', fontWeight: 500 }}>
                {emailError}
              </span>
            )}
          </div>
          <div>
            <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 6 }}>Telefone</label>
            <input 
              type="text" 
              value={telefone} 
              onChange={handleTelefoneChange} 
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
          <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid var(--primary)', color: 'var(--primary)', background: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
            <button type="submit" className="add-btn" disabled={!!emailError} style={{ minWidth: 'auto', padding: '10px 20px', opacity: emailError ? 0.6 : 1, cursor: emailError ? 'not-allowed' : 'pointer' }}>Salvar</button>
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
      <div className="logo" onClick={() => navigate('/')} style={{cursor: 'pointer', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px'}}>
        <span>🍕</span>
        <svg width="24" height="16" viewBox="0 0 3 2" style={{borderRadius: '2px', display: 'inline-block', boxShadow: '0 0 2px rgba(255,255,255,0.2)'}}>
          <rect width="1" height="2" fill="#009246"/>
          <rect x="1" width="1" height="2" fill="#f1f2f1"/>
          <rect x="2" width="1" height="2" fill="#ce2b37"/>
        </svg>
        <span>Furetti Cucina</span>
      </div>
      
      <div className="header-actions">
        {user ? (
          <div 
            className="user-menu-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span 
              className={`user-menu-trigger ${isMenuOpen ? 'active' : ''}`}
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
