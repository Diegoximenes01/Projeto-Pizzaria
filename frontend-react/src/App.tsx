import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import Delivery from './pages/Delivery';
import Payment from './pages/Payment';
import Success from './pages/Success';
import { ShoppingCart } from 'lucide-react';
import { useContext } from 'react';
import { StoreContext } from './context/StoreContext';

function Header() {
  const navigate = useNavigate();
  const { cart } = useContext(StoreContext);
  const totalItems = cart.reduce((acc, curr) => acc + curr.quantidade, 0);

  return (
    <header className="header">
      <div className="logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
        🍕 Furreti Cucina
      </div>
      <button className="cart-button" onClick={() => navigate('/carrinho')}>
        <ShoppingCart size={20} style={{marginRight: 8, verticalAlign: 'middle'}}/>
        Carrinho ({totalItems})
      </button>
    </header>
  );
}

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
          </Routes>
        </main>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
