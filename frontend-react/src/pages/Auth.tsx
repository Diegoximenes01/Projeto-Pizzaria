import { useState, useContext } from 'react';
import { useMutation, gql, useApolloClient } from '@apollo/client';
import { StoreContext } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const LOGIN = gql`
  query Login($cpf: String!, $senha: String!) {
    login(cpf: $cpf, senha: $senha) {
      id
      nome
      endereco
    }
  }
`;

const CADASTRAR = gql`
  mutation Cadastrar($nome: String!, $cpf: String!, $senha: String!, $endereco: String!) {
    cadastrarUsuario(nome: $nome, cpf: $cpf, senha: $senha, endereco: $endereco) {
      id
      nome
      endereco
    }
  }
`;

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { setUser } = useContext(StoreContext);
  const navigate = useNavigate();
  const client = useApolloClient();
  
  const [formData, setFormData] = useState({ cpf: '', senha: '', confirmarSenha: '', nome: '', endereco: '' });
  const [cadastrar] = useMutation(CADASTRAR);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // Query manual pois hook de query em submissão exige lazyQuery
        const { data } = await client.query({
          query: LOGIN,
          variables: { cpf: formData.cpf, senha: formData.senha }
        });
        setUser(data.login);
        navigate('/entrega');
      } else {
        if (formData.senha !== formData.confirmarSenha) {
          alert('As senhas não coincidem. Por favor, tente novamente!');
          return;
        }
        const { data } = await cadastrar({ variables: formData });
        setUser(data.cadastrarUsuario);
        navigate('/entrega');
      }
    } catch (err: any) {
      alert(err.message || 'Erro de autenticação');
    }
  };

  return (
    <div style={{maxWidth: 400, margin: '40px auto', background: '#fff', padding: 32, borderRadius: 12, border: '1px solid #eee'}}>
      <h2 style={{marginBottom: 24}}>{isLogin ? 'Entrar na Conta' : 'Criar Conta'}</h2>
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        {!isLogin && (
          <input placeholder="Nome Completo" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} style={inputStyle} />
        )}
        <input 
          placeholder="CPF (Apenas números)" 
          required 
          value={formData.cpf} 
          onChange={e => {
            const apenasNumeros = e.target.value.replace(/[^0-9]/g, '');
            setFormData({...formData, cpf: apenasNumeros});
          }} 
          style={inputStyle} 
        />
        <input placeholder="Senha" type="password" required value={formData.senha} onChange={e => setFormData({...formData, senha: e.target.value})} style={inputStyle} />
        
        {!isLogin && (
          <input placeholder="Confirmar Senha" type="password" required value={formData.confirmarSenha} onChange={e => setFormData({...formData, confirmarSenha: e.target.value})} style={inputStyle} />
        )}

        {!isLogin && (
          <div style={{marginTop: 8, paddingTop: 16, borderTop: '1px solid #eee'}}>
            <h3 style={{fontSize: 14, color: '#666', marginBottom: 12}}>Local de Entrega</h3>
            <input placeholder="Endereço de Entrega" required value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} style={{...inputStyle, width: '100%'}} />
          </div>
        )}
        
        <button type="submit" className="add-btn" style={{width: '100%', justifyContent: 'center', marginTop: 8}}>
          {isLogin ? 'Entrar' : 'Cadastrar'}
        </button>
      </form>
      
      <p style={{textAlign: 'center', marginTop: 24, fontSize: 14}}>
        {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
        <span style={{color: 'var(--primary)', cursor: 'pointer', fontWeight: 600}} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Cadastre-se' : 'Faça Login'}
        </span>
      </p>
    </div>
  );
}

const inputStyle = {
  padding: '12px 16px',
  borderRadius: 8,
  border: '1px solid #ccc',
  fontSize: 16
};
