# Maimuna Afrah · Art × Technology

Interactive portfolio site combining my artwork with the technical/creative projects I build: the "creative technology" space I'm exploring as a first-year AI & ML student.

🔗 **Live site:** https://maimuna-portfolio.vercel.app

## Screenshots

<p align="center">
  <img src="./Screenshot%202026-09-01%20184940.png" alt="Portfolio screenshot 1" width="45%" />
  <img src="./Screenshot%202026-09-01%20184957.png" alt="Portfolio screenshot 2" width="45%" />
</p>

## What's inside
- Original ink, watercolor, and marker artwork, including pieces featured in print and fan art
- A project showcase: Athena, RoleFit, HazardWatch OS, Hire-scope, FF-01-S5, Study with Mimi
- A journal at `/blog` for hackathon results and project launches
- An About section connecting the art side and the code side

## Built with
- React + TypeScript
- Vite
- Tailwind CSS
- wouter (routing) + framer-motion (scroll and hover motion)

## Running locally
\`\`\`bash
npm install
npm run dev
\`\`\`

## Building for production
\`\`\`bash
npm run build
\`\`\`
Outputs a static build to `dist/`. This project is deployed on Vercel.

## Adding a journal post

Posts live in `client/src/content/posts.ts`. That file is data only: no layout,
no JSX, so adding one cannot break the page.

1. Open `client/src/content/posts.ts`.
2. Copy the commented-out template at the bottom of the file.
3. Paste it at the **top** of the array and delete the `//` from each line.
   The array renders top to bottom, so the newest note goes first.
4. Fill in the fields:

| field | what it is |
| --- | --- |
| `slug` | lowercase-with-dashes, no spaces. Becomes the link to this one post: `/blog#your-slug` |
| `kind` | the small teal chip: "Hackathon", "Project launch", "Feature" |
| `title` | the headline |
| `date` | `YYYY-MM-DD`, for machines |
| `dateLabel` | what readers see: "4–5 September 2026" |
| `summary` | one italic line under the title |
| `body` | one string per paragraph, in a list |
| `tags` | the small outlined chips |
| `href` | optional: the LinkedIn post this expands on |
| `linkLabel` | optional: the words on that link |

5. Check it: `npm run dev`, then open http://localhost:3000/blog
6. Check nothing broke: `npm test`
7. Commit and push. Vercel redeploys on its own.

If you delete every post, the page says "The first note is still being written."
rather than showing an empty gap.

---
Art and site by [Maimuna Afrah](https://www.linkedin.com/in/maimuna-afrah-2b41b63a0)
