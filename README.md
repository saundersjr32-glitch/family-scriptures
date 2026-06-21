# Family scriptures app

A Father's Day gift app: a daily family scripture, the Locate / Understand /
Apply / Memorize flow, family progress, shared family stories, and a
recording booth so Grandpa can add his own 30-60 second voice notes right
from the app. Data is stored with Netlify Blobs through a small serverless
function, so everything persists and is shared across every device that
opens the site, no Claude account or subscription needed.

## What's in this folder

- `public/index.html` - the entire app (HTML, CSS, and JS in one file)
- `netlify/functions/storage.mjs` - a tiny serverless function that reads
  and writes data to Netlify Blobs (a free, built-in key/value store)
- `netlify.toml` - tells Netlify where the site and the function live
- `package.json` - declares the one dependency the function needs

## Deploying

Functions need Netlify's build step, so this can't be deployed with a
simple drag-and-drop of a single file. Two easy ways to deploy it:

### Option A: Netlify CLI (fastest)

1. Install the CLI if you don't have it: `npm install -g netlify-cli`
2. From inside this folder, run: `netlify deploy --prod`
3. Follow the prompts to log in and create a new site. Netlify will give
   you a live URL when it's done (something like
   `https://your-site-name.netlify.app`).

### Option B: Git + Netlify dashboard

1. Push this folder to a new GitHub (or GitLab/Bitbucket) repository.
2. In the Netlify dashboard, click "Add a new site" -> "Import an existing
   project," and connect that repository.
3. Netlify will detect `netlify.toml` automatically and deploy. You'll get
   a live URL once the build finishes.

Either way, once it's live, open the URL, go to Settings -> "Open the
recording booth" to have Grandpa record his first verse, and send the link
to the family.

## Notes

- The app seeds itself with 8 real scriptures the first time it loads.
  Add the rest of the family list any time from Settings -> "Add a
  scripture."
- All data (recordings, family names, progress, stories) lives in a
  Netlify Blobs store called `family-scriptures`, viewable under the
  "Blobs" tab in your Netlify project dashboard if you ever want to look
  at or clear the raw data.
- **Editing is PIN-protected.** Anyone can mark verses memorized, add
  themselves as a family member, or share a story, those stay open on
  purpose. But changing the scripture list and recording or deleting in
  the booth requires a PIN. The first person to open Settings after
  deploying will be prompted to set that PIN. After that, unlocking
  means pressing and holding Grandpa's photo in Settings for 2 seconds,
  then entering the PIN. This is enforced on the server (in
  `storage.mjs`), not just hidden in the UI, so it can't be bypassed by
  opening developer tools. It's a family-appropriate deterrent, not
  bank-grade security, treat it like a shared password.
- If the PIN is ever forgotten, go to your Netlify project's Blobs tab,
  open the `family-scriptures` store, and delete the `admin_pin` entry.
  The next visit to Settings will prompt to set a new one.
- If you ever want individual Claude or email accounts per family
  member instead of one shared PIN, that's a bigger change, let me know
  and we can talk through it.
