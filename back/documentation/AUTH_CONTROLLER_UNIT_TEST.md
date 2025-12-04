## Contexte technique : le cas `AuthController`

Dans le cadre du projet, les contrôleurs comme `AuthController` sont principalement validés par des **Tests d'Intégration** (`@SpringBootTest`). Ces tests sont réalistes : ils chargent le contexte Spring complet et utilisent une base de données.

Cependant, ce réalisme crée un paradoxe pour la couverture de code à 100% :

- **Le Code** : Une sécurité défensive est présente : `if (user != null)`.
- **Le Problème** : L'étape précédente (`authenticationManager`) garantit techniquement que l'utilisateur existe. Dans un scénario réel ou un test d'intégration, il est donc impossible d'atteindre le `else` (cas où l'user est `null`).
- **La Solution** : Pour couvrir cette ligne, nous devons sortir du test d'intégration et écrire un **Test Unitaire isolé** (avec Mockito). Cela nous permet de "mentir" au code en simulant une authentification réussie suivie d'une disparition de l'utilisateur en base.

## Pourquoi tester une condition "impossible" ?

Il peut sembler inutile de tester un cas qui n'arrive jamais (`user == null` après authentification). Cependant, conserver et tester cette branche est crucial pour trois raisons majeures :

### Programmation défensive & évolutivité

Le code d'aujourd'hui n'est pas celui de demain.

- **Le Risque** : Si l'architecture d'authentification change (passage à un LDAP, OAuth2, SSO Google) et que la synchronisation avec la base locale échoue ou prend du retard.
- **L'Impact** : L'authentification externe réussit, mais l'utilisateur n'est pas trouvé localement.
- **Bénéfice** : Ce `if` agit comme un filet de sécurité. Le tester garantit que l'application ne crashera pas (`NullPointerException`) si l'architecture évolue.

### Cas limites & concurrence

Dans les systèmes distribués ou à fort trafic, l'impossible devient probable.

- **Le Scénario (Race Condition)** : Un administrateur supprime un compte utilisateur exactement durant la milliseconde qui s'écoule entre l'authentification du token et la récupération des droits en base.
- **Bénéfice** : Bien que statistiquement rare, ce cas provoquerait une erreur 500 fatale sans cette vérification. Le test assure la robustesse du système.

### Hygiène de code (Qualité)

En qualité logicielle (Clean Code), chaque ligne doit être justifiée.

**Le Principe** :
- Soit la ligne est **utile** (sécurité) -> Elle doit être **testée**.
- Soit la ligne est **inutile** -> C'est du **code mort**, il faut la supprimer.

**Conclusion** : Puisque nous décidons de garder cette sécurité pour les raisons A et B, nous avons l'obligation de la tester. Ne pas le faire créerait une "dette technique" invisible.