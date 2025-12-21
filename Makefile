.PHONY: help install clean stats test\:back test\:back\:unit test\:back\:integration test\:front test\:front\:unit test\:front\:integration test\:e2e

# Couleurs
GREEN  := \033[0;32m
YELLOW := \033[0;33m
BLUE   := \033[0;34m
CYAN   := \033[0;36m
RED    := \033[0;31m
RESET  := \033[0m
BOLD   := \033[1m

help: ## Affiche cette aide
	@echo "$(BOLD)$(BLUE)=== Yoga App - Commandes disponibles ===$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_\\:]+:.*?## .*$$' $(MAKEFILE_LIST) | sed 's/\\:/:/g; s/: *## /##/' | awk -F'##' '{printf "  $(CYAN)%-15s$(RESET) %s\n", $$1, $$2}'
	@echo ""

install: ## Installe tout (backend, frontend, database)
	@echo "$(BOLD)$(BLUE)=== Installation complete ===$(RESET)"
	@echo ""
	@echo "$(CYAN)Demarrage de la base de donnees...$(RESET)"
	@docker compose up -d
	@echo "$(GREEN)Base de donnees demarree$(RESET)"
	@echo ""
	@echo "$(CYAN)Installation des dependances backend...$(RESET)"
	@cd back && mvn dependency:resolve -q
	@echo "$(GREEN)Dependances backend installees$(RESET)"
	@echo ""
	@echo "$(CYAN)Installation des dependances frontend...$(RESET)"
	@cd front && yarn install
	@echo "$(GREEN)Dependances frontend installees$(RESET)"
	@echo ""
	@echo "$(BOLD)$(GREEN)=== Installation terminee ===$(RESET)"

clean: ## Nettoie tout (backend, frontend, database avec volumes)
	@echo "$(BOLD)$(BLUE)=== Nettoyage complet ===$(RESET)"
	@echo ""
	@echo "$(CYAN)Arret et suppression de la base de donnees (avec volumes)...$(RESET)"
	@docker compose down -v 2>/dev/null || true
	@echo "$(GREEN)Base de donnees supprimee$(RESET)"
	@echo ""
	@echo "$(CYAN)Nettoyage du backend...$(RESET)"
	@cd back && mvn clean -q
	@rm -rf back/target
	@echo "$(GREEN)Backend nettoye$(RESET)"
	@echo ""
	@echo "$(CYAN)Nettoyage du frontend...$(RESET)"
	@rm -rf front/node_modules
	@rm -rf front/coverage
	@rm -rf front/.angular
	@echo "$(GREEN)Frontend nettoye$(RESET)"
	@echo ""
	@echo "$(BOLD)$(GREEN)=== Nettoyage termine ===$(RESET)"

stats: ## Affiche les statistiques des tests (unitaires vs integration)
	@echo "$(BOLD)$(BLUE)=== Statistiques des tests ===$(RESET)"
	@echo ""
	@echo "$(CYAN)Frontend:$(RESET)"
	@unit=$$(find front/src -name "*.spec.ts" ! -name "*.integration.spec.ts" 2>/dev/null | wc -l | tr -d ' '); \
	integration=$$(find front/src -name "*.integration.spec.ts" 2>/dev/null | wc -l | tr -d ' '); \
	total=$$((unit + integration)); \
	if [ $$total -gt 0 ]; then \
		pct=$$(awk "BEGIN {printf \"%.1f\", ($$integration / $$total) * 100}"); \
		echo "  Tests unitaires:        $(YELLOW)$$unit$(RESET)"; \
		echo "  Tests integration:      $(YELLOW)$$integration$(RESET)"; \
		echo "  Pourcentage integration: $(GREEN)$$pct%$(RESET)"; \
	else \
		echo "  $(RED)Aucun test trouve$(RESET)"; \
	fi
	@echo ""
	@echo "$(CYAN)Backend:$(RESET)"
	@unit=$$(find back/src/test -name "*Test.java" ! -name "*IntegrationTest.java" 2>/dev/null | wc -l | tr -d ' '); \
	integration=$$(find back/src/test -name "*IntegrationTest.java" 2>/dev/null | wc -l | tr -d ' '); \
	total=$$((unit + integration)); \
	if [ $$total -gt 0 ]; then \
		pct=$$(awk "BEGIN {printf \"%.1f\", ($$integration / $$total) * 100}"); \
		echo "  Tests unitaires:        $(YELLOW)$$unit$(RESET)"; \
		echo "  Tests integration:      $(YELLOW)$$integration$(RESET)"; \
		echo "  Pourcentage integration: $(GREEN)$$pct%$(RESET)"; \
	else \
		echo "  $(RED)Aucun test trouve$(RESET)"; \
	fi

test\:back: ## Lance tous les tests backend (unitaires + integration)
	@echo "$(BOLD)$(BLUE)=== Tests Backend (tous) ===$(RESET)"
	@echo ""
	@echo "$(CYAN)Execution des tests unitaires et integration...$(RESET)"
	@echo ""
	@cd back && mvn clean verify || (echo "$(RED)Echec des tests$(RESET)" && exit 1)
	@echo ""
	@echo "$(GREEN)Tests termines avec succes$(RESET)"
	@echo ""
	@echo "$(BOLD)$(BLUE)=== Couverture de code ===$(RESET)"
	@echo ""
	@echo "$(CYAN)Global (unit + integration):$(RESET)"
	@awk -F',' 'NR>1 { im+=$$4; ic+=$$5; bm+=$$6; bc+=$$7; lm+=$$8; lc+=$$9; mm+=$$12; mc+=$$13 } \
		END { \
			printf "  Instructions: $(YELLOW)%.1f%%$(RESET)\n", (ic/(im+ic))*100; \
			printf "  Branches:     $(YELLOW)%.1f%%$(RESET)\n", (bc/(bm+bc))*100; \
			printf "  Lignes:       $(YELLOW)%.1f%%$(RESET)\n", (lc/(lm+lc))*100; \
			printf "  Methodes:     $(YELLOW)%.1f%%$(RESET)\n", (mc/(mm+mc))*100; \
		}' back/target/site/jacoco/jacoco.csv
	@echo ""
	@echo "$(CYAN)Tests unitaires:$(RESET)"
	@awk -F',' 'NR>1 { im+=$$4; ic+=$$5; bm+=$$6; bc+=$$7; lm+=$$8; lc+=$$9; mm+=$$12; mc+=$$13 } \
		END { \
			printf "  Instructions: $(YELLOW)%.1f%%$(RESET)\n", (ic/(im+ic))*100; \
			printf "  Branches:     $(YELLOW)%.1f%%$(RESET)\n", (bc/(bm+bc))*100; \
			printf "  Lignes:       $(YELLOW)%.1f%%$(RESET)\n", (lc/(lm+lc))*100; \
			printf "  Methodes:     $(YELLOW)%.1f%%$(RESET)\n", (mc/(mm+mc))*100; \
		}' back/target/site/jacoco-unit/jacoco.csv
	@echo ""
	@echo "$(CYAN)Tests integration:$(RESET)"
	@awk -F',' 'NR>1 { im+=$$4; ic+=$$5; bm+=$$6; bc+=$$7; lm+=$$8; lc+=$$9; mm+=$$12; mc+=$$13 } \
		END { \
			printf "  Instructions: $(YELLOW)%.1f%%$(RESET)\n", (ic/(im+ic))*100; \
			printf "  Branches:     $(YELLOW)%.1f%%$(RESET)\n", (bc/(bm+bc))*100; \
			printf "  Lignes:       $(YELLOW)%.1f%%$(RESET)\n", (lc/(lm+lc))*100; \
			printf "  Methodes:     $(YELLOW)%.1f%%$(RESET)\n", (mc/(mm+mc))*100; \
		}' back/target/site/jacoco-integration/jacoco.csv
	@echo ""
	@echo "$(BOLD)$(BLUE)=== Rapports ===$(RESET)"
	@echo ""
	@echo "  $(CYAN)Global:$(RESET)      back/target/site/jacoco/index.html"
	@echo "  $(CYAN)Unitaire:$(RESET)    back/target/site/jacoco-unit/index.html"
	@echo "  $(CYAN)Integration:$(RESET) back/target/site/jacoco-integration/index.html"

test\:back\:unit: ## Lance uniquement les tests unitaires backend
	@echo "$(BOLD)$(BLUE)=== Tests Backend (unitaires) ===$(RESET)"
	@echo ""
	@echo "$(CYAN)Execution des tests unitaires...$(RESET)"
	@echo ""
	@cd back && mvn clean test || (echo "$(RED)Echec des tests$(RESET)" && exit 1)
	@echo ""
	@echo "$(GREEN)Tests unitaires termines avec succes$(RESET)"
	@echo ""
	@echo "$(BOLD)$(BLUE)=== Couverture de code ===$(RESET)"
	@echo ""
	@awk -F',' 'NR>1 { im+=$$4; ic+=$$5; bm+=$$6; bc+=$$7; lm+=$$8; lc+=$$9; mm+=$$12; mc+=$$13 } \
		END { \
			printf "  Instructions: $(YELLOW)%.1f%%$(RESET)\n", (ic/(im+ic))*100; \
			printf "  Branches:     $(YELLOW)%.1f%%$(RESET)\n", (bc/(bm+bc))*100; \
			printf "  Lignes:       $(YELLOW)%.1f%%$(RESET)\n", (lc/(lm+lc))*100; \
			printf "  Methodes:     $(YELLOW)%.1f%%$(RESET)\n", (mc/(mm+mc))*100; \
		}' back/target/site/jacoco-unit/jacoco.csv
	@echo ""
	@echo "$(BOLD)$(BLUE)=== Rapport ===$(RESET)"
	@echo ""
	@echo "  $(CYAN)Unitaire:$(RESET) back/target/site/jacoco-unit/index.html"

test\:back\:integration: ## Lance uniquement les tests d'integration backend
	@echo "$(BOLD)$(BLUE)=== Tests Backend (integration) ===$(RESET)"
	@echo ""
	@echo "$(CYAN)Execution des tests d'integration...$(RESET)"
	@echo ""
	@cd back && mvn clean verify -Dskip.unit.tests=true || (echo "$(RED)Echec des tests$(RESET)" && exit 1)
	@echo ""
	@echo "$(GREEN)Tests d'integration termines avec succes$(RESET)"
	@echo ""
	@echo "$(BOLD)$(BLUE)=== Couverture de code ===$(RESET)"
	@echo ""
	@awk -F',' 'NR>1 { im+=$$4; ic+=$$5; bm+=$$6; bc+=$$7; lm+=$$8; lc+=$$9; mm+=$$12; mc+=$$13 } \
		END { \
			printf "  Instructions: $(YELLOW)%.1f%%$(RESET)\n", (ic/(im+ic))*100; \
			printf "  Branches:     $(YELLOW)%.1f%%$(RESET)\n", (bc/(bm+bc))*100; \
			printf "  Lignes:       $(YELLOW)%.1f%%$(RESET)\n", (lc/(lm+lc))*100; \
			printf "  Methodes:     $(YELLOW)%.1f%%$(RESET)\n", (mc/(mm+mc))*100; \
		}' back/target/site/jacoco-integration/jacoco.csv
	@echo ""
	@echo "$(BOLD)$(BLUE)=== Rapport ===$(RESET)"
	@echo ""
	@echo "  $(CYAN)Integration:$(RESET) back/target/site/jacoco-integration/index.html"

test\:front: ## Lance tous les tests frontend (unitaires + integration)
	@echo "$(BOLD)$(BLUE)=== Tests Frontend (tous) ===$(RESET)"
	@echo ""
	@echo "$(CYAN)Execution des tests unitaires...$(RESET)"
	@echo ""
	@cd front && yarn test:coverage:unit 2>&1 || (echo "$(RED)Echec des tests unitaires$(RESET)" && exit 1)
	@echo ""
	@echo "$(CYAN)Execution des tests integration...$(RESET)"
	@echo ""
	@cd front && yarn test:coverage:integration 2>&1 || (echo "$(RED)Echec des tests integration$(RESET)" && exit 1)
	@echo ""
	@echo "$(GREEN)Tests termines avec succes$(RESET)"
	@echo ""
	@echo "$(BOLD)$(BLUE)=== Couverture de code ===$(RESET)"
	@echo ""
	@echo "$(CYAN)Tests unitaires:$(RESET)"
	@awk -F: '/^LF:/{lf+=$$2} /^LH:/{lh+=$$2} /^BRF:/{brf+=$$2} /^BRH:/{brh+=$$2} /^FNF:/{fnf+=$$2} /^FNH:/{fnh+=$$2} \
		END { \
			printf "  Lignes:     $(YELLOW)%.1f%%$(RESET)\n", (lf>0 ? (lh/lf)*100 : 100); \
			printf "  Branches:   $(YELLOW)%.1f%%$(RESET)\n", (brf>0 ? (brh/brf)*100 : 100); \
			printf "  Fonctions:  $(YELLOW)%.1f%%$(RESET)\n", (fnf>0 ? (fnh/fnf)*100 : 100); \
		}' front/coverage/unit/lcov.info
	@echo ""
	@echo "$(CYAN)Tests integration:$(RESET)"
	@awk -F: '/^LF:/{lf+=$$2} /^LH:/{lh+=$$2} /^BRF:/{brf+=$$2} /^BRH:/{brh+=$$2} /^FNF:/{fnf+=$$2} /^FNH:/{fnh+=$$2} \
		END { \
			printf "  Lignes:     $(YELLOW)%.1f%%$(RESET)\n", (lf>0 ? (lh/lf)*100 : 100); \
			printf "  Branches:   $(YELLOW)%.1f%%$(RESET)\n", (brf>0 ? (brh/brf)*100 : 100); \
			printf "  Fonctions:  $(YELLOW)%.1f%%$(RESET)\n", (fnf>0 ? (fnh/fnf)*100 : 100); \
		}' front/coverage/integration/lcov.info
	@echo ""
	@echo "$(BOLD)$(BLUE)=== Rapports ===$(RESET)"
	@echo ""
	@echo "  $(CYAN)Unitaire:$(RESET)    front/coverage/unit/lcov-report/index.html"
	@echo "  $(CYAN)Integration:$(RESET) front/coverage/integration/lcov-report/index.html"
	@echo ""
	@echo "$(YELLOW)Utilisez 'make test:e2e' pour les lancer separement$(RESET)"

test\:front\:unit: ## Lance uniquement les tests unitaires frontend
	@echo "$(BOLD)$(BLUE)=== Tests Frontend (unitaires) ===$(RESET)"
	@echo ""
	@echo "$(CYAN)Execution des tests unitaires...$(RESET)"
	@echo ""
	@cd front && yarn test:coverage:unit 2>&1 || (echo "$(RED)Echec des tests unitaires$(RESET)" && exit 1)
	@echo ""
	@echo "$(GREEN)Tests unitaires termines avec succes$(RESET)"
	@echo ""
	@echo "$(BOLD)$(BLUE)=== Couverture de code ===$(RESET)"
	@echo ""
	@awk -F: '/^LF:/{lf+=$$2} /^LH:/{lh+=$$2} /^BRF:/{brf+=$$2} /^BRH:/{brh+=$$2} /^FNF:/{fnf+=$$2} /^FNH:/{fnh+=$$2} \
		END { \
			printf "  Lignes:     $(YELLOW)%.1f%%$(RESET)\n", (lf>0 ? (lh/lf)*100 : 100); \
			printf "  Branches:   $(YELLOW)%.1f%%$(RESET)\n", (brf>0 ? (brh/brf)*100 : 100); \
			printf "  Fonctions:  $(YELLOW)%.1f%%$(RESET)\n", (fnf>0 ? (fnh/fnf)*100 : 100); \
		}' front/coverage/unit/lcov.info
	@echo ""
	@echo "$(BOLD)$(BLUE)=== Rapport ===$(RESET)"
	@echo ""
	@echo "  $(CYAN)Unitaire:$(RESET) front/coverage/unit/lcov-report/index.html"

test\:front\:integration: ## Lance uniquement les tests d'integration frontend
	@echo "$(BOLD)$(BLUE)=== Tests Frontend (integration) ===$(RESET)"
	@echo ""
	@echo "$(CYAN)Execution des tests d'integration...$(RESET)"
	@echo ""
	@cd front && yarn test:coverage:integration 2>&1 || (echo "$(RED)Echec des tests d'integration$(RESET)" && exit 1)
	@echo ""
	@echo "$(GREEN)Tests d'integration termines avec succes$(RESET)"
	@echo ""
	@echo "$(BOLD)$(BLUE)=== Couverture de code ===$(RESET)"
	@echo ""
	@awk -F: '/^LF:/{lf+=$$2} /^LH:/{lh+=$$2} /^BRF:/{brf+=$$2} /^BRH:/{brh+=$$2} /^FNF:/{fnf+=$$2} /^FNH:/{fnh+=$$2} \
		END { \
			printf "  Lignes:     $(YELLOW)%.1f%%$(RESET)\n", (lf>0 ? (lh/lf)*100 : 100); \
			printf "  Branches:   $(YELLOW)%.1f%%$(RESET)\n", (brf>0 ? (brh/brf)*100 : 100); \
			printf "  Fonctions:  $(YELLOW)%.1f%%$(RESET)\n", (fnf>0 ? (fnh/fnf)*100 : 100); \
		}' front/coverage/integration/lcov.info
	@echo ""
	@echo "$(BOLD)$(BLUE)=== Rapport ===$(RESET)"
	@echo ""
	@echo "  $(CYAN)Integration:$(RESET) front/coverage/integration/lcov-report/index.html"

test\:e2e: ## Lance les tests E2E Cypress (necessite backend demarre)
	@echo "$(BOLD)$(BLUE)=== Tests E2E (Cypress) ===$(RESET)"
	@echo ""
	@echo "$(CYAN)Execution des tests E2E...$(RESET)"
	@echo ""
	@cd front && yarn e2e:ci 2>&1 || (echo "$(RED)Echec des tests E2E$(RESET)" && exit 1)
	@echo ""
	@echo "$(GREEN)Tests E2E termines avec succes$(RESET)"
	@echo ""
	@echo "$(BOLD)$(BLUE)=== Couverture de code ===$(RESET)"
	@echo ""
	@awk -F: '/^LF:/{lf+=$$2} /^LH:/{lh+=$$2} /^BRF:/{brf+=$$2} /^BRH:/{brh+=$$2} /^FNF:/{fnf+=$$2} /^FNH:/{fnh+=$$2} \
		END { \
			printf "  Lignes:     $(YELLOW)%.1f%%$(RESET)\n", (lf>0 ? (lh/lf)*100 : 100); \
			printf "  Branches:   $(YELLOW)%.1f%%$(RESET)\n", (brf>0 ? (brh/brf)*100 : 100); \
			printf "  Fonctions:  $(YELLOW)%.1f%%$(RESET)\n", (fnf>0 ? (fnh/fnf)*100 : 100); \
		}' front/coverage/lcov.info
	@echo ""
	@echo "$(BOLD)$(BLUE)=== Rapport ===$(RESET)"
	@echo ""
	@echo "  $(CYAN)E2E:$(RESET) front/coverage/lcov-report/index.html"
