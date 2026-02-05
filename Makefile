.PHONY: setup build clean help

# Default target
help:
	@echo "Available commands:"
	@echo "  make setup  - Install dependencies and build the project"
	@echo "  make build  - Build the project"
	@echo "  make clean  - Remove dist and node_modules"
	@echo "  make help   - Show this help message"

# Setup project (install + build)
setup:
	bun install
	bun run build

# Build project (install deps if needed)
build:
	@if [ ! -d "node_modules" ]; then \
		echo "Installing dependencies..."; \
		bun install; \
	fi
	bun run build

# Clean build artifacts and dependencies
clean:
	rm -rf dist node_modules bun.lockb