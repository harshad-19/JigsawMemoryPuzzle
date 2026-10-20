
package com.jigsaw.server;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;
import java.util.regex.Pattern;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

@WebServlet("/api/results")
public class ResultServlet extends HttpServlet {

    private final GameResultDAO dao = new GameResultDAO();

    private static final Pattern NAME_PATTERN =
            Pattern.compile("[A-Za-z0-9 ]{1,24}");

    @Override
    protected void doPost(HttpServletRequest request,
                          HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            JsonObject data = JsonParser.parseReader(
                    request.getReader()).getAsJsonObject();

            String playerName = data.get("playerName").getAsString().trim();
            String puzzleName = data.get("puzzleName").getAsString();
            String difficulty = data.get("difficulty").getAsString();
            int seconds = data.get("completionSeconds").getAsInt();

            if (!NAME_PATTERN.matcher(playerName).matches()
                    || !"Cherry Blossom Memory".equals(puzzleName)
                    || !"Standard".equals(difficulty)
                    || seconds < 1 || seconds > 86400) {

                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write(
                        "{\"error\":\"Invalid game result.\"}");
                return;
            }

            int score = Math.max(100, 1800 - seconds * 2);

            dao.saveResult(playerName, puzzleName, score, seconds);

            response.setStatus(HttpServletResponse.SC_CREATED);
            response.getWriter().write(
                    "{\"message\":\"Result saved successfully.\"}");

        } catch (SQLException e) {
            getServletContext().log("Could not save game result.", e);
            response.setStatus(
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(
                    "{\"error\":\"Could not save result.\"}");

        } catch (RuntimeException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write(
                    "{\"error\":\"Invalid request data.\"}");
        }
    }
}
