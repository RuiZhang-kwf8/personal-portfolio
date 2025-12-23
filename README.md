# Personal Portfolio (Heroku-ready)

A simple personal portfolio site served by Node.js + Express, emulating sections like Hero, Education, Experience, Projects, Awards, and Contact.

## Run Locally

```sh
cd "/Users/ruiyu/Downloads/personal website/personal-site"
npm install
npm start
```

Then open `http://localhost:3000`.

## Customize
- Edit content in `public/index.html` (names, roles, links, sections).
- Tweak styles in `public/styles.css`.
- Add interactions in `public/app.js`.

## Deploy to Heroku

```sh
# From the project root
cd "/Users/ruiyu/Downloads/personal website/personal-site"
heroku login
heroku create
git init
git add .
git commit -m "Initial portfolio"
heroku git:remote -a <your-heroku-app-name>
git push heroku main
```

Notes:
- Heroku detects Node.js via `package.json` and uses `Procfile` (`web: node server.js`).
- Ensure you deploy from a Git repo. If you already have one, skip `git init`.
- If deploying to another platform, any Node host serving `public/` will work.
