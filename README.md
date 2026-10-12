# Personal-Site

Central Hub to see all things Angela!

This is the source code for my personal site, currently deployed at ayangelah.me! I am regularly updating it with
all current events, projects, and things I'd like to share, drop on by if you'd like to get to know me!

### Note-To-Self to handle module bundler:

- don't use npm run dev, it doesn't update the most recent built version.

1. change index.html in main directory to reference the src index.js. Temporarily remove its generated `dist/assets/index-*.css` stylesheet link; the source imports `style.css` for the build.
2. run `npm run build` in the home directory
3. change the script link in the main index.html to the new `dist/assets/index-*.js`, and restore the stylesheet link using the CSS filename emitted by the build. Keep both generated files in the commit.
4. use go live in vscode.

For island interaction changes, run `node --test tests/island-interactions.test.mjs` and check the built page locally before pushing.

### How to force update of the live site:

1. git commit --allow-empty -m "Trigger rebuild"
2. git push
