import { createContext, useState, useEffect } from 'react';

export const StoreContext = createContext({});

export const StoreProvider = ({ children }) => {
  // Inicializa o usuário a partir do localStorage para manter a sessão no F5
  const [user, setUserState] = useState(() => {
    const saved = localStorage.getItem('usuario_logado');
    return saved ? JSON.parse(saved) : null;
  });

  const [cart, setCartState] = useState([]);

  const [orderDetails, setOrderDetails] = useState({
    tipoEntrega: 'Entrega',
    taxaEntrega: 5.0,
    tipoPagamento: 'Pix',
  });

  // Carrega e gerencia o carrinho correspondente quando o usuário faz login/logout
  useEffect(() => {
    if (user) {
      // Se há um usuário logado, recupera o carrinho salvo da conta dele
      const savedUserCart = localStorage.getItem(`carrinho_usuario_${user.id}`);
      let userCart = savedUserCart ? JSON.parse(savedUserCart) : [];

      // Recupera também o carrinho temporário do visitante (caso ele tenha adicionado coisas antes do login)
      const savedGuestCart = localStorage.getItem('carrinho_visitante');
      const guestCart = savedGuestCart ? JSON.parse(savedGuestCart) : [];

      if (guestCart.length > 0) {
        // Se havia itens no carrinho de visitante, mescla com o carrinho do usuário
        const mergedCart = [...userCart];
        for (const guestItem of guestCart) {
          const existing = mergedCart.find(item => item.pizzaId === guestItem.pizzaId);
          if (existing) {
            existing.quantidade += guestItem.quantidade;
          } else {
            mergedCart.push(guestItem);
          }
        }
        userCart = mergedCart;
        // Limpa o carrinho de visitante
        localStorage.removeItem('carrinho_visitante');
      }

      setCartState(userCart);
      localStorage.setItem(`carrinho_usuario_${user.id}`, JSON.stringify(userCart));
    } else {
      // Se não há usuário logado, carrega o carrinho do visitante
      const savedGuestCart = localStorage.getItem('carrinho_visitante');
      setCartState(savedGuestCart ? JSON.parse(savedGuestCart) : []);
    }
  }, [user]);

  // Função customizada para salvar o carrinho no lugar certo
  const setCart = (newCart) => {
    setCartState(newCart);
    if (user) {
      localStorage.setItem(`carrinho_usuario_${user.id}`, JSON.stringify(newCart));
    } else {
      localStorage.setItem('carrinho_visitante', JSON.stringify(newCart));
    }
  };

  // Função customizada para gerenciar login/logout e limpar o estado do carrinho imediatamente
  const setUser = (newUser) => {
    if (!newUser) {
      setCartState([]); // Limpa o carrinho visual imediatamente ao deslogar
      localStorage.removeItem('usuario_logado');
    } else {
      localStorage.setItem('usuario_logado', JSON.stringify(newUser));
    }
    setUserState(newUser);
  };

  const clearStore = () => {
    setCartState([]);
    if (user) {
      localStorage.setItem(`carrinho_usuario_${user.id}`, JSON.stringify([]));
    } else {
      localStorage.setItem('carrinho_visitante', JSON.stringify([]));
    }
    setOrderDetails({ tipoEntrega: 'Entrega', taxaEntrega: 5.0, tipoPagamento: 'Pix' });
  };

  return (
    <StoreContext.Provider value={{ cart, setCart, user, setUser, orderDetails, setOrderDetails, clearStore }}>
      {children}
    </StoreContext.Provider>
  );
};

