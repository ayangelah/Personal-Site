# Personal-Site

Central Hub to see all things Angela!

This is the source code for my personal site, currently deployed at ayangelah.me! I am regularly updating it with
all current events, projects, and things I'd like to share, drop on by if you'd like to get to know me!

### Note-To-Self to handle module bundler:

- don't use npm run dev, it doesn't update the most recent built version.

1. change index.html in main directory to reference the src index.js
2. run `npm run build` in the home directory
3. change the link to index.js in the dist directory in the main index.html.
4. use go live in vscode.

### How to force update of the live site:

1. git commit --allow-empty -m "Trigger rebuild"
2. git push
