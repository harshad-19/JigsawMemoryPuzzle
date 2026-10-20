
package com.jigsaw.server;

import java.sql.Connection;
import java.sql.SQLException;

public class DBConnectionTest {

    public static void main(String[] args) {
        try (Connection connection = DBConnection.getConnection()) {

            if (connection.isValid(3)) {
                System.out.println("MySQL connection successful!");
                System.out.println(
                    "Database: " + connection.getCatalog()
                );
            }

        } catch (SQLException e) {
            System.err.println("MySQL connection failed.");
            e.printStackTrace();
        }
    }
}
