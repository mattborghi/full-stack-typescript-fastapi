.PHONY: help

help: ## Print this help.
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build Backend Docker
	docker build -t backend -f deploy/backend.Dockerfile .

run: ## Run Backend Docker
	docker run -it --rm -p 8080:8080 -v ${PWD}/backend/src:/backend/src:rw backend

build-frontend: ## Build Frontend
	cd frontend && pnpm install

run-frontend: ## Run Frontend
	cd frontend && pnpm run dev