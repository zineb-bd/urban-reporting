# Urban Reporting Backend

Backend Spring Boot pour le système de signalement urbain.

## Technologies utilisées

- Spring Boot 3.4.0
- Spring Security avec JWT
- Spring Data JPA
- Lombok (réduction du code boilerplate)
- H2 Database (développement)
- PostgreSQL (production)
- Maven
- Java 21

## Configuration

### Base de données

Par défaut, le projet utilise H2 en mémoire pour le développement. Les données sont perdues au redémarrage.

Pour utiliser PostgreSQL en production, modifiez `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/cityreport
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

## Utilisateurs de démonstration

Le projet crée automatiquement des utilisateurs de test au démarrage:

- **Admin**: admin@mail.com / admin123
- **Technicien**: technicien@mail.com / technicien123
- **Citoyen**: citoyen@mail.com / citoyen123

## API Endpoints

### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Signalements

- `GET /api/signalements/public` - Liste publique des signalements (sans authentification)
- `GET /api/signalements` - Liste des signalements (authentifié)
- `GET /api/signalements/mes-signalements` - Mes signalements (citoyen)
- `GET /api/signalements/{id}` - Détails d'un signalement
- `POST /api/signalements` - Créer un signalement
- `PATCH /api/signalements/{id}/statut` - Mettre à jour le statut
- `DELETE /api/signalements/{id}` - Supprimer un signalement

## Démarrage

```bash
mvn spring-boot:run
```

Le serveur démarre sur `http://localhost:8080`

La console H2 est disponible sur `http://localhost:8080/h2-console`

## CORS

Le backend est configuré pour accepter les requêtes depuis:
- http://localhost:3000
- http://localhost:3001

Modifiez `SecurityConfig.java` pour ajouter d'autres origines si nécessaire.

## Améliorations récentes

Le backend a été amélioré avec les meilleures pratiques Spring Boot :

- ✅ Utilisation de Lombok pour réduire le code boilerplate
- ✅ Système de gestion d'exceptions global avec `@RestControllerAdvice`
- ✅ Exceptions personnalisées (ResourceNotFoundException, BadRequestException, etc.)
- ✅ Validations améliorées dans les DTOs
- ✅ Gestion améliorée des permissions et de la sécurité
- ✅ Configuration optimisée

Voir [AMELIORATIONS.md](./AMELIORATIONS.md) pour plus de détails.

