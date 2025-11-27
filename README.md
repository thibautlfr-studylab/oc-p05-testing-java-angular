# Yoga App - Savasana

Application full-stack de réservation de sessions de yoga pour le studio Savasana.

## Description

Application de gestion et de réservation de sessions de yoga avec :
- **Backend** : API REST Spring Boot avec authentification JWT
- **Frontend** : Application web Angular avec Material Design
- **Base de données** : MySQL

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :
- **Java JDK** : version 8 (1.8) minimum - le projet utilise Java 8 mais fonctionne avec Java 11+
- **Node.js** : version 16 ou supérieure
- **MySQL** : version 8.0 ou Docker
- **Maven** : version 3.6 ou supérieure
- **Angular CLI** : version 14

```bash
# Vérifier les versions installées
java -version
node -v
npm -v
mvn -v
ng version
```

## Structure du projet

```
.
├── back/                    # Backend Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/openclassrooms/starterjwt/
│   │   │   │   ├── controllers/      # Contrôleurs REST
│   │   │   │   ├── dto/              # Data Transfer Objects
│   │   │   │   ├── models/           # Entités JPA
│   │   │   │   ├── repository/       # Repositories Spring Data
│   │   │   │   ├── security/         # Configuration JWT et sécurité
│   │   │   │   ├── services/         # Logique métier
│   │   │   │   └── mapper/           # Mappers MapStruct
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                     # Tests unitaires et d'intégration
│   └── pom.xml
│
├── front/                   # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/          # Composants partagés
│   │   │   ├── features/            # Modules fonctionnels
│   │   │   │   ├── auth/            # Authentification
│   │   │   │   └── sessions/        # Gestion des sessions
│   │   │   ├── guards/              # Guards de routing
│   │   │   ├── interceptors/        # Intercepteurs HTTP
│   │   │   ├── interfaces/          # Interfaces TypeScript
│   │   │   └── services/            # Services API
│   │   └── assets/
│   ├── cypress/                     # Tests E2E
│   └── package.json
│
├── ressources/
│   ├── sql/
│   │   └── script.sql               # Script d'initialisation DB
│   └── postman/
│       └── yoga.postman_collection.json
│
└── docker-compose.yml               # Configuration Docker MySQL
```

## Installation

### 1. Installation de la base de données

#### Option A : Avec Docker (recommandé)

```bash
# Lancer MySQL avec Docker Compose
docker-compose up -d

# Vérifier que le conteneur est démarré
docker ps

# Voir les logs
docker-compose logs mysql
```

La base de données sera automatiquement initialisée avec le script `ressources/sql/script.sql`.

**Informations de connexion :**
- Host : `localhost`
- Port : `3306`
- Database : `test`
- User : `user`
- Password : `123456`

#### Option B : Installation manuelle de MySQL

1. Installer MySQL 8.0
2. Créer une base de données nommée `test`
3. Exécuter le script SQL :
   ```bash
   mysql -u user -p test < ressources/sql/script.sql
   ```
4. Configurer les identifiants dans `back/src/main/resources/application.properties` si nécessaire

### 2. Installation du Backend

```bash
# Se placer dans le dossier back
cd back

# Installer les dépendances Maven
mvn clean install

# Retourner à la racine
cd ..
```

### 3. Installation du Frontend

```bash
# Se placer dans le dossier front
cd front

# Installer les dépendances npm
npm install

# Retourner à la racine
cd ..
```

## Lancement de l'application

**IMPORTANT** : Les composants doivent être lancés dans cet ordre :

### 1. Démarrer la base de données

```bash
# Si vous utilisez Docker
docker-compose up -d
```

### 2. Démarrer le backend

```bash
cd back
mvn spring-boot:run
```

Le serveur backend démarre sur **http://localhost:8080**

### 3. Démarrer le frontend

```bash
# Dans un nouveau terminal
cd front
npm run start
```

L'application frontend est accessible sur **http://localhost:4200**

## Comptes de test

### Compte Administrateur
- **Email** : `yoga@studio.com`
- **Mot de passe** : `test!1234`

**Fonctionnalités admin :**
- Créer des sessions de yoga
- Modifier des sessions
- Supprimer des sessions
- Voir la liste des participants

### Compte Utilisateur
Vous pouvez créer un compte utilisateur via la page d'inscription.

**Fonctionnalités utilisateur :**
- Consulter les sessions disponibles
- S'inscrire à une session
- Se désinscrire d'une session
- Consulter son profil

## Commandes utiles

### Backend

```bash
cd back

# Lancer l'application
mvn spring-boot:run

# Compiler le projet
mvn clean compile

# Nettoyer et reconstruire
mvn clean install
```

### Frontend

```bash
cd front

# Démarrer le serveur de développement
npm run start

# Builder le projet pour la production
ng build

# Linter le code
npm run lint
```

### Base de données

```bash
# Démarrer MySQL
docker-compose up -d

# Arrêter MySQL
docker-compose down

# Arrêter et supprimer les données
docker-compose down -v

# Voir les logs MySQL
docker-compose logs -f mysql

# Se connecter à MySQL
docker exec -it yoga-app-mysql mysql -u user -p
```

## Technologies utilisées

### Backend
- **Spring Boot** 2.6.1
- **Spring Security** avec JWT
- **Spring Data JPA** avec Hibernate
- **MySQL** 8.0
- **MapStruct** 1.5.1 (mapping DTO/entités)
- **Lombok** (réduction du boilerplate)
- **Maven**

### Frontend
- **Angular** 14
- **Angular Material** (composants UI)
- **RxJS** (programmation réactive)
- **TypeScript**

### Outils de développement
- **Postman** (collection disponible dans `ressources/postman/`)
- **Docker** & **Docker Compose**

## API Endpoints

Le backend expose une API REST sur `http://localhost:8080/api` :

### Authentification
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter

### Sessions
- `GET /api/session` - Liste des sessions
- `GET /api/session/{id}` - Détail d'une session
- `POST /api/session` - Créer une session (admin)
- `PUT /api/session/{id}` - Modifier une session (admin)
- `DELETE /api/session/{id}` - Supprimer une session (admin)
- `POST /api/session/{id}/participate/{userId}` - Participer à une session
- `DELETE /api/session/{id}/participate/{userId}` - Se désinscrire d'une session

### Professeurs
- `GET /api/teacher` - Liste des professeurs
- `GET /api/teacher/{id}` - Détail d'un professeur

### Utilisateurs
- `GET /api/user/{id}` - Détail d'un utilisateur
- `DELETE /api/user/{id}` - Supprimer son compte

## Ressources

- **Collection Postman** : `ressources/postman/yoga.postman_collection.json`
- **Script SQL** : `ressources/sql/script.sql`

Pour importer la collection Postman, suivez la [documentation officielle](https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-data-into-postman).

## Tests

_Section à compléter une fois les tests implémentés._

## Problèmes courants

### Le backend ne démarre pas
- Vérifiez que MySQL est démarré et accessible sur le port 3306
- Vérifiez les identifiants dans `back/src/main/resources/application.properties`

### Le frontend ne se connecte pas au backend
- Vérifiez que le backend est démarré sur le port 8080
- Vérifiez que le frontend pointe vers `http://localhost:8080` dans les services

### Problème d'encodage dans la base de données
- Le docker-compose est configuré pour UTF-8 (`utf8mb4`)
- Si vous utilisez MySQL manuellement, assurez-vous d'utiliser le charset `utf8mb4`

## Auteurs

Projet réalisé dans le cadre du parcours OpenClassrooms - Développeur Full-Stack Java et Angular.

## Licence

Ce projet est un projet éducatif.
