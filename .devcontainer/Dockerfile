FROM mcr.microsoft.com/devcontainers/typescript-node:24-trixie

RUN npm install -g @playwright/cli \
	&& npx playwright install --with-deps \
	&& npm cache clean --force > /dev/null 2>&1
