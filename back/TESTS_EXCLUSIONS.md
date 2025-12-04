# Explication des Exclusions de Tests
Ce document explique pourquoi certains packages et classes ont été exclus de l'analyse de la couverture de code par JaCoCo dans ce projet backend.

## Contexte
L'objectif principal des tests est de valider la logique métier de l'application et de s'assurer que les fonctionnalités se comportent comme prévu. Le code qui ne contient pas de logique métier complexe, qui est généré automatiquement ou qui fait partie de l'infrastructure du framework peut souvent être exclu pour se concentrer sur les parties les plus critiques de l'application.
Voici la liste des exclusions configurées dans le `pom.xml` et les raisons associées :

### `**/dto/**`
Les DTO (Data Transfer Objects) sont de simples objets de transfert de données sans logique métier. Ils sont utilisés pour transporter des données entre les couches de l'application. Les tester n'apporterait aucune valeur ajoutée.

### `**/models/**`
Les modèles sont des entités JPA qui représentent la structure de la base de données. Ils contiennent principalement des champs et des annotations. Leur bon fonctionnement est validé indirectement par les tests d'intégration qui interagissent avec la base de données.

### `**/payload/**`
Similaires aux DTOs, les objets `payload` sont utilisés pour structurer les requêtes et les réponses de l'API. Ils ne contiennent pas de logique métier à tester.

### `**/mapper/**`
Les mappers sont des interfaces MapStruct. Le code d'implémentation est généré automatiquement lors de la compilation. Tester ce code reviendrait à tester la bibliothèque MapStruct elle-même, ce qui n'est pas de notre responsabilité.

### `**/repository/**`
Les repositories sont des interfaces Spring Data JPA. Spring Data génère les implémentations de ces interfaces au moment de l'exécution. Nous testons leur comportement à travers les tests d'intégration des services qui les utilisent.

### `**/security/**`
La configuration de la sécurité (comme `WebSecurityConfig`) et les filtres sont des éléments d'infrastructure complexes à tester de manière unitaire. Leur efficacité est mieux validée par des tests d'intégration qui simulent des requêtes authentifiées et non authentifiées à l'API.

### `**/exception/**`
Ce package contient des classes d'exception personnalisées. Ce sont de simples classes qui héritent d'autres exceptions et ne contiennent aucune logique métier.

### `**/SpringBootSecurityJwtApplication.class`
Il s'agit de la classe principale de l'application Spring Boot, son point d'entrée. Elle est utilisée pour lancer l'application et n'a pas de logique métier à tester.