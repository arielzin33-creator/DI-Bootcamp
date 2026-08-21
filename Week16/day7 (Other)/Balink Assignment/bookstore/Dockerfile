FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
# HashRouter means every route lives under the URL fragment (e.g. /#/cart),
# so nginx never needs a SPA-fallback rewrite rule — it only ever serves
# index.html and static assets from the same path.
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
