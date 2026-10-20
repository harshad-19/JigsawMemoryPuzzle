# Jigsaw Memory Puzzle

A browser-based jigsaw memory puzzle game built with Java, Maven, and MySQL. Rebuild the cherry-blossom scene from memory and have your score saved to a leaderboard.

---

## Project Purpose & Objectives

**Jigsaw Memory Puzzle** is a college-level web application that tests players' visual memory. Players study a cherry-blossom scene, then reassemble it from 12 shuffled puzzle pieces. The game tracks time and calculates scores, persisting results to a MySQL database for leaderboard display.

---

## Main Features

- **Jigsaw memory puzzle gameplay** — Study a scene, then reconstruct it from 12 mixed-up pieces
- **Player name input** — Enter your name before playing; it appears on the leaderboard
- **Timer and score calculation** — Complete the puzzle faster for a higher score (score = max(100, 1800 - seconds × 2))
- **Score persistence in MySQL** — Game results are saved to a MySQL database
- **Leaderboard** — View top scores with player names, times, and scores

---

## Technologies & Versions

| Technology | Version |
|------------|---------|
| Java | 17 |
| Apache Maven | 3.x |
| Apache Tomcat | 10.1 |
| MySQL | 8.x |
| JDBC | MySQL Connector/J |
| Jakarta Servlet API | 6.0 |
| HTML / CSS / JavaScript | — |

---

## Prerequisites & Installation Requirements

### 1. Install Prerequisites

- **JDK 17** — Download from [adoptium.net](https://adoptium.net) or [Oracle](https://oracle.com)
- **Apache Maven** 3.x — `mvn --version` to verify
- **Apache Tomcat 10.1** — Download from [tomcat.apache.org](https://tomcat.apache.org)
- **MySQL Server** 8.x — Install and ensure it's running
- **Git** — Any recent version

### 2. Create & Configure the MySQL Database

Run the schema script to create the database and initial data:

```sql
-- In MySQL Workbench or the MySQL CLI:
CREATE DATABASE IF NOT EXISTS jigsaw_db;
USE jigsaw_db;

CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS puzzles (
    puzzle_id INT PRIMARY KEY AUTO_INCREMENT,
    puzzle_name VARCHAR(100) NOT NULL UNIQUE,
    difficulty VARCHAR(30) NOT NULL,
    total_pieces INT NOT NULL
);

CREATE TABLE IF NOT EXISTS game_results (
    result_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    puzzle_id INT NOT NULL,
    score INT NOT NULL,
    completion_time INT NOT NULL,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_result_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_result_puzzle
        FOREIGN KEY (puzzle_id)
        REFERENCES puzzles(puzzle_id)
);

INSERT IGNORE INTO puzzles
    (puzzle_name, difficulty, total_pieces)
VALUES
    ('Cherry Blossom Memory', 'Standard', 12);
```

### 3. Configure Database Credentials

The application reads database settings from `src/main/resources/db.properties`. **Never commit this file** — it contains your MySQL password.

1. Copy the example template:

```bash
copy src\main\resources\db.properties.example src\main\resources\db.properties
```

2. Edit `db.properties` with your local MySQL credentials:

```
db.url=jdbc:mysql://localhost:3306/jigsaw_db
db.username=root
db.password=YOUR_MYSQL_PASSWORD_HERE
```

3. **Important**: The real `db.properties` is listed in `.gitignore` and must remain local only. The `db.properties.example` file is committed with placeholder values.

### 4. Build the WAR with Maven

```bash
mvn clean package
```

This produces `target/JigsawMemoryPuzzle.war`.

### 5. Deploy and Run on Tomcat

1. Copy the WAR into Tomcat's `webapps/` folder:

```bash
copy target\JigsawMemoryPuzzle.war %CATALINA_HOME%\webapps\
```

2. Start Tomcat:

```bash
%CATALINA_HOME%\bin\startup.bat
```

3. The application will automatically deploy. Open your browser at:

```
http://localhost:8080/JigsawMemoryPuzzle/
```

### 6. Open the Game in a Browser

Navigate to `http://localhost:8080/JigsawMemoryPuzzle/` and you'll see the welcome screen. Click "Play puzzle" to start.

### 7. Verify Score Saving & Leaderboard Functionality

1. Play the puzzle and complete it
2. Enter a name when prompted
3. Check that "Score saved successfully." appears in the completion screen
4. Click "View leaderboard" to see saved scores
5. Verify the leaderboard displays names, times, and scores sorted by score (highest first), then completion time, then date

---

## Repository Folder Structure

```
JigsawMemoryPuzzle/
├── .gitignore              # Excludes build output, credentials, IDE clutter
├── pom.xml               # Maven build configuration (WAR packaging, JDK 17, dependencies)
├── README.md             # This file
├── CONTRIBUTING.md       # Contribution guidelines
├── database/
│   └── schema.sql        # SQL script to create jigsaw_db and seed data
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── jigsaw/
│   │   │           └── server/
│   │   │               ├── DBConnection.java     # Loads db.properties, creates JDBC connections
│   │   │               ├── DBConnectionTest.java  # Unit test for DBConnection
│   │   │               ├── GameResultDAO.java    # Database access object for game results
│   │   │               ├── LeaderboardServlet.java # GET /api/leaderboard
│   │   │               └── ResultServlet.java      # POST /api/results
│   │   ├── resources/
│   │   │   └── db.properties.example  # Template — copy to db.properties for local runtime
│   │   └── webapp/
│   │       ├── index.html          # Game entry point
│   │       ├── app.js              # Game logic, UI, API calls (fetch /api/results, /api/leaderboard)
│   │       ├── style.css           # Styling and responsive layout
│   │       ├── assets/
│   │       │   └── cherry-blossom-garden.png  # Puzzle image (do not rename or move)
│   │       └── WEB-INF/            # (empty in this project)
│   └── test/
│       └── java/
│           └── com/
│               └── jigsaw/
│                   └── server/
│                       └── DBConnectionTest.java
├── target/                   # Build output — excluded by .gitignore
│   └── JigsawMemoryPuzzle.war    # Generated WAR file
├── hs_err_pid*.log         # JVM crash dumps — excluded by .gitignore
├── JigsawMemoryPuzzle.war  # WAR at project root (generated artifact — excluded by .gitignore)
└── db.properties           # Local credentials — excluded by .gitignore
```

---

## Instructions to Create/Configure the MySQL Database

Run `database/schema.sql` once on your MySQL server:

```bash
mysql -u root -p < database/schema.sql
```

This creates the `jigsaw_db` database with three tables (`users`, `puzzles`, `game_results`) and seeds the "Cherry Blossom Memory" puzzle with 12 pieces.

---

## Instructions to Configure Database Credentials Securely

1. **Never commit `db.properties`** — it is excluded by `.gitignore`
2. The file lives at `src/main/resources/db.properties`
3. Copy `db.properties.example` and fill in your credentials:
   ```bash
   copy src\main\resources\db.properties.example src\main\resources\db.properties
   ```
4. Edit the password field with your MySQL password
5. The application loads this file from the classpath at runtime; Maven copies it into the WAR automatically

---

## Instructions to Build the WAR Using Maven

```bash
mvn clean package
```

Output: `target/JigsawMemoryPuzzle.war`

---

## Instructions to Deploy and Run the Application on Tomcat

1. Copy the WAR to Tomcat `webapps/`:

```bash
copy target\JigsawMemoryPuzzle.war %CATALINA_HOME%\webapps\
```

2. Start Tomcat:

```bash
%CATALINA_HOME%\bin\startup.bat
```

3. Open `http://localhost:8080/JigsawMemoryPuzzle/` in a browser

---

## Instructions to Open the Game in a Browser

1. Ensure Tomcat is running
2. Navigate to `http://localhost:8080/JigsawMemoryPuzzle/`
3. Click "Play puzzle" → enter your name → study the image → rearrange the 12 pieces
4. Click "Restart" to play again, or "View leaderboard" to see scores

---

## Instructions to Verify Score Saving and Leaderboard Functionality

1. Play a complete game and enter a name
2. On the completion screen, verify "Score saved successfully." appears
3. Click "View leaderboard" — the leaderboard should display a table with:
   - Rank #
   - Player name
   - Completion time (formatted as HH:MM or MM:SS)
   - Score (higher is better)
4. If no scores appear, ensure Tomcat is running and `db.properties` has correct credentials

---

## Common Errors & Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `404 - Not Found` when accessing the game | WAR not deployed or Tomcat not running | Deploy `target/JigsawMemoryPuzzle.war` to Tomcat and start it |
| `Cannot load JDBC driver` | MySQL JDBC driver missing or `db.properties` misconfigured | Verify `db.url`, `db.username`, `db.password` in `src/main/resources/db.properties` |
| Leaderboard shows "Start the Java server to view saved scores" | Server not running or API endpoints not reachable | Start Tomcat; ensure `api/leaderboard` endpoint is accessible |
| Score not saved — "Score was not saved" | Database connection failure or schema not created | Run `database/schema.sql`; verify `db.properties` credentials |
| Pieces won't snap into place | Browser compatibility or JavaScript error | Use Chrome, Edge, or Firefox; check browser console for errors |

---

## Team & Contributor Information

- **Project owner:** [harshad-19](https://github.com/harshad-19)
- **Team member:** [nowhere9900](https://github.com/nowhere9900)

---

## License

This project is for educational purposes as a college mini-project. No license is selected yet. If adding a license, choose one appropriate for academic collaboration.

---

## Contribution Workflow (for teammates)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harshad-19/JigsawMemoryPuzzle.git
   cd JigsawMemoryPuzzle
   ```

2. **Create a branch:**
   ```bash
   git checkout -b feature/your-short-description
   ```

3. **Configure prerequisites:**
   - Copy `db.properties.example` → `db.properties` with your MySQL credentials
   - Run `database/schema.sql` to set up the database
   - Run `mvn clean package` to build

4. **Make changes** — Preserve working behavior. Do not refactor unrelated code, change API endpoints, or modify scoring logic.

5. **Test locally:**
   - Deploy the WAR to Tomcat
   - Verify the game loads, scores save, and the leaderboard works

6. **Commit & push:**
   ```bash
   git add .
   git commit -m "fix: description of change"
   git push origin feature/your-short-description
   ```

7. **Open a Pull Request** on GitHub against the `main` branch

8. **Never commit `db.properties`** — it is listed in `.gitignore`

---

*Generated for the Jigsaw Memory Puzzle college project. Preserves all existing code, APIs, and database structure.*