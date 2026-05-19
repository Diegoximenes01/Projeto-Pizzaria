import { createContext, useState, ReactNode } from 'react';

export interface CartItem {
  pizzaId: string;
  quantidade: number;
  nome: string;
  preco: number;
  imgUrl: string;
}

export interface User {
  id: string;
  nome: string;
  cpf: string;
  endereco: string;
}

export interface OrderDetails {
  tipoEntrega: 'Entrega' | 'Retirada';
  taxaEntrega: number;
  tipoPagamento: 'Cartão' | 'Pix' | 'Dinheiro';
  trocoPara?: number;
}

interface StoreContextType {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  orderDetails: OrderDetails;
  setOrderDetails: (details: OrderDetails) => void;
  clearStore: () => void;
}

export const StoreContext = createContext<StoreContextType>({} as StoreContextType);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    tipoEntrega: 'Entrega',
    taxaEntrega: 5.0,
    tipoPagamento: 'Pix',
  });

  const clearStore = () => {
    setCart([]);
    setOrderDetails({ tipoEntrega: 'Entrega', taxaEntrega: 5.0, tipoPagamento: 'Pix' });
  };

  return (
    <StoreContext.Provider value={{ cart, setCart, user, setUser, orderDetails, setOrderDetails, clearStore }}>
      {children}
    </StoreContext.Provider>
  );
};
