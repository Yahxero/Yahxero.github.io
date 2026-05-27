# 🫀 The Wilderness Confession - Yellowjackets Theme

An interactive, multi-stage confession experience custom-tailored for **Jewel Kyelle DG. Jamolin** (themed as Shauna Shipman), designed with deep moody aesthetics, custom retro game mechanics, floating Polaroid collages, and cinematic background music transitions.

This codebase is pre-configured to run as a Single Page Application (SPA), ensuring that music handles and page transitions happen flawlessly without interruption.

---

## 📁 Project Folder Structure

Make sure your local project folder is arranged like this before pushing to GitHub:

```text
yellowjackets-confession/
├── assets/            <-- Drop Jewel's photos here
│   ├── page3_1.jpg
│   ├── page3_2.jpg
│   └── ... (up to page6_6.jpg)
├── audio/             <-- Put your MP3 files here
│   ├── someday.mp3
│   ├── fade_into_you.mp3
│   ├── earrings.mp3
│   └── linger.mp3
├── index.html         <-- Main HTML structure
├── style.css          <-- Styling and animations
├── game.js            <-- Canvas 2D Retro Runner Game engine
├── app.js             <-- SPA controller and audio crossfader
└── README.md          <-- This instruction guide
```

---

## 🎵 1. Music Setup Guide

Due to browser audio security, local `.mp3` files are the most reliable and premium method to loop songs.

1. Create a folder named `audio` in your project folder.
2. Download your music tracks (you can use your preferred YouTube-to-MP3 converter or downloading site).
3. Rename the files **exactly** as follows and drop them in the `audio/` folder:
   * **Page 3 (Confession)**: "Someday" by The Ridleys $\rightarrow$ Rename to **`someday.mp3`**
   * **Page 4 (Flaws)**: "Fade Into You" by Mazzy Star $\rightarrow$ Rename to **`fade_into_you.mp3`**
   * **Page 5 (Rejection)**: "Earrings" by Malcolm Todd $\rightarrow$ Rename to **`earrings.mp3`**
   * **Page 6 (Final page)**: "Linger" by The Cranberries $\rightarrow$ Rename to **`linger.mp3`**

---

## 📸 2. Image Setup Guide (At Least 6 Pics Per Page)

This app features a gorgeous, interactive, drifting Polaroid collage on pages 3, 5, and 6, and a static background collage on page 4. The code supports **at least 6 photos per page**.

### Photo Naming Convention:
Simply save your photos of Jewel (or Shauna Shipman/Sophie Nélisse lookalike photos) inside the `assets/` folder using these exact names:
* **Page 3 Pictures**: `page3_1.jpg`, `page3_2.jpg`, `page3_3.jpg`, `page3_4.jpg`, `page3_5.jpg`, `page3_6.jpg`
* **Page 4 Pictures**: `page4_1.jpg`, `page4_2.jpg`, `page4_3.jpg`, `page4_4.jpg`, `page4_5.jpg`, `page4_6.jpg`
* **Page 5 Pictures**: `page5_1.jpg`, `page5_2.jpg`, `page5_3.jpg`, `page5_4.jpg`, `page5_5.jpg`, `page5_6.jpg`
* **Page 6 Pictures**: `page6_1.jpg`, `page6_2.jpg`, `page6_3.jpg`, `page6_4.jpg`, `page6_5.jpg`, `page6_6.jpg`

> [!NOTE]
> **Automatic Graphic Fallbacks**
> If you test the app before putting the pictures in, **don't worry!** The code automatically detects missing files and displays beautiful, Yellowjackets-themed glowing vector icons (like the wilderness cabin, cassette tapes, pine trees, and pulsing hearts) with handwritten labels instead. Once you drop your `.jpg` files in the folder, they will instantly load and display!

---

## 💻 3. Local Testing

Since browsers restrict background audio and file reading when double-clicking a raw HTML file directly, it is highly recommended to open the project with a **local server** to test the music:

### Method A: VS Code "Live Server" (Recommended)
1. Open the project folder in VS Code.
2. If you don't have it, install the **Live Server** extension (by Ritwick Dey).
3. Click the **Go Live** button at the bottom-right corner of VS Code.
4. Your browser will open the page and everything (including music and sounds) will work flawlessly!

### Method B: Python Simple Server
If you have Python installed, open your terminal/command prompt in the project directory and run:
```bash
python -m http.server 8000
```
Then go to `http://localhost:8000` in your browser.

---

## 🚀 4. How to Publish on GitHub Pages (Free)

To make it a live website that you can send to Jewel, publish it to GitHub:

1. Go to [GitHub.com](https://github.com) and log in.
2. Click **New Repository**.
3. Name it something secret or theme-appropriate (e.g., `the-wilderness` or `cabin-logs`). Set it to **Public**.
4. Upload all your files (`index.html`, `style.css`, `game.js`, `app.js`, `README.md`, `assets/`, `audio/`). You can do this by dragging and dropping them directly into the browser on GitHub, or using Git:
   ```bash
   git init
   git add .
   git commit -m "Entering the wilderness"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
5. Once uploaded, go to the **Settings** tab of your repository on GitHub.
6. Scroll down to the **Pages** menu on the left sidebar.
7. Under **Build and deployment**, set the source to **Deploy from a branch**.
8. Select the **`main`** branch (and the `/root` folder) and click **Save**.
9. Wait about 1-2 minutes. GitHub will give you a live link like:
   `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`
10. Send the link to Jewel! 🫀

---

## 🎮 Game Controls Reference

* **Jump**: `SPACEBAR` or `UP ARROW` or Mobile **JUMP** Button.
* **Melee Knife Slash**: `F` key or `Z` key or Mobile **SLASH** Button.
* **Throw Knife**: `D` key or `X` key or Mobile **THROW** Button.

*Yahiero flashes red and gains invincibility if hit by beasts, but **cannot die**, making sure Jewel successfully reaches your confession dialogue!*
