# Contributing to JigsawMemoryPuzzle

Thank you for contributing to this college mini-project.  
Please read this guide before making any changes.

---

## Prerequisites

Make sure the following are installed and working on your machine before you begin:

| Tool | Minimum version | Purpose |
|------|----------------|---------|
| JDK | 17 | Compile Java source files |
| Apache Maven | 3.x | Build and package the WAR |
| Apache Tomcat | 10.1 | Serve the web application |
| MySQL Server | 8.x | Store game results |
| Git | Any recent version | Version control |

---

## Getting the Repository

```bash
git clone https://github.com/harshad-19/JigsawMiniProject.git
cd JigsawMiniProject
```

Or use **GitHub Desktop → File → Clone repository** and select JigsawMiniProject.

---

## Setting Up Your Local Environment

1. **Database configuration**  
   Copy the example template and fill in your own credentials:
   ```
   src/main/resources/db.properties.example  →  src/main/resources/db.properties
   ```
   Edit `db.properties` with your local MySQL username and password.  
   **Never commit `db.properties` — it is listed in `.gitignore`.**

2. **Database schema**  
   Run the schema script once to create the database and tables:
   ```sql
   -- In MySQL Workbench or the MySQL CLI:
   source database/schema.sql
   ```

3. **Build**
   ```bash
   mvn clean package
   ```
   This produces `target/JigsawMemoryPuzzle.war`.

4. **Deploy**  
   Copy `target/JigsawMemoryPuzzle.war` into your Tomcat `webapps/` folder
   and start Tomcat.

5. **Verify**  
   Open `http://localhost:8080/JigsawMemoryPuzzle/` in a browser and confirm
   the game loads.

---

## Branching

Always work on a dedicated branch — never commit directly to `main`.

```bash
git checkout -b feature/your-short-description
# or
git checkout -b fix/what-you-are-fixing
```

Branch naming conventions:
- `feature/` — new functionality
- `fix/` — bug fixes
- `docs/` — documentation-only changes

---

## Making Changes

- **Preserve working application behavior.**  
  Changes must not break the existing puzzle game, score saving, or leaderboard.
- **Keep commits focused.**  
  One logical change per commit. Avoid mixing formatting changes with functional changes.
- **Write clear commit messages.**  
  ```
  fix: correct leaderboard sort order for tied scores
  docs: add WEB-INF explanation to PROJECT_STRUCTURE.md
  ```
- **Do not refactor unrelated code.**  
  If you notice something unrelated that could be improved, open an issue instead.

---

## Secret-Handling Rules

- **Never commit `db.properties`** (it contains your MySQL password).
- **Never commit `.env` files**, API keys, tokens, or private keys.
- **Never commit Tomcat installation directories** or Maven local-repository
  caches (`.m2/`).
- If you accidentally commit a secret, change the credential immediately —
  `.gitignore` alone will not remove it from Git history.

---

## Building and Testing Locally

```bash
# Clean previous build and recompile
mvn clean package

# Deploy the WAR and start Tomcat (adjust path to your installation)
# Windows example:
copy target\JigsawMemoryPuzzle.war %CATALINA_HOME%\webapps\
%CATALINA_HOME%\bin\startup.bat
```

Manual verification checklist before submitting a pull request:

- [ ] `mvn clean package` completes without errors.
- [ ] The game loads at `http://localhost:8080/JigsawMemoryPuzzle/`.
- [ ] Entering a name and completing the puzzle saves a score.
- [ ] The leaderboard displays saved scores correctly.
- [ ] No `db.properties` or other secret file appears in `git status`.

---

## Submitting a Pull Request

1. Push your branch to GitHub:
   ```bash
   git push origin feature/your-short-description
   ```
2. Open a Pull Request on GitHub against the `main` branch.
3. Describe what you changed and why.
4. Wait for a teammate to review before merging.

---

## Reporting a Bug

Open a GitHub Issue and include:

- What you did step by step.
- What you expected to happen.
- What actually happened (paste the exact error message or Tomcat log output).
- Your operating system, JDK version, and Tomcat version.

---

## Code Style

Match the style of the existing code:
- Existing indentation, brace style, and naming conventions.
- Same comment density as the file you are editing.
- Do not change package names, class names, or API endpoint URLs.
