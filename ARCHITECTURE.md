# Architecture Logicielle - Urban Reporting

Ce document présente l'architecture logicielle du système de signalement urbain.

## Vue d'ensemble de l'architecture

```mermaid
graph TB
    subgraph "Client (Navigateur)"
        UI[Interface Utilisateur<br/>Next.js + React]
        Auth[Auth Context<br/>Gestion authentification]
        Storage[LocalStorage<br/>Token & User]
    end

    subgraph "Frontend - Next.js (Port 3000)"
        Pages[Pages Next.js<br/>/login, /signalements, etc.]
        Components[Composants UI<br/>shadcn/ui + Radix]
        API_Calls[Appels API<br/>Fetch vers Backend]
    end

    subgraph "Backend - Spring Boot (Port 8080)"
        Controllers[Controllers<br/>REST API]
        Services[Services<br/>Logique métier]
        Repositories[Repositories<br/>Accès données]
        Security[Spring Security<br/>+ JWT]
    end

    subgraph "Base de données"
        PostgreSQL[(PostgreSQL<br/>Production)]
        H2[(H2<br/>Développement)]
    end

    UI --> Pages
    Pages --> Components
    Pages --> Auth
    Auth --> Storage
    Auth --> API_Calls
    API_Calls -->|HTTP/REST| Controllers
    Controllers --> Security
    Security --> Services
    Services --> Repositories
    Repositories --> PostgreSQL
    Repositories --> H2
```

## Architecture en couches du Backend

```mermaid
graph TD
    subgraph "Couche Présentation (Presentation Layer)"
        AuthCtrl[AuthController<br/>/api/auth/*]
        SignalCtrl[SignalementController<br/>/api/signalements/*]
        ExceptionHandler[GlobalExceptionHandler<br/>Gestion erreurs]
    end

    subgraph "Couche Sécurité (Security Layer)"
        SecurityConfig[SecurityConfig<br/>Configuration sécurité]
        JwtFilter[JwtAuthenticationFilter<br/>Validation JWT]
        JwtUtil[JwtUtil<br/>Génération/Validation tokens]
        UserDetailsService[CustomUserDetailsService<br/>Chargement utilisateurs]
    end

    subgraph "Couche Métier (Business Layer)"
        UserService[UserService<br/>Gestion utilisateurs]
        SignalementService[SignalementService<br/>Gestion signalements]
    end

    subgraph "Couche Persistance (Data Layer)"
        UserRepo[UserRepository<br/>JPA Interface]
        SignalRepo[SignalementRepository<br/>JPA Interface]
    end

    subgraph "Couche Modèle (Model Layer)"
        User[User Entity]
        Signalement[Signalement Entity]
        DTOs[DTOs<br/>Request/Response]
    end

    AuthCtrl --> SecurityConfig
    SignalCtrl --> SecurityConfig
    SecurityConfig --> JwtFilter
    JwtFilter --> JwtUtil
    JwtFilter --> UserDetailsService
    AuthCtrl --> UserService
    SignalCtrl --> SignalementService
    UserService --> UserRepo
    SignalementService --> SignalRepo
    SignalementService --> UserService
    UserRepo --> User
    SignalRepo --> Signalement
    UserService --> DTOs
    SignalementService --> DTOs
    ExceptionHandler --> AuthCtrl
    ExceptionHandler --> SignalCtrl
```

## Flux d'authentification

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend<br/>(Next.js)
    participant AC as AuthController
    participant AM as AuthenticationManager
    participant US as UserService
    participant JWT as JwtUtil
    participant DB as PostgreSQL

    U->>F: Saisit email/password
    F->>AC: POST /api/auth/login
    AC->>AM: authenticate(email, password)
    AM->>US: loadUserByUsername(email)
    US->>DB: SELECT user WHERE email
    DB-->>US: User
    US-->>AM: UserDetails
    AM-->>AC: Authentication
    AC->>JWT: generateToken(userDetails, role)
    JWT-->>AC: JWT Token
    AC-->>F: {token, user}
    F->>F: Stocke token dans localStorage
    F->>F: Stocke user dans localStorage
    F-->>U: Redirection selon rôle
```

## Flux de création d'un signalement

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend<br/>(React Component)
    participant SC as SignalementController
    participant SS as SignalementService
    participant US as UserService
    participant SR as SignalementRepository
    participant DB as PostgreSQL

    U->>F: Remplit formulaire signalement
    F->>F: Validation (Zod)
    F->>SC: POST /api/signalements<br/>{Authorization: Bearer token}
    SC->>SC: Extract user from JWT
    SC->>US: findByEmail(email)
    US->>DB: SELECT user
    DB-->>US: User
    US-->>SC: User
    SC->>SS: create(request, user)
    SS->>SS: Validation métier
    SS->>SR: save(signalement)
    SR->>DB: INSERT signalement
    DB-->>SR: Signalement créé
    SR-->>SS: Signalement
    SS-->>SC: Signalement
    SC-->>F: 201 Created + Signalement
    F-->>U: Confirmation + Redirection
```

## Structure du Frontend

```mermaid
graph LR
    subgraph "Pages Next.js"
        Home[page.tsx<br/>Accueil]
        Login[login/page.tsx]
        Register[inscription/page.tsx]
        SignalList[signalements/page.tsx]
        SignalNew[signalements/nouveau/page.tsx]
        SignalDetail[signalements/[id]/page.tsx]
        MesSignals[mes-signalements/page.tsx]
        AdminDash[admin/dashboard/page.tsx]
        TechDash[technicien/dashboard/page.tsx]
    end

    subgraph "Composants UI"
        UI[components/ui/<br/>Button, Card, Form, etc.]
        Layout[components/<br/>Header, Footer, etc.]
    end

    subgraph "Logique Métier"
        AuthContext[lib/auth-context.tsx<br/>Gestion authentification]
        Utils[lib/utils.ts<br/>Utilitaires]
    end

    subgraph "Styling"
        Tailwind[Tailwind CSS<br/>Styling]
        GlobalCSS[globals.css]
    end

    Home --> UI
    Login --> AuthContext
    Login --> UI
    Register --> AuthContext
    Register --> UI
    SignalList --> UI
    SignalNew --> UI
    SignalNew --> AuthContext
    SignalDetail --> UI
    MesSignals --> AuthContext
    MesSignals --> UI
    AdminDash --> AuthContext
    TechDash --> AuthContext
    UI --> Tailwind
    Layout --> UI
```

## Stack technologique détaillée

### Frontend
- **Framework**: Next.js 16.0.10 (React 19.2.0)
- **Langage**: TypeScript 5
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI + shadcn/ui
- **Formulaires**: React Hook Form + Zod
- **Cartes**: Leaflet + React Leaflet
- **Gestion d'état**: React Context API
- **Stockage local**: LocalStorage
- **Build**: Next.js (Webpack/Turbopack)

### Backend
- **Framework**: Spring Boot 3.4.0
- **Langage**: Java 21
- **Sécurité**: Spring Security + JWT (jjwt 0.12.3)
- **ORM**: Spring Data JPA + Hibernate
- **Build**: Maven
- **Outils**: Lombok (réduction boilerplate)
- **Validation**: Spring Boot Validation
- **API**: REST

### Base de données
- **Production**: PostgreSQL
  - Port: 5432
  - Base: cityreport
  - Pool: HikariCP (10 connexions max)
- **Développement**: H2 (optionnel)
  - En mémoire
  - Console: /h2-console

### Communication
- **Protocol**: HTTP/HTTPS
- **Format**: JSON
- **CORS**: Configuré pour localhost:3000 et localhost:3001
- **Authentification**: Bearer Token (JWT)

## Endpoints API principaux

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Signalements
- `GET /api/signalements/public` - Liste publique (sans auth)
- `GET /api/signalements` - Liste complète (auth requise)
- `GET /api/signalements/mes-signalements` - Mes signalements (citoyen)
- `GET /api/signalements/{id}` - Détails d'un signalement
- `POST /api/signalements` - Créer un signalement
- `PATCH /api/signalements/{id}/statut` - Mettre à jour le statut
- `DELETE /api/signalements/{id}` - Supprimer un signalement

## Rôles utilisateurs

```mermaid
graph LR
    subgraph "Rôles"
        CITOYEN[CITOYEN<br/>Crée/consulte ses signalements]
        TECHNICIEN[TECHNICIEN<br/>Gère les signalements]
        ADMIN[ADMIN<br/>Administration complète]
    end

    subgraph "Permissions"
        P1[Créer signalement]
        P2[Consulter ses signalements]
        P3[Modifier statut]
        P4[Consulter tous signalements]
        P5[Gérer utilisateurs]
    end

    CITOYEN --> P1
    CITOYEN --> P2
    TECHNICIEN --> P3
    TECHNICIEN --> P4
    ADMIN --> P4
    ADMIN --> P5
```

## Déploiement

```mermaid
graph TB
    subgraph "Environnement de développement"
        DevFront[Next.js Dev Server<br/>localhost:3000]
        DevBack[Spring Boot<br/>localhost:8080]
        DevDB[(H2 Memory)]
    end

    subgraph "Environnement de production"
        ProdFront[Next.js Build<br/>Static/SSR]
        ProdBack[Spring Boot JAR<br/>Port 8080]
        ProdDB[(PostgreSQL<br/>Port 5432)]
    end

    DevFront -->|HTTP| DevBack
    DevBack --> DevDB
    ProdFront -->|HTTP| ProdBack
    ProdBack --> ProdDB
```

## Sécurité

- **Authentification**: JWT (JSON Web Tokens)
- **Expiration token**: 86400000ms (24h)
- **Validation**: Spring Security + JwtAuthenticationFilter
- **CORS**: Configuration restrictive
- **Validation données**: Bean Validation (Jakarta)
- **Mot de passe**: Encodage via Spring Security BCrypt



