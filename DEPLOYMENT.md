# Deployment Guide: PinkBlue MD Diagnostic Terminal

This guide outlines the steps to deploy the Diagnostic Terminal application to GitHub and host it using GitHub Pages.

## Prerequisites

- A GitHub account.
- Git installed on your local machine.

## Step 1: Initialize Git Repository

Open your terminal or command prompt in the project folder (`C:\Users\THERAORAL-028\Desktop\Tech\diagnostic-detective`) and run:

```bash
git init
```

## Step 2: Create .gitignore

Create a file named `.gitignore` to prevent unnecessary files from being uploaded:

```
node_modules/
.DS_Store
*.log
```

## Step 3: Stage and Commit Files

Add all your project files to the git staging area:

```bash
git add .
```

Commit the files with a message:

```bash
git commit -m "Initial commit: Production release v1.0"
```

## Step 4: Create a Repository on GitHub

1.  Log in to [GitHub](https://github.com).
2.  Click the **+** icon in the top right and select **New repository**.
3.  Name it `diagnostic-detective` (or your preferred name).
4.  Make it **Public**.
5.  Click **Create repository**.

## Step 5: Push to GitHub

Copy the commands provided by GitHub under "…or push an existing repository from the command line". They will look like this:

```bash
git remote add origin https://github.com/YOUR_USERNAME/diagnostic-detective.git
git branch -M main
git push -u origin main
```

*(Replace `YOUR_USERNAME` with your actual GitHub username)*

## Step 6: Enable GitHub Pages

1.  Go to your repository **Settings** tab.
2.  Scroll down to the **Pages** section (or click "Pages" in the left sidebar).
3.  Under **Source**, select `main` branch and `/ (root)` folder.
4.  Click **Save**.

Wait a minute or two, and GitHub will provide you with a live URL (e.g., `https://your-username.github.io/diagnostic-detective/`).

## Verification

- Visit the provided URL.
- Test the **Login** (accepts any email).
- Click **Start Diagnosis** -> **Medical Briefing** -> **Begin Rounds**.
- Verify the **Stepped Flow** (three steps).
- Click the **Blood Pressure** card to verify the graph popup.

## Troubleshooting

- **Images not loading?** Ensure your image paths in `cases.js` are relative (e.g., `./assets/img.png`) or hosted URLs.
- **Login stuck?** Check the browser console (F12) for any JavaScript errors.
