# 🏗️ Plano de Arquitetura — Autoflex Inventory System

---

## 1. 📊 Modelagem de Dados (Diagrama ER)

```
┌─────────────────────┐          ┌──────────────────────────────┐          ┌─────────────────────────┐
│      PRODUCT         │          │   PRODUCT_RAW_MATERIAL       │          │     RAW_MATERIAL         │
├─────────────────────┤          ├──────────────────────────────┤          ├─────────────────────────┤
│ PK  id       BIGSERIAL│─────┐  │ PK  id            BIGSERIAL  │  ┌──────│ PK  id        BIGSERIAL  │
│     code     VARCHAR  │     └──│ FK  product_id     BIGINT     │  │      │     code      VARCHAR    │
│     name     VARCHAR  │        │ FK  raw_material_id BIGINT     │──┘      │     name      VARCHAR    │
│     value    DECIMAL  │        │     quantity        DECIMAL    │         │     stock_quantity DECIMAL│
│              (15,2)   │        │                    (15,4)     │         │               (15,4)     │
└─────────────────────┘          │                               │         └─────────────────────────┘
                                 │                               │
                                 │ UQ (product_id,               │
                                 │     raw_material_id)           │
                                 └──────────────────────────────┘

Cardinalidade:
  PRODUCT  ──── 1:N ────  PRODUCT_RAW_MATERIAL  ──── N:1 ────  RAW_MATERIAL

  Resultado lógico:  PRODUCT  ◄── N:N ──►  RAW_MATERIAL
```

### Dicionário de Dados

| Tabela | Coluna | Tipo | Constraint |
|---|---|---|---|
| **product** | `id` | `BIGSERIAL` | PK |
| | `code` | `VARCHAR(50)` | UNIQUE NOT NULL |
| | `name` | `VARCHAR(255)` | NOT NULL |
| | `value` | `NUMERIC(15,2)` | NOT NULL |
| **raw_material** | `id` | `BIGSERIAL` | PK |
| | `code` | `VARCHAR(50)` | UNIQUE NOT NULL |
| | `name` | `VARCHAR(255)` | NOT NULL |
| | `stock_quantity` | `NUMERIC(15,4)` | NOT NULL DEFAULT 0 |
| **product_raw_material** | `id` | `BIGSERIAL` | PK |
| | `product_id` | `BIGINT` | FK → product(id) ON DELETE CASCADE |
| | `raw_material_id` | `BIGINT` | FK → raw_material(id) ON DELETE CASCADE |
| | `quantity` | `NUMERIC(15,4)` | NOT NULL |
| | | | UNIQUE(product_id, raw_material_id) |

---

## 2. 🧠 Lógica de Negócio — Algoritmo de Sugestão de Produção

### Fluxograma

```
┌─────────────────────────────────────────────┐
│  1. Buscar todos os produtos com suas       │
│     matérias-primas  (JOIN FETCH)            │
│     ORDENAR por value DESC                  │
└──────────────────────┬──────────────────────┘
                       ▼
┌─────────────────────────────────────────────┐
│  2. Criar mapa mutável do estoque           │
│     Map<rawMaterialId, availableQty>        │
└──────────────────────┬──────────────────────┘
                       ▼
┌─────────────────────────────────────────────┐
│  3. Para CADA produto (do mais caro →       │
│     mais barato):                           │
│                                             │
│   a) Para cada matéria-prima do produto:    │
│      maxUnits = MIN(                        │
│        estoque_disponível / qtd_necessária  │
│      )  → arredonda para BAIXO (floor)      │
│                                             │
│   b) Se maxUnits > 0:                       │
│      - Deduz do estoque:                    │
│        estoque -= qtd_necessária * maxUnits │
│      - Adiciona à lista de sugestão         │
│      - subtotal = value * maxUnits          │
│                                             │
│   c) Se maxUnits == 0: pula o produto       │
└──────────────────────┬──────────────────────┘
                       ▼
┌─────────────────────────────────────────────┐
│  4. Retorna:                                │
│     - Lista de itens sugeridos              │
│       (produto, qtd, subtotal)              │
│     - Valor total = Σ subtotais             │
└─────────────────────────────────────────────┘
```

### Pseudocódigo

```text
function calculateSuggestions():
    products ← findAll ORDER BY value DESC (com raw materials)
    stock   ← Map { rawMaterial.id → rawMaterial.stockQuantity }
    result  ← []
    total   ← 0

    for each product in products:
        if product.rawMaterials is empty → skip

        maxUnits ← ∞
        for each prm in product.rawMaterials:
            available ← stock[prm.rawMaterialId] ?? 0
            canMake   ← floor(available / prm.quantity)
            maxUnits  ← min(maxUnits, canMake)

        if maxUnits ≤ 0 → skip

        // Deduz estoque
        for each prm in product.rawMaterials:
            stock[prm.rawMaterialId] -= prm.quantity * maxUnits

        subtotal ← product.value * maxUnits
        total    += subtotal
        result.add({ product, maxUnits, subtotal })

    return { items: result, totalValue: total }
```

> **Estratégia:** Algoritmo *greedy* — prioriza os produtos de maior valor, consumindo o estoque primeiro para eles. Simples, eficiente e atende ao requisito do enunciado.

---

## 3. 📁 Estrutura de Pastas

### Backend (Spring Boot)

```
backend/
├── pom.xml
├── Dockerfile
└── src/
    ├── main/
    │   ├── java/com/autoflex/inventory/
    │   │   ├── InventoryApplication.java          ← Entry point
    │   │   ├── config/
    │   │   │   └── CorsConfig.java                ← CORS para o frontend
    │   │   ├── entity/
    │   │   │   ├── Product.java
    │   │   │   ├── RawMaterial.java
    │   │   │   └── ProductRawMaterial.java
    │   │   ├── dto/
    │   │   │   ├── ProductDTO.java
    │   │   │   ├── RawMaterialDTO.java
    │   │   │   ├── ProductRawMaterialDTO.java
    │   │   │   ├── ProductionSuggestionDTO.java
    │   │   │   └── SuggestionItemDTO.java
    │   │   ├── repository/
    │   │   │   ├── ProductRepository.java
    │   │   │   ├── RawMaterialRepository.java
    │   │   │   └── ProductRawMaterialRepository.java
    │   │   ├── service/
    │   │   │   ├── ProductService.java
    │   │   │   ├── RawMaterialService.java
    │   │   │   └── ProductionService.java         ← Algoritmo de Sugestão
    │   │   ├── controller/
    │   │   │   ├── ProductController.java
    │   │   │   ├── RawMaterialController.java
    │   │   │   └── ProductionController.java
    │   │   └── exception/
    │   │       ├── ResourceNotFoundException.java
    │   │       └── GlobalExceptionHandler.java
    │   └── resources/
    │       ├── application.properties
    │       └── db/migration/
    │           ├── V1__create_product_table.sql
    │           ├── V2__create_raw_material_table.sql
    │           └── V3__create_product_raw_material_table.sql
```

### Frontend (React + Redux + TypeScript)

```
frontend/
├── package.json
├── tsconfig.json
├── Dockerfile
├── Dockerfile.dev
├── nginx.conf
├── public/
│   └── index.html
├── src/
│   ├── index.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── modal.css
│   ├── types/
│   │   └── index.ts                          ← Interfaces TS Globais
│   ├── api/
│   │   └── axiosInstance.ts                   ← Configuração do Axios
│   ├── store/
│   │   ├── store.ts                           ← Configuração Redux
│   │   ├── index.ts                           ← Hooks Redux
│   │   ├── productSlice.ts
│   │   └── rawMaterialSlice.ts
│   ├── components/
│   │   └── common/
│   │       ├── Sidebar.tsx
│   │       └── Modal.tsx
│   └── pages/
│       ├── ProductsPage.tsx                   ← Lista e Criação de Produtos
│       ├── RawMaterialsPage.tsx               ← Lista e Criação de MP
│       └── ProductionPage.tsx                 ← Tela de Sugestão de Produção
```

---

## 4. 🐳 Configuração Docker

### docker-compose.yml

```yaml
version: '3.8'

services:
  # ─── PostgreSQL ─────────────────────────────────────
  postgres:
    image: postgres:16-alpine
    container_name: autoflex-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: autoflex_inventory
      POSTGRES_USER: autoflex
      POSTGRES_PASSWORD: autoflex123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U autoflex -d autoflex_inventory"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ─── Backend (Spring Boot) ──────────────────────────
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: autoflex-api
    restart: unless-stopped
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/autoflex_inventory
      SPRING_DATASOURCE_USERNAME: autoflex
      SPRING_DATASOURCE_PASSWORD: autoflex123
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy

  # ─── Frontend (React) ──────────────────────────────
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: autoflex-web
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Comandos Úteis

```bash
# Subir apenas o banco (para desenvolvimento local)
docker compose up postgres -d

# Subir tudo
docker compose up -d --build

# Ver logs
docker compose logs -f

# Derrubar tudo
docker compose down

# Derrubar tudo + apagar dados do banco
docker compose down -v
```

---

## 5. 🗺️ Plano de Ação — Milestones

| # | Milestone | Escopo | Tempo Est. | Requisitos |
|---|---|---|---|---|
| **M0** | 🐳 **Infraestrutura** | `docker-compose.yml`, subir PostgreSQL, testar conexão | **30 min** | RNF004 |
| **M1** | ⚙️ **Backend — Scaffold** | Criar projeto Spring Boot, `pom.xml`, `application.properties`, Flyway migrations, entidades JPA, config CORS | **1h** | RNF002, RNF005, RNF007 |
| **M2** | ⚙️ **Backend — CRUD Products** | Repository, Service, DTO, Controller para `Product` | **1h30** | RF001 |
| **M3** | ⚙️ **Backend — CRUD Raw Materials** | Repository, Service, DTO, Controller para `RawMaterial` | **1h** | RF002 |
| **M4** | ⚙️ **Backend — Associação N:N** | CRUD `ProductRawMaterial` (associar insumos aos produtos) | **1h** | RF003 |
| **M5** | ⚙️ **Backend — Sugestão de Produção** | `ProductionSuggestionService` (algoritmo greedy), endpoint GET | **1h30** | RF004 |
| **M6** | 🧪 **Backend — Testes** | Testes unitários (Service) + testes de controller (MockMvc) | **1h30** | Desejável |
| **M7** | 🎨 **Frontend — Scaffold** | CRA + TypeScript, Redux store, roteamento, layout responsivo, sidebar | **1h** | RNF001, RNF003, RNF006 |
| **M8** | 🎨 **Frontend — CRUD Products** | Listagem, formulário criar/editar, deletar com confirmação | **2h** | RF005 |
| **M9** | 🎨 **Frontend — CRUD Raw Materials** | Listagem, formulário criar/editar, deletar | **1h30** | RF006 |
| **M10** | 🎨 **Frontend — Associação N:N** | Formulário de insumos dentro da tela de Produto | **1h30** | RF007 |
| **M11** | 🎨 **Frontend — Sugestão de Produção** | Tela com tabela + card de valor total | **1h** | RF008 |
| **M12** | 🧪 **Frontend — Testes** | Testes unitários (React Testing Library) + Cypress E2E | **2h** | Desejável |
| **M13** | 📦 **Dockerize & README** | Dockerfiles, docker-compose completo, README com instruções | **1h** | Entrega |

### Linha do Tempo Visual

```
M0 ──► M1 ──► M2 ──► M3 ──► M4 ──► M5 ──► M6
 │      │                                    │
 │      └──── BACKEND COMPLETO ──────────────┘
 │
 └──► M7 ──► M8 ──► M9 ──► M10 ──► M11 ──► M12
       │                                     │
       └──── FRONTEND COMPLETO ──────────────┘
                                              │
                                         M13 ◄┘
                                          │
                                      ✅ ENTREGA
```

### Resumo de Tempo

| Bloco | Tempo Estimado |
|---|---|
| Infraestrutura (M0) | **0h30** |
| Backend (M1–M6) | **7h30** |
| Frontend (M7–M12) | **9h00** |
| Empacotamento (M13) | **1h00** |
| **TOTAL** | **~18h** |

---

## 6. 📋 Mapa de Endpoints da API

| Método | Endpoint | Descrição | Controller Responsável |
|---|---|---|---|
| `GET` | `/api/products` | Listar todos os produtos (Full DTO) | `ProductController` |
| `GET` | `/api/products/{id}` | Buscar produto por ID | `ProductController` |
| `POST` | `/api/products` | Criar produto (sem insumos iniciais) | `ProductController` |
| `PUT` | `/api/products/{id}` | Atualizar dados básicos do produto | `ProductController` |
| `DELETE` | `/api/products/{id}` | Deletar produto | `ProductController` |
| `POST` | `/api/products/{id}/raw-materials` | Associar/Atualizar insumo no produto | `ProductController` |
| `DELETE` | `/api/products/{id}/raw-materials/{rmId}` | Remover insumo do produto | `ProductController` |
| `GET` | `/api/raw-materials` | Listar matérias-primas | `RawMaterialController` |
| `POST` | `/api/raw-materials` | Criar matéria-prima | `RawMaterialController` |
| `PUT` | `/api/raw-materials/{id}` | Atualizar (nome/estoque) | `RawMaterialController` |
| `DELETE` | `/api/raw-materials/{id}` | Deletar matéria-prima | `RawMaterialController` |
| `GET` | `/api/production/suggestion` | Calcular sugestão de produção | `ProductionController` |

---

## 7. 🔗 Rastreabilidade de Requisitos e Status

O projeto atingiu todos os milestones planejados, incluindo a documentação completa do código em inglês (Javadoc/TSDoc), conformidade com os requisitos funcionais de cadastro e lógica de negócio (Algoritmo Greedy), e padronização da interface do usuário.

| Requisito | Milestone | Arquivo(s) Chave | Status |
|---|---|---|---|
| RNF001 | M7 | `index.css` (layout flex) | ✅ Completo |
| RNF002 | M1 | Separação Docker Back/Front | ✅ Completo |
| RNF004 | M0 | `docker-compose.yml` | ✅ Completo |
| RNF007 | M1–M12 | **Comments added to all files** | ✅ Completo |
| RF001 | M2/M4 | `ProductService`, `ProductController` | ✅ Completo |
| RF002 | M3 | `RawMaterialService` | ✅ Completo |
| RF003 | M4/M10 | `ProductController`, `ProductsPage` | ✅ Completo |
| RF004 | M5/M11 | `ProductionService`, `ProductionPage` | ✅ Completo |