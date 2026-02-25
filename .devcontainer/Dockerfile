FROM mcr.microsoft.com/devcontainers/typescript-node:24-trixie

USER node

# Playwright + browsers is large, so we want this up higher in the layers.
# Separating it out to take advantage of layer caching.
RUN sudo npm install -g @playwright/cli \
	&& npx playwright install --with-deps chromium firefox webkit \
	&& sudo npm cache clean --force > /dev/null 2>&1 \
	&& npm cache clean --force > /dev/null 2>&1

# Install agent CLIs.
# Add Codex when it's available for Linux
RUN sudo npm install -g @google/gemini-cli \
	&& sudo npm install -g @github/copilot \
	&& curl -fsSL https://claude.ai/install.sh | bash \
	&& sudo npm cache clean --force > /dev/null 2>&1

# Install other useful tools like ripgrep, fzf, and github-cli
RUN sudo mkdir -p -m 755 /etc/apt/keyrings \
	&& out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
	&& cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
	&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
	&& sudo mkdir -p -m 755 /etc/apt/sources.list.d \
	&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
	&& sudo apt update \
  && sudo apt install -y \
		bat \
		fzf \
		gh \
		ripgrep \
		stow \
	&& sudo rm -rf /var/lib/apt/lists/*
