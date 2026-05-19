import { useState, useContext } from 'react';
import { useQuery, gql } from '@apollo/client';
import { StoreContext } from '../context/StoreContext';

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

const getImageForPizza = (pizza: any, index: number) => {
  if (pizza.nome === 'Mussarela') return '/pizza-queijo.png';
  if (pizza.nome === 'Frango com Catupiry') return '/pizza-catupiryfrango.png';
  if (pizza.nome === 'Portuguesa') return '/pizza-portuguesa.png';
  if (pizza.nome === 'Calabresa') return '/pizza-calabresa.png';
  if (pizza.nome === 'Marguerita') return '/pizza-marguerita.png';
  if (pizza.nome === '4 Queijos') return '/pizza-4Queijos.png';
  if (pizza.nome === 'Carne de Sol com Queijo Coalho') return '/pizza-carne-de-sol.jpg'; 
  if (pizza.nome === 'Pepperoni com Catupiry') return '/pizza-pepperoni.jpg';
  
  return '/pizza-queijo.png'; // Fallback geral seguro
};

export default function Home() {
  const { loading, error, data } = useQuery(GET_PIZZAS);
  const { cart, setCart } = useContext(StoreContext);
  
  const [selectedPizza, setSelectedPizza] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  if (loading) return <div style={{textAlign: 'center', padding: 40}}>Carregando cardápio...</div>;
  if (error) return <div style={{textAlign: 'center', padding: 40, color: 'red'}}>Erro ao conectar com o servidor!</div>;

  const openModal = (pizza: any) => {
    setSelectedPizza(pizza);
    setQuantity(1);
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
        imgUrl: getImageForPizza(selectedPizza, selectedPizza.imgIndex)
      }]);
    }
    setSelectedPizza(null);
  };

  const tradicionais = data?.pizzas.filter((p: any) => p.categoria === 'Tradicional') || [];
  const especiais = data?.pizzas.filter((p: any) => p.categoria === 'Especial') || [];

  const renderPizzaGrid = (pizzas: any[], offsetIndex: number) => (
    <div className="pizza-grid">
      {pizzas.map((pizza: any, index: number) => {
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
            <img src={getImageForPizza(pizza, imgIndex)} alt={pizza.nome} className="card-image" />
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

      {selectedPizza && (
        <div className="modal-overlay" onClick={() => setSelectedPizza(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src={getImageForPizza(selectedPizza, selectedPizza.imgIndex)} alt={selectedPizza.nome} className="modal-header-img" />
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
    </>
  );
}
