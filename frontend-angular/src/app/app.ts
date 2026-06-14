import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PizzaService, Pizza } from './pizza.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  template: `
    <div class="admin-container">
      <!-- Header -->
      <header class="admin-header">
        <div class="brand">
          <span class="logo">🍕</span>
          <div>
            <h1>Furreti Cucina</h1>
            <p class="subtitle">Painel do Administrador - Gestão de Cardápio</p>
          </div>
        </div>
        
        <!-- Status Indicator -->
        <div class="system-status">
          <span class="status-indicator online"></span>
          <span class="status-text">API REST: Conectada (Porta 8000)</span>
        </div>
      </header>

      <!-- Main Layout Grid -->
      <div class="admin-grid">
        
        <!-- Column 1: Pizza List -->
        <section class="pizzas-section">
          <div class="section-header">
            <h2>Pizzas Cadastradas</h2>
            <span class="count-badge">{{ pizzas().length }} pizzas</span>
          </div>

          @if (loading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Carregando catálogo de pizzas...</p>
            </div>
          } @else if (error()) {
            <div class="error-state">
              <span class="error-icon">⚠️</span>
              <p>{{ error() }}</p>
              <button class="retry-btn" (click)="loadPizzas()">Tentar Novamente</button>
            </div>
          } @else if (pizzas().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">🍽️</span>
              <p>Nenhuma pizza cadastrada no momento.</p>
            </div>
          } @else {
            <div class="pizza-cards-list">
              @for (pizza of pizzas(); track pizza.id) {
                <div class="pizza-card" [class.selected]="selectedPizza()?.id === pizza.id">
                  <div class="pizza-info">
                    <div class="pizza-header">
                      <h3>{{ pizza.nome }}</h3>
                      <span class="pizza-price">{{ formatPrice(pizza.preco) }}</span>
                    </div>
                    <p class="pizza-ingredients">{{ pizza.ingredientes }}</p>
                  </div>
                  
                  <div class="pizza-actions">
                    <button class="action-btn edit" (click)="editPizza(pizza)" title="Editar Pizza">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                      Editar
                    </button>
                    <button class="action-btn delete" (click)="deletePizza(pizza.id!)" title="Excluir Pizza">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      Excluir
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </section>

        <!-- Column 2: Form Container (Add/Edit) -->
        <section class="form-section">
          <div class="form-container">
            <div class="form-header">
              <h2>{{ isEditing() ? 'Editar Pizza' : 'Adicionar Nova Pizza' }}</h2>
              <p>{{ isEditing() ? 'Atualize as informações da pizza selecionada.' : 'Cadastre uma nova pizza no cardápio.' }}</p>
            </div>

            <form (ngSubmit)="savePizza()" #pizzaForm="ngForm" class="pizza-form">
              <div class="form-group">
                <label for="nome">Nome da Pizza</label>
                <input 
                  type="text" 
                  id="nome" 
                  name="nome" 
                  [(ngModel)]="formModel.nome" 
                  required 
                  maxLength="50"
                  placeholder="Ex: Calabresa Especial"
                  #nomeInput="ngModel"
                  [class.invalid]="nomeInput.invalid && nomeInput.touched"
                />
                @if (nomeInput.invalid && nomeInput.touched) {
                  <span class="validation-error">O nome é obrigatório (máx. 50 caracteres).</span>
                }
              </div>

              <div class="form-group">
                <label for="preco">Preço (R$)</label>
                <input 
                  type="number" 
                  id="preco" 
                  name="preco" 
                  [(ngModel)]="formModel.preco" 
                  required 
                  min="0.01"
                  max="999.99"
                  step="0.01"
                  placeholder="Ex: 38.90"
                  #precoInput="ngModel"
                  [class.invalid]="precoInput.invalid && precoInput.touched"
                />
                @if (precoInput.invalid && precoInput.touched) {
                  <span class="validation-error">Insira um preço válido maior que zero e menor que 1000.</span>
                }
              </div>

              <div class="form-group">
                <label for="ingredientes">Ingredientes</label>
                <textarea 
                  id="ingredientes" 
                  name="ingredientes" 
                  [(ngModel)]="formModel.ingredientes" 
                  rows="3"
                  maxLength="200"
                  placeholder="Ex: Molho de tomate, mussarela, calabresa, orégano..."
                  #ingredientesInput="ngModel"
                  [class.invalid]="ingredientesInput.invalid && ingredientesInput.touched"
                ></textarea>
                @if (ingredientesInput.invalid && ingredientesInput.touched) {
                  <span class="validation-error">Os ingredientes não devem ultrapassar 200 caracteres.</span>
                }
              </div>

              <div class="form-actions">
                @if (isEditing()) {
                  <button type="button" class="btn secondary" (click)="cancelEdit()">Cancelar</button>
                }
                <button type="submit" class="btn primary" [disabled]="pizzaForm.invalid">
                  {{ isEditing() ? 'Salvar Alterações' : 'Cadastrar Pizza' }}
                </button>
              </div>
            </form>
          </div>
        </section>

      </div>

      <!-- Toast Alert Notification -->
      @if (toastMessage()) {
        <div class="toast-alert" [class.error]="toastIsError()">
          <span class="toast-icon">{{ toastIsError() ? '❌' : '✨' }}</span>
          <span class="toast-text">{{ toastMessage() }}</span>
        </div>
      }
    </div>
  `,
  styles: `
    .admin-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
      color: #f3f1f6;
    }

    /* Header */
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      margin-bottom: 2rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo {
      font-size: 2.5rem;
    }

    .brand h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
      background: linear-gradient(135deg, #ff9f1c, #ff5e3a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      margin: 0.2rem 0 0 0;
      color: #a09cb0;
      font-size: 0.9rem;
    }

    .system-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 0.5rem 1rem;
      border-radius: 50px;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-indicator.online {
      background-color: #2ec4b6;
      box-shadow: 0 0 10px rgba(46, 196, 182, 0.5);
    }

    .status-text {
      font-size: 0.85rem;
      color: #a09cb0;
    }

    /* Layout Grid */
    .admin-grid {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 2rem;
    }

    @media (max-width: 900px) {
      .admin-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Pizza List Section */
    .pizzas-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .section-header h2 {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 600;
    }

    .count-badge {
      background: rgba(255, 159, 28, 0.1);
      border: 1px solid rgba(255, 159, 28, 0.2);
      color: #ff9f1c;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .pizza-cards-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-height: 650px;
      overflow-y: auto;
      padding-right: 0.5rem;
    }

    .pizza-cards-list::-webkit-scrollbar {
      width: 6px;
    }

    .pizza-cards-list::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }

    /* Pizza Card */
    .pizza-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(30, 25, 50, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.03);
      border-radius: 16px;
      padding: 1.25rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(10px);
    }

    .pizza-card:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 159, 28, 0.2);
      background: rgba(30, 25, 50, 0.6);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }

    .pizza-card.selected {
      border-color: #ff9f1c;
      background: rgba(255, 159, 28, 0.05);
      box-shadow: 0 0 15px rgba(255, 159, 28, 0.1);
    }

    .pizza-info {
      flex: 1;
      padding-right: 1.5rem;
    }

    .pizza-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 0.5rem;
      gap: 1rem;
    }

    .pizza-header h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 600;
    }

    .pizza-price {
      color: #ff9f1c;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .pizza-ingredients {
      margin: 0;
      color: #a09cb0;
      font-size: 0.88rem;
      line-height: 1.4;
    }

    .pizza-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #f3f1f6;
      padding: 0.4rem 0.8rem;
      border-radius: 8px;
      font-size: 0.8rem;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s ease;
    }

    .action-btn .icon {
      width: 14px;
      height: 14px;
    }

    .action-btn.edit:hover {
      border-color: #ff9f1c;
      color: #ff9f1c;
      background: rgba(255, 159, 28, 0.05);
    }

    .action-btn.delete:hover {
      border-color: #ff5e3a;
      color: #ff5e3a;
      background: rgba(255, 94, 58, 0.05);
    }

    /* States */
    .loading-state, .error-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      background: rgba(30, 25, 50, 0.2);
      border: 1px dashed rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      text-align: center;
      color: #a09cb0;
    }

    .spinner {
      width: 30px;
      height: 30px;
      border: 3px solid rgba(255, 159, 28, 0.1);
      border-top: 3px solid #ff9f1c;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-icon, .empty-icon {
      font-size: 2.5rem;
      margin-bottom: 0.8rem;
    }

    .retry-btn {
      margin-top: 1rem;
      background: #ff9f1c;
      border: none;
      color: #0b0914;
      padding: 0.5rem 1.2rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: opacity 0.2s;
    }

    .retry-btn:hover {
      opacity: 0.9;
    }

    /* Form Container */
    .form-section {
      align-self: flex-start;
    }

    .form-container {
      background: rgba(30, 25, 50, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 2rem;
      backdrop-filter: blur(10px);
    }

    .form-header h2 {
      margin: 0 0 0.4rem 0;
      font-size: 1.4rem;
      font-weight: 600;
    }

    .form-header p {
      margin: 0 0 1.5rem 0;
      color: #a09cb0;
      font-size: 0.85rem;
    }

    .pizza-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .form-group label {
      font-size: 0.85rem;
      color: #a09cb0;
      font-weight: 500;
    }

    .form-group input, .form-group textarea {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      color: #f3f1f6;
      padding: 0.75rem 1rem;
      font-family: inherit;
      font-size: 0.95rem;
      transition: all 0.2s ease;
    }

    .form-group input:focus, .form-group textarea:focus {
      outline: none;
      border-color: #ff9f1c;
      box-shadow: 0 0 8px rgba(255, 159, 28, 0.15);
      background: rgba(0, 0, 0, 0.3);
    }

    .form-group input.invalid, .form-group textarea.invalid {
      border-color: #ff5e3a;
    }

    .validation-error {
      color: #ff5e3a;
      font-size: 0.75rem;
      margin-top: 0.2rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .btn {
      flex: 1;
      padding: 0.8rem 1.5rem;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s ease;
      text-align: center;
    }

    .btn.primary {
      background: linear-gradient(135deg, #ff9f1c, #ff5e3a);
      border: none;
      color: #0b0914;
    }

    .btn.primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(255, 94, 58, 0.3);
    }

    .btn.primary:disabled {
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.2);
      cursor: not-allowed;
    }

    .btn.secondary {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #f3f1f6;
    }

    .btn.secondary:hover {
      background: rgba(255, 255, 255, 0.03);
      border-color: rgba(255, 255, 255, 0.2);
    }

    /* Toast Notification Alert */
    .toast-alert {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: rgba(30, 25, 50, 0.9);
      border: 1px solid #2ec4b6;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      animation: slideIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
      z-index: 1000;
      backdrop-filter: blur(20px);
    }

    .toast-alert.error {
      border-color: #ff5e3a;
    }

    .toast-icon {
      font-size: 1.25rem;
    }

    .toast-text {
      font-size: 0.9rem;
      font-weight: 500;
      color: #f3f1f6;
    }

    @keyframes slideIn {
      from {
        transform: translateY(100px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `
})
export class App implements OnInit {
  private pizzaService = inject(PizzaService);

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  }

  // States
  pizzas = signal<Pizza[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  selectedPizza = signal<Pizza | null>(null);
  isEditing = signal<boolean>(false);

  // Notification States
  toastMessage = signal<string | null>(null);
  toastIsError = signal<boolean>(false);
  private toastTimeout: any = null;

  // Form Binding Model
  formModel: Pizza = {
    nome: '',
    preco: 0,
    ingredientes: ''
  };

  ngOnInit(): void {
    this.loadPizzas();
  }

  loadPizzas(): void {
    this.loading.set(true);
    this.error.set(null);
    this.pizzaService.getPizzas().subscribe({
      next: (data) => {
        this.pizzas.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar pizzas:', err);
        this.error.set('Erro de comunicação. Verifique se a API RESTful está rodando na porta 8000.');
        this.loading.set(false);
        this.showToast('Erro ao carregar cardápio.', true);
      }
    });
  }

  editPizza(pizza: Pizza): void {
    this.selectedPizza.set(pizza);
    this.isEditing.set(true);
    // Cria uma cópia rasa dos dados da pizza para edição no formulário
    this.formModel = { ...pizza };
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.selectedPizza.set(null);
    this.resetForm();
  }

  savePizza(): void {
    // Validações básicas adicionais no front-end
    if (!this.formModel.nome || this.formModel.nome.trim() === '') return;
    if (this.formModel.preco <= 0) return;

    if (this.isEditing() && this.selectedPizza()?.id) {
      // Operação PUT: Atualizar pizza
      const id = this.selectedPizza()!.id!;
      this.pizzaService.updatePizza(id, this.formModel).subscribe({
        next: (updatedPizza) => {
          this.pizzas.update(list => list.map(p => p.id === id ? updatedPizza : p));
          this.showToast(`Pizza "${updatedPizza.nome}" atualizada com sucesso!`);
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Erro ao atualizar pizza:', err);
          this.showToast('Erro ao atualizar pizza. Verifique as restrições da API.', true);
        }
      });
    } else {
      // Operação POST: Criar pizza
      this.pizzaService.createPizza(this.formModel).subscribe({
        next: (newPizza) => {
          this.pizzas.update(list => [...list, newPizza]);
          this.showToast(`Pizza "${newPizza.nome}" cadastrada com sucesso!`);
          this.resetForm();
        },
        error: (err) => {
          console.error('Erro ao cadastrar pizza:', err);
          this.showToast('Erro ao cadastrar pizza. O nome pode já existir ou excedeu o limite.', true);
        }
      });
    }
  }

  deletePizza(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta pizza permanentemente do cardápio?')) {
      // Operação DELETE: Excluir pizza
      this.pizzaService.deletePizza(id).subscribe({
        next: () => {
          this.pizzas.update(list => list.filter(p => p.id !== id));
          this.showToast('Pizza excluída com sucesso do cardápio!');
          // Se estivesse editando a mesma pizza excluída, cancela a edição
          if (this.selectedPizza()?.id === id) {
            this.cancelEdit();
          }
        },
        error: (err) => {
          console.error('Erro ao excluir pizza:', err);
          this.showToast('Erro ao excluir pizza. Tente novamente mais tarde.', true);
        }
      });
    }
  }

  private resetForm(): void {
    this.formModel = {
      nome: '',
      preco: 0,
      ingredientes: ''
    };
  }

  private showToast(message: string, isError = false): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastMessage.set(message);
    this.toastIsError.set(isError);
    
    this.toastTimeout = setTimeout(() => {
      this.toastMessage.set(null);
    }, 3500);
  }
}
