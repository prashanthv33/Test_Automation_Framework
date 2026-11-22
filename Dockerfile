# Reproducible test runner. The official image ships browsers + OS deps pinned
# to the same Playwright version as package.json, so screenshots match CI.
FROM mcr.microsoft.com/playwright:v1.65.1-noble

WORKDIR /app
ENV CI=true

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npx bddgen

# Override at run time, e.g.:
#   docker run --rm pw-hybrid npx playwright test --project=api
CMD ["npx", "playwright", "test"]
