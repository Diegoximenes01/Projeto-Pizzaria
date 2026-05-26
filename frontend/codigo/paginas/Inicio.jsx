import { useState, useContext, useRef } from 'react';
import { useQuery, gql } from '@apollo/client';
import { StoreContext } from '../contexto/StoreContext';

const GET_PIZZAS = gql`
  query GetPizzas {
    pizzas {
      id
      nome
      preco
      ingredientes
      categoria
    }
  }
`;

const getImageForPizza = (pizza) => {
  if (pizza.nome === 'Mussarela') return '/pizza-queijo.png';
  if (pizza.nome === 'Frango com Catupiry') return '/pizza-catupiryfrango.png';
  if (pizza.nome === 'Portuguesa') return '/pizza-portuguesa.png';
  if (pizza.nome === 'Calabresa') return '/pizza-calabresa.png';
  if (pizza.nome === 'Marguerita') return '/pizza-marguerita.png';
  if (pizza.nome === '4 Queijos') return '/pizza-4Queijos.png';
  if (pizza.nome === 'Carne de Sol com Queijo Coalho') return '/pizza-carne-de-sol.jpg'; 
  if (pizza.nome === 'Pepperoni com Catupiry') return '/pizza-pepperoni.jpg';
  if (pizza.nome === 'Coca-Cola Lata') return '/coca-lata.png';
  if (pizza.nome === 'Coca-Cola Zero Lata') return '/coca-zero.png';
  if (pizza.nome === 'Pepsi Lata') return '/pepsi.png';
  if (pizza.nome === 'Pepsi Black Lata') return '/pepsi-black.png';
  if (pizza.nome === 'Guaraná Antarctica Lata') return '/guarana-lata.png';
  if (pizza.nome === 'Guaraná Antarctica Zero Lata') return '/guarana-zero.png';
  if (pizza.nome === 'Água Mineral sem Gás') return '/agua-mineral.png';
  if (pizza.nome === 'Água Mineral com Gás') return '/agua-mineral-gas.png';
  
  return '/pizza-queijo.png'; // Fallback geral seguro
};

export default function Home() {
  const { loading, error, data } = useQuery(GET_PIZZAS);
  const { cart, setCart } = useContext(StoreContext);
  
  const [selectedPizza, setSelectedPizza] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);
  const successTimeoutRef = useRef(null);

  if (loading) return <div style={{textAlign: 'center', padding: 40}}>Carregando cardápio...</div>;
  if (error) return <div style={{textAlign: 'center', padding: 40, color: 'red'}}>Erro ao conectar com o servidor!</div>;

  const openModal = (pizza) => {
    setSelectedPizza(pizza);
    setQuantity(1);
  };

  const closeSuccess = () => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    setShowSuccess(false);
  };

  const addToCart = () => {
    if (!selectedPizza) return;
    const existing = cart.find(item => item.pizzaId === selectedPizza.id);
    if (existing) {
      setCart(cart.map(item => item.pizzaId === selectedPizza.id ? { ...item, quantidade: item.quantidade + quantity } : item));
    } else {
      setCart([...cart, { 
        pizzaId: selectedPizza.id, 
        quantidade: quantity, 
        nome: selectedPizza.nome, 
        preco: selectedPizza.preco,
        imgUrl: getImageForPizza(selectedPizza)
      }]);
    }
    setSuccessDetails({
      nome: selectedPizza.nome,
      quantidade: quantity
    });
    setSelectedPizza(null);
    setShowSuccess(true);

    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    successTimeoutRef.current = setTimeout(() => {
      setShowSuccess(false);
    }, 2500);
  };

  const tradicionais = data?.pizzas.filter((p) => p.categoria === 'Tradicional') || [];
  const especiais = data?.pizzas.filter((p) => p.categoria === 'Especial') || [];
  const ordemBebidas = [
    'Coca-Cola Lata',
    'Coca-Cola Zero Lata',
    'Pepsi Lata',
    'Pepsi Black Lata',
    'Guaraná Antarctica Lata',
    'Guaraná Antarctica Zero Lata',
    'Água Mineral sem Gás',
    'Água Mineral com Gás'
  ];
  const bebidas = (data?.pizzas.filter((p) => p.categoria === 'Bebida') || [])
    .slice()
    .sort((a, b) => {
      const idxA = ordemBebidas.indexOf(a.nome);
      const idxB = ordemBebidas.indexOf(b.nome);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

  const renderPizzaGrid = (pizzas, offsetIndex) => (
    <div className="pizza-grid">
      {pizzas.map((pizza, index) => {
        const imgIndex = offsetIndex + index;
        return (
          <div key={pizza.id} className="pizza-card" onClick={() => openModal({...pizza, imgIndex})}>
            <div className="card-info">
              <h3 className="card-title">{pizza.nome}</h3>
              <p className="card-desc">{pizza.ingredientes.join(', ')}</p>
              <div className="card-price">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pizza.preco)}
              </div>
            </div>
            <img src={getImageForPizza(pizza)} alt={pizza.nome} className="card-image" />
          </div>
        )
      })}
    </div>
  );

  return (
    <>
      <h2 className="section-title" style={{marginTop: 30}}>Pizzas Tradicionais</h2>
      {renderPizzaGrid(tradicionais, 0)}

      <h2 className="section-title" style={{marginTop: 30}}>Pizzas Especiais</h2>
      {renderPizzaGrid(especiais, tradicionais.length)}

      {bebidas.length > 0 && (
        <>
          <h2 className="section-title" style={{marginTop: 30}}>Bebidas</h2>
          {renderPizzaGrid(bebidas, tradicionais.length + especiais.length)}
        </>
      )}

      {selectedPizza && (
        <div className="modal-overlay" onClick={() => setSelectedPizza(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src={getImageForPizza(selectedPizza)} alt={selectedPizza.nome} className="modal-header-img" />
            <div className="modal-body">
              <h2 className="modal-title">{selectedPizza.nome}</h2>
              <p className="modal-desc">{selectedPizza.ingredientes.join(', ')}</p>
              
              <div className="modal-footer">
                <div className="quantity-control">
                  <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                  <span>{quantity}</span>
                  <button className="qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
                </div>
                <button className="add-btn" onClick={addToCart}>
                  <span>Adicionar</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedPizza.preco * quantity)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccess && successDetails && (
        <div className="modal-overlay" onClick={closeSuccess}>
          <div className="success-modal-content" onClick={e => e.stopPropagation()}>
            <button className="success-close-btn" onClick={closeSuccess} aria-label="Fechar">&times;</button>
            <svg className="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
            <h3 className="success-title">Item Adicionado!</h3>
            <p className="success-subtitle">
              {successDetails.quantidade}x {successDetails.nome} {successDetails.quantidade > 1 ? 'adicionadas' : 'adicionada'} ao carrinho.
            </p>
            <div className="success-timer-bar"></div>
          </div>
        </div>
      )}
    </>
  );
}
