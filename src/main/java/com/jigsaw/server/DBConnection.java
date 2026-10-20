
package com.jigsaw.server;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public final class DBConnection {

    private static final Properties properties = new Properties();

    static {
        try (InputStream input =
                     DBConnection.class.getClassLoader()
                             .getResourceAsStream("db.properties")) {

            if (input == null) {
                throw new IllegalStateException(
                        "db.properties was not found.");
            }

            properties.load(input);

        } catch (IOException e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    private DBConnection() {
    }

    public static Connection getConnection()
            throws SQLException {

        String url = properties.getProperty("db.url");
        String username = properties.getProperty("db.username");
        String password = properties.getProperty("db.password");

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new SQLException("MySQL JDBC driver not found.", e);
        }
        return DriverManager.getConnection(
                url, username, password);
    }
}
