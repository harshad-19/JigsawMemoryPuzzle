
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
