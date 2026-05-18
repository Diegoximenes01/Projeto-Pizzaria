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
    }
  }
`;

const getImageForPizza = (index: number) => {
  const images = ['/pizza1.png', '/pizza2.png', '/pizza3.png'];
  return images[index % images.length];
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
        imgUrl: getImageForPizza(selectedPizza.imgIndex)
      }]);
    }
    setSelectedPizza(null);
  };

  return (
    <>
      <h2 className="section-title">Nosso Cardápio</h2>
      <div className="pizza-grid">
        {data.pizzas.map((pizza: any, index: number) => (
          <div key={pizza.id} className="pizza-card" onClick={() => openModal({...pizza, imgIndex: index})}>
            <div className="card-info">
              <h3 className="card-title">{pizza.nome}</h3>
              <p className="card-desc">{pizza.ingredientes.join(', ')}</p>
              <div className="card-price">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pizza.preco)}
              </div>
            </div>
            <img src={getImageForPizza(index)} alt={pizza.nome} className="card-image" />
          </div>
        ))}
      </div>

      {selectedPizza && (
        <div className="modal-overlay" onClick={() => setSelectedPizza(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src={getImageForPizza(selectedPizza.imgIndex)} alt={selectedPizza.nome} className="modal-header-img" />
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
