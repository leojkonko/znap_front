# Sistema de Pedidos - Frontend

Um sistema completo de gerenciamento de pedidos desenvolvido com Vue.js 3, TypeScript e Vuetify. Este frontend oferece uma interface moderna e intuitiva para gerenciar produtos, clientes e pedidos.

## 🚀 Tecnologias Utilizadas

- **Vue.js 3** - Framework JavaScript progressivo
- **TypeScript** - Tipagem estática para JavaScript
- **Vuetify 3** - Framework de componentes Material Design para Vue.js
- **Vue Router 4** - Roteamento oficial do Vue.js
- **Pinia** - Gerenciamento de estado moderno para Vue.js
- **Axios** - Cliente HTTP para requisições à API
- **Vite** - Build tool moderna e rápida
- **Material Design Icons** - Ícones do Material Design

## 📁 Estrutura do Projeto

```
front/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/              # Recursos estáticos (CSS, imagens)
│   │   ├── base.css
│   │   ├── logo.svg
│   │   └── main.css
│   ├── components/          # Componentes reutilizáveis
│   │   ├── HelloWorld.vue
│   │   ├── NotificationSystem.vue
│   │   ├── OrderForm.vue
│   │   ├── OrderItemForm.vue
│   │   ├── OrderItemsModal.vue
│   │   ├── OrdersList.vue
│   │   ├── TheWelcome.vue
│   │   ├── WelcomeItem.vue
│   │   └── icons/           # Componentes de ícones
│   ├── composables/         # Composables Vue 3
│   │   └── useNotifications.ts
│   ├── router/              # Configuração de rotas
│   │   └── index.ts
│   ├── services/            # Serviços de API
│   │   └── api.ts
│   ├── stores/              # Stores Pinia
│   │   └── counter.ts
│   ├── views/               # Páginas da aplicação
│   │   ├── AboutView.vue
│   │   ├── ClientsView.vue
│   │   ├── HomeView.vue
│   │   ├── NotFoundView.vue
│   │   ├── OrderEditView.vue
│   │   ├── OrdersView.vue
│   │   └── ProductsView.vue
│   ├── App.vue              # Componente raiz
│   └── main.ts              # Ponto de entrada da aplicação
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## ⚡ Funcionalidades

### 📊 Dashboard
- Visão geral do sistema
- Acesso rápido às principais funcionalidades

### 📦 Gerenciamento de Produtos
- Listar todos os produtos
- Criar novos produtos
- Editar produtos existentes
- Excluir produtos
- Visualizar detalhes com preço e descrição

### 👥 Gerenciamento de Clientes
- Listar todos os clientes
- Cadastrar novos clientes
- Editar informações de clientes
- Excluir clientes
- Gerenciar dados de contato (nome, email, telefone)

### 🛒 Gerenciamento de Pedidos
- Listar todos os pedidos
- Criar novos pedidos
- Editar pedidos existentes
- Visualizar detalhes completos dos pedidos
- **Agrupamento inteligente de itens**: Quando você adiciona um produto que já existe no pedido, o sistema automaticamente aumenta a quantidade em vez de criar um item duplicado
- Cálculo automático de subtotais e total do pedido
- Associação de clientes aos pedidos

## 🛠️ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Git**

## 📥 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd teste-tecnico/front
```

2. **Instale as dependências**
```bash
npm install
```

ou com yarn:
```bash
yarn install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:
```env
VITE_API_BASE_URL=http://localhost:3333
```

> **Nota**: Ajuste a URL da API conforme necessário. Por padrão, o sistema espera que a API esteja rodando na porta 3333.

## 🚀 Como Executar

### Desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build para Produção
```bash
npm run build
```

### Preview da Build
```bash
npm run preview
```

### Verificação de Tipos
```bash
npm run type-check
```

## 🔧 Configuração da API

O frontend se comunica com uma API REST. Certifique-se de que:

1. A API esteja rodando na URL configurada em `VITE_API_BASE_URL`
2. A API tenha os seguintes endpoints disponíveis:

### Produtos
- `GET /products` - Listar produtos
- `POST /products` - Criar produto
- `PUT /products/:id` - Atualizar produto
- `DELETE /products/:id` - Excluir produto

### Clientes
- `GET /clients` - Listar clientes
- `GET /clients/:id` - Buscar cliente por ID
- `POST /clients` - Criar cliente
- `PUT /clients/:id` - Atualizar cliente
- `DELETE /clients/:id` - Excluir cliente

### Pedidos
- `GET /orders` - Listar pedidos
- `GET /orders/:id` - Buscar pedido por ID
- `POST /orders` - Criar pedido
- `PUT /orders/:id` - Atualizar pedido
- `DELETE /orders/:id` - Excluir pedido

## 🎨 Interface e UX

- **Design Material**: Interface baseada no Material Design 3
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Tema claro**: Interface limpa e moderna
- **Notificações**: Sistema de notificações para feedback do usuário
- **Navegação intuitiva**: Menu lateral com ícones e rótulos claros

## 🔄 Fluxo de Trabalho de Pedidos

1. **Criar Pedido**: Selecione um cliente e comece a adicionar produtos
2. **Adicionar Produtos**: Escolha produtos e defina quantidades
3. **Agrupamento Automático**: Produtos iguais são automaticamente agrupados
4. **Salvar**: Todas as alterações são sincronizadas com a API
5. **Visualizar**: Veja o resumo completo com totais calculados

## 🐛 Solução de Problemas

### Erro de Conexão com API
- Verifique se a API está rodando
- Confirme a URL da API no arquivo `.env`
- Verifique se não há problemas de CORS

### Problemas de Build
```bash
# Limpar cache e reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Problemas de TypeScript
```bash
# Verificar erros de tipo
npm run type-check
```

## 📱 Principais Componentes

- **OrdersList**: Lista de pedidos com paginação e filtros
- **OrderForm**: Formulário para criar/editar pedidos
- **OrderItemForm**: Formulário para adicionar/editar itens do pedido
- **NotificationSystem**: Sistema de notificações toast
- **Navigation**: Menu lateral responsivo

## 🔐 Segurança

- Validação de tipos com TypeScript
- Sanitização de dados de entrada
- Tratamento de erros da API
- Headers de segurança configurados

## 📈 Performance

- Build otimizada com Vite
- Code splitting automático
- Lazy loading de rotas
- Componentes otimizados do Vuetify

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Desenvolvido com ❤️ usando Vue.js 3 + TypeScript + Vuetify**
