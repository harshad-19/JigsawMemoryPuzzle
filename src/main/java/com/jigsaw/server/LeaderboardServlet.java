
package com.jigsaw.server;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

@WebServlet("/api/leaderboard")
public class LeaderboardServlet extends HttpServlet {

    private final GameResultDAO dao = new GameResultDAO();

    @Override
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            List<String[]> results = dao.getTopResults();
            JsonArray leaderboard = new JsonArray();

            for (String[] result : results) {
                JsonObject entry = new JsonObject();

                entry.addProperty("playerName", result[0]);
                entry.addProperty("puzzleName", result[1]);
                entry.addProperty("score", Integer.parseInt(result[2]));
                entry.addProperty(
                        "completionSeconds",
                        Integer.parseInt(result[3]));
                entry.addProperty("playedAt", result[4]);

                leaderboard.add(entry);
            }

            response.getWriter().write(
                    leaderboard.toString());

        } catch (SQLException e) {
            getServletContext().log(
                    "Could not retrieve leaderboard.", e);

            response.setStatus(
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR);

            response.getWriter().write(
                    "{\"error\":\"Could not load leaderboard.\"}");
        }
    }
}
