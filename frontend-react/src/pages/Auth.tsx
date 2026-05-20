import { useState, useContext, useEffect } from 'react';
import { useMutation, gql, useApolloClient } from '@apollo/client';
import { StoreContext } from '../context/StoreContext';
import { useNavigate, useLocation } from 'react-router-dom';

const LOGIN = gql`
  query Login($cpf: String!, $senha: String!) {
    login(cpf: $cpf, senha: $senha) {
      id
      nome
      cpf
      endereco
      enderecos
    }
  }
`;

const CADASTRAR = gql`
  mutation Cadastrar($nome: String!, $cpf: String!, $email: String!, $telefone: String!, $senha: String!, $endereco: String!) {
    cadastrarUsuario(nome: $nome, cpf: $cpf, email: $email, telefone: $telefone, senha: $senha, endereco: $endereco) {
      id
      nome
      cpf
      email
      telefone
      endereco
      enderecos
    }
  }
`;

const REDEFINIR_SENHA = gql`
  mutation RedefinirSenha($cpf: String!, $novaSenha: String!) {
    redefinirSenha(cpf: $cpf, novaSenha: $novaSenha) {
      id
      nome
      cpf
    }
  }
`;

export default function Auth() {
  const location = useLocation();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const { user, setUser } = useContext(StoreContext);
  const navigate = useNavigate();
  const client = useApolloClient();
  
  const [formData, setFormData] = useState({ cpf: '', senha: '', confirmarSenha: '', nome: '', endereco: '', email: '', telefone: '' });
  const [cadastrar] = useMutation(CADASTRAR);
  const [redefinirSenha] = useMutation(REDEFINIR_SENHA);

  useEffect(() => {
    if (user) {
      navigate('/entrega');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (location.state && typeof (location.state as any).signup === 'boolean') {
      setMode((location.state as any).signup ? 'signup' : 'login');
    }
  }, [location.state]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        // Query manual pois hook de query em submissão exige lazyQuery
        const { data } = await client.query({
          query: LOGIN,
          variables: { cpf: formData.cpf, senha: formData.senha }
        });
        setUser(data.login);
        navigate('/entrega');
      } else if (mode === 'signup') {
        if (formData.senha !== formData.confirmarSenha) {
          alert('As senhas não coincidem. Por favor, tente novamente!');
          return;
        }
        const { data } = await cadastrar({ variables: formData });
        setUser(data.cadastrarUsuario);
        navigate('/entrega');
      } else if (mode === 'forgot') {
        if (formData.senha !== formData.confirmarSenha) {
          alert('As senhas não coincidem. Por favor, tente novamente!');
          return;
        }
        await redefinirSenha({
          variables: { cpf: formData.cpf, novaSenha: formData.senha }
        });
        alert('Senha redefinida com sucesso! Faça login com a nova senha.');
        setMode('login');
        setFormData({ ...formData, senha: '', confirmarSenha: '' });
      }
    } catch (err: any) {
      alert(err.message || 'Erro de autenticação');
    }
  };

  return (
    <div style={{maxWidth: 400, margin: '40px auto', background: '#fff', padding: 32, borderRadius: 12, border: '1px solid #eee'}}>
      <h2 style={{marginBottom: 24}}>
        {mode === 'login' ? 'Entrar na Conta' : mode === 'signup' ? 'Criar Conta' : 'Redefinir Senha'}
      </h2>
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        {mode === 'signup' && (
          <input placeholder="Nome Completo" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} style={inputStyle} />
        )}
        <input 
          placeholder="CPF (Apenas números)" 
          required 
          maxLength={11}
          value={formData.cpf} 
          onChange={e => {
            const apenasNumeros = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
            setFormData({...formData, cpf: apenasNumeros});
          }} 
          style={inputStyle} 
        />
        {mode === 'signup' && (
          <>
            <input 
              placeholder="E-mail" 
              type="email" 
              required 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              style={inputStyle} 
            />
            <input 
              placeholder="Telefone" 
              type="tel" 
              required 
              value={formData.telefone} 
              onChange={e => setFormData({...formData, telefone: e.target.value})} 
              style={inputStyle} 
            />
          </>
        )}
        <input 
          placeholder={mode === 'forgot' ? 'Nova Senha' : 'Senha'} 
          type="password" 
          required 
          value={formData.senha} 
          onChange={e => setFormData({...formData, senha: e.target.value})} 
          style={inputStyle} 
        />
        
        {mode !== 'login' && (
          <input 
            placeholder={mode === 'forgot' ? 'Confirmar Nova Senha' : 'Confirmar Senha'} 
            type="password" 
            required 
            value={formData.confirmarSenha} 
            onChange={e => setFormData({...formData, confirmarSenha: e.target.value})} 
            style={inputStyle} 
          />
        )}

        {mode === 'login' && (
          <div style={{ textAlign: 'right', marginTop: -8 }}>
            <span 
              style={{ fontSize: 13, color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }} 
              onClick={() => {
                setMode('forgot');
                setFormData({ ...formData, senha: '', confirmarSenha: '' });
              }}
            >
              Esqueceu a senha?
            </span>
          </div>
        )}

        <button type="submit" className="add-btn" style={{width: '100%', justifyContent: 'center', marginTop: 8}}>
          {mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Cadastrar' : 'Redefinir Senha'}
        </button>
      </form>
      
      <p style={{textAlign: 'center', marginTop: 24, fontSize: 14}}>
        {mode === 'login' && (
          <>
            Não tem conta?{' '}
            <span style={{color: 'var(--primary)', cursor: 'pointer', fontWeight: 600}} onClick={() => setMode('signup')}>
              Cadastre-se
            </span>
          </>
        )}
        {mode === 'signup' && (
          <>
            Já tem conta?{' '}
            <span style={{color: 'var(--primary)', cursor: 'pointer', fontWeight: 600}} onClick={() => setMode('login')}>
              Faça Login
            </span>
          </>
        )}
        {mode === 'forgot' && (
          <>
            Lembrou a senha?{' '}
            <span style={{color: 'var(--primary)', cursor: 'pointer', fontWeight: 600}} onClick={() => setMode('login')}>
              Faça Login
            </span>
          </>
        )}
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
