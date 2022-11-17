# fogota-ui

Front end for the Fogota mining community

## Developing

Once you've installed dependencies with `npm install`, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> This app builds for a Node server, and it includes a Dockerfile that creates such a server.  To deploy on Google Cloud Run, install the Cloud Code VSCode extension, then select 'Deploy to Cloud Run.'
