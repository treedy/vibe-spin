# Start from a small Debian image
FROM debian:trixie-20260223-slim

ENV DEBIAN_FRONTEND=noninteractive

# Install curl and ca-certificates for downloading the websitino binary
RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates curl \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /srv/www

# Download the prebuilt Linux websitino binary and make it executable
RUN curl -fsSL -o /usr/local/bin/websitino https://trikko.github.io/websitino/linux/websitino \
	&& chmod 755 /usr/local/bin/websitino \
  && useradd --no-create-home --shell /usr/sbin/nologin vibespin

# Copy the built static site into the image
COPY --chown=root:vibespin build/ /srv/www/

# Use an unpriveledged user
USER vibespin

# Expose default HTTP port
EXPOSE 8080

# Run websitino serving the copied site on port 8080
ENTRYPOINT ["/usr/local/bin/websitino", "/srv/www", "--port", "8080", "--index"]
