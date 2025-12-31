# Scripts de configuration PostgreSQL

## Créer la base de données

### Méthode 1 : Avec psql

```bash
psql -U postgres -f create-database.sql
```

### Méthode 2 : Manuellement

```bash
psql -U postgres
```

Puis exécutez :
```sql
CREATE DATABASE cityreport;
```

### Méthode 3 : Avec Docker

Si vous utilisez Docker, la base de données est créée automatiquement avec la commande :

```bash
docker run --name postgres-cityreport \
  -e POSTGRES_DB=cityreport \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15
```



