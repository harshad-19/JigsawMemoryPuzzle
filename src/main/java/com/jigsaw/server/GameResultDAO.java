
package com.jigsaw.server;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class GameResultDAO {

    public void saveResult(String playerName, String puzzleName,
                           int score, int completionTime)
            throws SQLException {

        String findUser = "SELECT user_id FROM users WHERE name = ?";
        String createUser = """
            INSERT INTO users (name, email, password_hash)
            VALUES (?, ?, ?)
            """;

        String findPuzzle =
                "SELECT puzzle_id FROM puzzles WHERE puzzle_name = ?";

        try (Connection connection = DBConnection.getConnection()) {
            connection.setAutoCommit(false);

            try {
                int userId;

                try (PreparedStatement ps =
                             connection.prepareStatement(findUser)) {
                    ps.setString(1, playerName);

                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) {
                            userId = rs.getInt("user_id");
                        } else {
                            String email =
                                    "player_" + java.util.UUID.randomUUID()
                                            + "@jigsaw.local";

                            try (PreparedStatement insert =
                                         connection.prepareStatement(
                                                 createUser,
                                                 PreparedStatement.RETURN_GENERATED_KEYS)) {
                                insert.setString(1, playerName);
                                insert.setString(2, email);
                                insert.setString(3, "guest-no-login");

                                insert.executeUpdate();

                                try (ResultSet keys =
                                             insert.getGeneratedKeys()) {
                                    if (!keys.next()) {
                                        throw new SQLException(
                                                "Could not create player.");
                                    }
                                    userId = keys.getInt(1);
                                }
                            }
                        }
                    }
                }

                int puzzleId;

                try (PreparedStatement ps =
                             connection.prepareStatement(findPuzzle)) {
                    ps.setString(1, puzzleName);

                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            throw new SQLException(
                                    "Puzzle not found: " + puzzleName);
                        }
                        puzzleId = rs.getInt("puzzle_id");
                    }
                }

                String insertResult = """
                    INSERT INTO game_results
                        (user_id, puzzle_id, score, completion_time)
                    VALUES (?, ?, ?, ?)
                    """;

                try (PreparedStatement ps =
                             connection.prepareStatement(insertResult)) {
                    ps.setInt(1, userId);
                    ps.setInt(2, puzzleId);
                    ps.setInt(3, score);
                    ps.setInt(4, completionTime);
                    ps.executeUpdate();
                }

                connection.commit();
            } catch (SQLException | RuntimeException e) {
                connection.rollback();
                throw e;
            } finally {
                connection.setAutoCommit(true);
            }
        }
    }

    public List<String[]> getTopResults() throws SQLException {
        List<String[]> results = new ArrayList<>();

        String sql = """
            SELECT u.name, p.puzzle_name,
                   g.score, g.completion_time, g.played_at
            FROM game_results g
            JOIN users u ON g.user_id = u.user_id
            JOIN puzzles p ON g.puzzle_id = p.puzzle_id
            ORDER BY g.score DESC,
                     g.completion_time ASC,
                     g.played_at ASC
            LIMIT 10
            """;

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement ps = connection.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                results.add(new String[] {
                    rs.getString("name"),
                    rs.getString("puzzle_name"),
                    String.valueOf(rs.getInt("score")),
                    String.valueOf(rs.getInt("completion_time")),
                    rs.getTimestamp("played_at").toString()
                });
            }
        }

        return results;
    }
}
