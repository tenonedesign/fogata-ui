FROM node:lts-alpine
#ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
#RUN npm install --production --silent && mv node_modules ../
RUN npm install --silent && mv node_modules ../
COPY . .
RUN npm run build
EXPOSE 8080
RUN chown -R node /usr/src/app
USER node
CMD ["node", "build"]
