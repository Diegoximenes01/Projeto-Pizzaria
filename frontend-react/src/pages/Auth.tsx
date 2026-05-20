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
      email
      telefone
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

const VERIFICAR_CPF = gql`
  query VerificarCpf($cpf: String!) {
    verificarCpf(cpf: $cpf)
  }
`;

export default function Auth() {
  const location = useLocation();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const { user, setUser, cart } = useContext(StoreContext);
  const navigate = useNavigate();
  const client = useApolloClient();
  
  const [formData, setFormData] = useState({ cpf: '', senha: '', confirmarSenha: '', nome: '', endereco: '', email: '', telefone: '' });
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cadastrar] = useMutation(CADASTRAR);
  const [redefinirSenha] = useMutation(REDEFINIR_SENHA);

  useEffect(() => {
    if (user) {
      if (cart && cart.length > 0) {
        navigate('/entrega');
      } else {
        navigate('/');
      }
    }
  }, [user, cart, navigate]);

  useEffect(() => {
    if (location.state && typeof (location.state as any).signup === 'boolean') {
      setMode((location.state as any).signup ? 'signup' : 'login');
    }
  }, [location.state]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      if (mode === 'login') {
        // Query manual pois hook de query em submissão exige lazyQuery
        const { data } = await client.query({
          query: LOGIN,
          variables: { cpf: formData.cpf, senha: formData.senha }
        });
        setUser(data.login);
        if (cart && cart.length > 0) {
          navigate('/entrega');
        } else {
          navigate('/');
        }
      } else if (mode === 'signup') {
        if (formData.senha !== formData.confirmarSenha) {
          setError('As senhas não coincidem. Por favor, tente novamente!');
          return;
        }
        const { data } = await cadastrar({ variables: formData });
        setUser(data.cadastrarUsuario);
        if (cart && cart.length > 0) {
          navigate('/entrega');
        } else {
          navigate('/');
        }
      } else if (mode === 'forgot') {
        if (formData.senha !== formData.confirmarSenha) {
          setError('As senhas não coincidem. Por favor, tente novamente!');
          return;
        }
        await redefinirSenha({
          variables: { cpf: formData.cpf, novaSenha: formData.senha }
        });
        setSuccess('Senha redefinida com sucesso! Faça login com a nova senha.');
        setMode('login');
        setFormData({ ...formData, senha: '', confirmarSenha: '' });
      }
    } catch (err: any) {
      setError(err.message || 'Erro de autenticação');
    }
  };

  return (
    <div style={{maxWidth: 400, margin: '40px auto', background: 'var(--card-bg)', padding: 32, borderRadius: 12, border: '1px solid var(--border)'}}>
      <h2 style={{marginBottom: 24}}>
        {mode === 'login' ? 'Entrar na Conta' : mode === 'signup' ? 'Criar Conta' : 'Redefinir Senha'}
      </h2>
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        {error && (
          <div style={{
            background: 'rgba(234, 29, 44, 0.1)',
            border: '1px solid var(--primary)',
            color: '#ff4d5a',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            <span style={{ flex: 1 }}>{error}</span>
            <span 
              onClick={() => setError(null)} 
              style={{ cursor: 'pointer', fontWeight: 'bold', padding: '0 4px', fontSize: '16px' }}
            >
              ×
            </span>
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(46, 204, 113, 0.1)',
            border: '1px solid #2ecc71',
            color: '#2ecc71',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>✅</span>
            <span style={{ flex: 1 }}>{success}</span>
            <span 
              onClick={() => setSuccess(null)} 
              style={{ cursor: 'pointer', fontWeight: 'bold', padding: '0 4px', fontSize: '16px' }}
            >
              ×
            </span>
          </div>
        )}

        {mode === 'signup' && (
          <input placeholder="Nome Completo" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} style={inputStyle} />
        )}
        <input 
          placeholder="CPF (Apenas números)" 
          required 
          maxLength={11}
          value={formData.cpf} 
          disabled={mode === 'forgot'}
          onChange={e => {
            const apenasNumeros = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
            setFormData({...formData, cpf: apenasNumeros});
          }} 
          style={{ 
            ...inputStyle, 
            opacity: mode === 'forgot' ? 0.6 : 1, 
            cursor: mode === 'forgot' ? 'not-allowed' : 'text' 
          }} 
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
              placeholder="Telefone (DD) 9XXXX-XXXX" 
              type="tel" 
              required 
              value={formData.telefone} 
              onChange={e => {
                const apenasNumeros = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                let formatado = apenasNumeros;
                if (apenasNumeros.length > 2) {
                  formatado = `(${apenasNumeros.slice(0, 2)}) ` + apenasNumeros.slice(2);
                }
                if (apenasNumeros.length > 7) {
                  formatado = `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7)}`;
                }
                setFormData({...formData, telefone: formatado});
              }} 
              style={inputStyle} 
            />
          </>
        )}
        <div style={{ position: 'relative', width: '100%' }}>
          <input 
            placeholder={mode === 'forgot' ? 'Nova Senha' : 'Senha'} 
            type={showSenha ? 'text' : 'password'} 
            required 
            value={formData.senha} 
            onChange={e => setFormData({...formData, senha: e.target.value})} 
            style={{ ...inputStyle, width: '100%', paddingRight: '46px' }} 
          />
          <button
            type="button"
            onClick={() => setShowSenha(!showSenha)}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0
            }}
          >
            {showSenha ? (
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="20" width="20">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="20" width="20">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            )}
          </button>
        </div>
        
        {mode !== 'login' && (
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              placeholder={mode === 'forgot' ? 'Confirmar Nova Senha' : 'Confirmar Senha'} 
              type={showConfirmarSenha ? 'text' : 'password'} 
              required 
              value={formData.confirmarSenha} 
              onChange={e => setFormData({...formData, confirmarSenha: e.target.value})} 
              style={{ ...inputStyle, width: '100%', paddingRight: '46px' }} 
            />
            <button
              type="button"
              onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            >
              {showConfirmarSenha ? (
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="20" width="20">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="20" width="20">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              )}
            </button>
          </div>
        )}

        {mode !== 'login' && formData.confirmarSenha && formData.senha !== formData.confirmarSenha && (
          <div style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 500, marginTop: 4, marginBottom: 8, textAlign: 'left', width: '100%' }}>
            ⚠️ As senhas não coincidem!
          </div>
        )}

        {mode === 'login' && (
          <div style={{ textAlign: 'right', marginTop: -8 }}>
            <span 
              style={{ fontSize: 13, color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }} 
              onClick={async () => {
                setError(null);
                setSuccess(null);
                const cleanCpf = formData.cpf.replace(/[^0-9]/g, '');
                if (cleanCpf.length !== 11) {
                  setError('Por favor, digite seu CPF (11 números) no campo de CPF para recuperar a senha.');
                  return;
                }
                try {
                  const { data } = await client.query({
                    query: VERIFICAR_CPF,
                    variables: { cpf: cleanCpf },
                    fetchPolicy: 'network-only'
                  });
                  if (data.verificarCpf) {
                    setMode('forgot');
                    setFormData({ ...formData, senha: '', confirmarSenha: '' });
                  } else {
                    setError('CPF não encontrado. Verifique o número digitado ou crie uma nova conta.');
                  }
                } catch (error) {
                  console.error(error);
                  setError('Erro ao verificar o CPF. Tente novamente.');
                }
              }}
            >
              Esqueceu a senha?
            </span>
          </div>
        )}

        <button 
          type="submit" 
          className="add-btn" 
          style={{
            width: '100%', 
            justifyContent: 'center', 
            marginTop: 8,
            opacity: (mode !== 'login' && formData.senha !== formData.confirmarSenha) ? 0.6 : 1,
            cursor: (mode !== 'login' && formData.senha !== formData.confirmarSenha) ? 'not-allowed' : 'pointer'
          }}
          disabled={mode !== 'login' && formData.senha !== formData.confirmarSenha}
        >
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
