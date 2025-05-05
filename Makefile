NAME		=	red_tetris

VOLUME_PATH	=	
COMPOSE 	=	docker compose -f ./docker-compose.yml
PRODUCTION 	=	docker compose -f ./docker-compose-prod.yml

SERVER		=	server
CLIENT		=	client

TEST_CMD    =   npm test

start: get_ip _start

prod: get_ip _prod

stop: _stop

build: _build

test: _test

clean: stop _clean

fclean: clean
	$(COMPOSE) down --volumes
	$(PRODUCTION) down --volumes

restart: _restart clean build start

show:
	$(COMPOSE) ps

log: _log

list: help
help: _help

update-npm:
	@cd ./client && npm update
	@cd ./server && npm update

get_ip:
	@./scripts/get_ip.sh

.PHONY: start stop build clean fclean restart show log list help get_ip prod

# ===============================================

# turn them into do-nothing targets
$(eval client:;@:)
$(eval server:;@:)

BUILD	=	$(COMPOSE) build --no-cache --parallel
.PHONY: _build
_build:
ifeq (client, $(filter client,$(MAKECMDGOALS)))
	@echo 'building client'
	$(BUILD) $(CLIENT)
else ifeq (server, $(filter server,$(MAKECMDGOALS)))
	@echo 'building server'
	$(BUILD) $(SERVER)
else
	@echo 'building all'
	$(BUILD)
endif

START	=	$(COMPOSE) up
.PHONY: _start
_start:
ifeq (client, $(filter client,$(MAKECMDGOALS)))
	@echo 'starting client'
	$(START) $(CLIENT)
else ifeq (server, $(filter server, $(MAKECMDGOALS)))
	@echo 'starting server'
	$(START) $(SERVER)
else
	@echo 'starting all'
	$(START)
endif

.PHONY: _prod
_prod:
	@echo 'starting all in production mode'
	@./scripts/start_prod.sh
	$(PRODUCTION) up -d

STOP	=	$(COMPOSE) stop
.PHONY: _stop
_stop:
ifeq (client, $(filter client, $(MAKECMDGOALS)))
	@echo 'stop client'
	$(STOP) $(CLIENT)
else ifeq (server, $(filter server, $(MAKECMDGOALS)))
	@echo 'stop server'
	$(STOP) $(SERVER)
else
	@echo 'stop all'
	$(STOP)
endif

.PHONY: _test
test:
ifeq (client, $(filter client,$(MAKECMDGOALS)))
	@echo 'Running tests in client container'
	docker exec -it $(NAME)-$(CLIENT) $(TEST_CMD)
else ifeq (server, $(filter server,$(MAKECMDGOALS)))
	@echo 'Running tests in server container'
	docker exec -it $(NAME)-$(CLIENT) $(TEST_CMD)
else
	@echo 'Running tests in all containers'
	docker exec -it $(NAME)-$(CLIENT) $(TEST_CMD)
	docker exec -it $(NAME)-$(SERVER) $(TEST_CMD)
endif

CLEAN	=	docker rmi -f
.PHONY: _clean
_clean:
ifeq (client, $(filter client,$(MAKECMDGOALS)))
	@echo 'removing client image'
	$(CLEAN) $(NAME)-$(CLIENT)
else ifeq (server, $(filter server,$(MAKECMDGOALS)))
	@echo 'removing server image'
	$(CLEAN) $(NAME)-$(SERVER)
else
	@echo 'removing all images'
	$(CLEAN) $(NAME)-$(CLIENT) $(NAME)-$(SERVER)
endif

.PHONY: _restart
_restart:
ifeq (client, $(filter client,$(MAKECMDGOALS)))
	@echo 'Restarting client'
else ifeq (server, $(filter server,$(MAKECMDGOALS)))
	@echo 'Restarting server'
	@echo 'Restarting all'
endif

.PHONY: _log
LOG	=	docker logs -f
_log:
ifeq (client, $(filter client,$(MAKECMDGOALS)))
	@echo 'Logging client'
	$(LOG) $(NAME)-$(CLIENT)
else ifeq (server, $(filter server,$(MAKECMDGOALS)))
	@echo 'Logging server'
	$(LOG) $(NAME)-$(SERVER)
endif

.PHONY: _help
_help:
	@echo "======================================================"
	@echo "\t\t\tMAKE HELP"
	@echo "======================================================"
	@echo ""
	@echo "Command: start stop build test clean fclean restart show log"
	@echo ""


# ==============================================================================
#	Extra
# ==============================================================================
_GREY	= \033[30m
_RED	= \033[31m
_ORANGE	= \033[38;5;209m
_GREEN	= \033[32m
_YELLOW	= \033[33m
_BLUE	= \033[34m
_PURPLE	= \033[35m
_CYAN	= \033[36m
_WHITE	= \033[37m
_END	= \033[0m