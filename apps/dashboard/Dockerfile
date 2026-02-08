FROM node:20-alpine

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY apps/dashboard/package.json apps/dashboard/package.json

RUN npm ci --workspace=@lazy-typing/dashboard --include-workspace-root --include=dev

COPY apps/dashboard apps/dashboard

RUN npm run build --workspace=@lazy-typing/dashboard

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=@lazy-typing/dashboard", "--", "-H", "0.0.0.0", "-p", "3000"]
