.PHONY: help install start stop test coverage stats clean db-start db-stop

# Couleurs pour l'affichage
GREEN  := \033[0;32m
YELLOW := \033[0;33m
BLUE   := \033[0;34m
RESET  := \033[0m

##@ Aide

help: ## Affiche ce message d'aide
	@echo "$(BLUE)OpenClassrooms P5 - Yoga App$(RESET)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make $(YELLOW)<target>$(RESET)\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(YELLOW)%-20s$(RESET) %s\n", $$1, $$2 } /^##@/ { printf "\n$(BLUE)%s$(RESET)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Installation

install: ## Installe toutes les dépendances (frontend + backend)
	@echo "$(GREEN)Installation des dépendances backend...$(RESET)"
	cd back && mvn clean install -DskipTests
	@echo "$(GREEN)Installation des dépendances frontend...$(RESET)"
	cd front && yarn install
	@echo "$(GREEN)✓ Installation terminée$(RESET)"

install-front: ## Installe uniquement les dépendances frontend
	@echo "$(GREEN)Installation des dépendances frontend...$(RESET)"
	cd front && yarn install

install-back: ## Installe uniquement les dépendances backend
	@echo "$(GREEN)Installation des dépendances backend...$(RESET)"
	cd back && mvn clean install -DskipTests

##@ Base de données

db-start: ## Démarre la base de données MySQL avec Docker
	@echo "$(GREEN)Démarrage de MySQL...$(RESET)"
	docker-compose up -d
	@echo "$(GREEN)✓ MySQL démarré$(RESET)"
	@echo "$(YELLOW)Database: test | User: user | Password: 123456$(RESET)"

db-stop: ## Arrête la base de données MySQL
	@echo "$(YELLOW)Arrêt de MySQL...$(RESET)"
	docker-compose down

db-logs: ## Affiche les logs de la base de données
	docker-compose logs -f

##@ Développement

start: ## Démarre le backend et le frontend en parallèle
	@echo "$(GREEN)Démarrage de l'application...$(RESET)"
	@echo "$(YELLOW)Backend: http://localhost:8080$(RESET)"
	@echo "$(YELLOW)Frontend: http://localhost:4200$(RESET)"
	@$(MAKE) -j2 start-back start-front

start-back: ## Démarre uniquement le backend
	@echo "$(GREEN)Démarrage du backend...$(RESET)"
	cd back && mvn spring-boot:run

start-front: ## Démarre uniquement le frontend
	@echo "$(GREEN)Démarrage du frontend...$(RESET)"
	cd front && yarn start

##@ Tests

test: ## Lance tous les tests (frontend + backend)
	@$(MAKE) test-back
	@$(MAKE) test-front

test-front: ## Lance les tests frontend (Jest)
	@echo "$(GREEN)Lancement des tests frontend...$(RESET)"
	cd front && yarn test

test-back: ## Lance les tests backend
	@echo "$(GREEN)Lancement des tests backend...$(RESET)"
	cd back && mvn verify

test-e2e: ## Lance les tests E2E avec Cypress
	@echo "$(GREEN)Lancement des tests E2E...$(RESET)"
	cd front && yarn cypress:run

test-e2e-open: ## Ouvre l'interface Cypress
	@echo "$(GREEN)Ouverture de Cypress...$(RESET)"
	cd front && yarn cypress:open

##@ Coverage

coverage: ## Génère les rapports de coverage (frontend + backend)
	@$(MAKE) coverage-back
	@$(MAKE) coverage-front
	@$(MAKE) coverage-summary

coverage-front: ## Génère le coverage frontend (tous les tests)
	@echo "$(GREEN)Génération du coverage frontend...$(RESET)"
	cd front && yarn test:coverage
	@echo "$(BLUE)Rapport: front/coverage/jest/index.html$(RESET)"

coverage-front-unit: ## Génère le coverage frontend (tests unitaires uniquement)
	@echo "$(GREEN)Génération du coverage frontend unitaire...$(RESET)"
	cd front && yarn test:coverage:unit
	@echo "$(BLUE)Rapport: front/coverage/unit/index.html$(RESET)"

coverage-front-integration: ## Génère le coverage frontend (tests d'intégration uniquement)
	@echo "$(GREEN)Génération du coverage frontend intégration...$(RESET)"
	cd front && yarn test:coverage:integration
	@echo "$(BLUE)Rapport: front/coverage/integration/index.html$(RESET)"

coverage-front-all: ## Génère les deux rapports de coverage frontend séparés
	@echo "$(GREEN)Génération de tous les rapports frontend...$(RESET)"
	cd front && yarn test:coverage:all

coverage-back: ## Génère le coverage backend (JaCoCo)
	@echo "$(GREEN)Génération du coverage backend...$(RESET)"
	cd back && mvn clean verify
	@echo "$(BLUE)Rapport: back/target/site/jacoco/index.html$(RESET)"

coverage-e2e: ## Génère le coverage E2E
	@echo "$(GREEN)Génération du coverage E2E...$(RESET)"
	cd front && yarn cypress:run
	cd front && yarn e2e:coverage
	@echo "$(BLUE)Rapport: front/coverage/lcov-report/index.html$(RESET)"

coverage-summary: ## Affiche un résumé des rapports de coverage
	@echo ""
	@echo "$(BLUE)═══════════════════════════════════════════════════════$(RESET)"
	@echo "$(BLUE)           RAPPORTS DE COVERAGE DISPONIBLES$(RESET)"
	@echo "$(BLUE)═══════════════════════════════════════════════════════$(RESET)"
	@echo ""
	@echo "$(YELLOW)Frontend (Jest):$(RESET)"
	@echo "  • Global:        front/coverage/jest/index.html"
	@echo "  • Unitaire:      front/coverage/unit/index.html"
	@echo "  • Intégration:   front/coverage/integration/index.html"
	@echo ""
	@echo "$(YELLOW)Backend (JaCoCo):$(RESET)"
	@echo "  • Global:        back/target/site/jacoco/index.html"
	@echo ""
	@echo "$(YELLOW)E2E (Cypress):$(RESET)"
	@echo "  • Global:        front/coverage/lcov-report/index.html"
	@echo ""

##@ Statistiques

stats: ## Affiche les statistiques des tests
	@echo "$(BLUE)═══════════════════════════════════════════════════════$(RESET)"
	@echo "$(BLUE)           STATISTIQUES DES TESTS$(RESET)"
	@echo "$(BLUE)═══════════════════════════════════════════════════════$(RESET)"
	@echo ""
	@echo "$(YELLOW)Frontend:$(RESET)"
	@$(MAKE) stats-front
	@echo ""
	@echo "$(YELLOW)Backend:$(RESET)"
	@$(MAKE) stats-back

stats-front: ## Statistiques des tests frontend (% intégration)
	@cd front/src && \
	unit=$$(find . -name "*.spec.ts" ! -name "*.integration.spec.ts" 2>/dev/null | wc -l | tr -d ' ') && \
	integration=$$(find . -name "*.integration.spec.ts" 2>/dev/null | wc -l | tr -d ' ') && \
	total=$$((unit + integration)) && \
	if [ $$total -gt 0 ]; then \
		pct=$$(awk "BEGIN {printf \"%.2f\", ($$integration / $$total) * 100}"); \
		echo "  Tests unitaires:      $$unit"; \
		echo "  Tests d'intégration:  $$integration"; \
		echo "  Total:                $$total"; \
		echo "  Pourcentage intégr.:  $$pct%"; \
		if [ $$(echo "$$pct >= 30" | bc -l) -eq 1 ]; then \
			echo "  $(GREEN)✓ Objectif OpenClassrooms atteint (≥30%)$(RESET)"; \
		else \
			echo "  $(YELLOW)✗ Objectif non atteint (nécessite ≥30%)$(RESET)"; \
		fi; \
	else \
		echo "  $(YELLOW)Aucun test trouvé$(RESET)"; \
	fi

stats-back: ## Statistiques des tests backend (% intégration)
	@cd back/src/test/java && \
	unit=$$(find . -name "*Test.java" ! -name "*IntegrationTest.java" 2>/dev/null | wc -l | tr -d ' ') && \
	integration=$$(find . -name "*IntegrationTest.java" 2>/dev/null | wc -l | tr -d ' ') && \
	total=$$((unit + integration)) && \
	if [ $$total -gt 0 ]; then \
		pct=$$(awk "BEGIN {printf \"%.2f\", ($$integration / $$total) * 100}"); \
		echo "  Tests unitaires:      $$unit"; \
		echo "  Tests d'intégration:  $$integration"; \
		echo "  Total:                $$total"; \
		echo "  Pourcentage intégr.:  $$pct%"; \
		if [ $$(echo "$$pct >= 30" | bc -l) -eq 1 ]; then \
			echo "  $(GREEN)✓ Objectif OpenClassrooms atteint (≥30%)$(RESET)"; \
		else \
			echo "  $(YELLOW)✗ Objectif non atteint (nécessite ≥30%)$(RESET)"; \
		fi; \
	else \
		echo "  $(YELLOW)Aucun test trouvé$(RESET)"; \
	fi

##@ Nettoyage

clean: ## Nettoie les fichiers générés (coverage, build, etc.)
	@echo "$(YELLOW)Nettoyage des fichiers générés...$(RESET)"
	cd front && rm -rf coverage .angular dist node_modules/.cache
	cd back && mvn clean
	@echo "$(GREEN)✓ Nettoyage terminé$(RESET)"

clean-coverage: ## Nettoie uniquement les rapports de coverage
	@echo "$(YELLOW)Nettoyage des rapports de coverage...$(RESET)"
	rm -rf front/coverage back/target/site/jacoco
	@echo "$(GREEN)✓ Coverage nettoyée$(RESET)"

##@ Divers

all: install db-start ## Installation complète + démarrage de la DB
	@echo "$(GREEN)✓ Environnement prêt !$(RESET)"
	@echo "$(YELLOW)Lancez 'make start' pour démarrer l'application$(RESET)"
