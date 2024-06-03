package com.example.demo1;

import java.sql.*;
import java.util.HashMap;
import java.util.Map;
import static java.lang.System.console;
import static java.lang.System.out;

public class Database {
    // Using JDBC = Java DataBase Connectivity
    // url="jdbc:postgresql://localhost:port/databaseName" 端口号默认为5432
    public static Connection databaseConnect(String url, String user, String password){
        Connection conn = null;
        try {
            // 使用这两行代码就能够完成连接
            Class.forName("org.postgresql.Driver");
            conn = DriverManager.getConnection(url, user, password);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return conn;
    }

    public static Map<String, String> queryWithAddress(Connection conn, String address){
        // Map类型存储结果
        Map<String, String> result = new HashMap<>();
        // "like" 进行匹配，取第一条数据作为结果
        String sql = "SELECT name,adcode,img_url FROM weather WHERE name LIKE ? LIMIT 1";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, "%"+address+"%");
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    result.put("name", rs.getString("name"));
                    result.put("adcode", rs.getString("adcode"));
                    result.put("img_url", rs.getString("img_url"));
                    //out.println("name: " + result.get("name") + " adcode: " + result.get("adcode") + "url: " + result.get("img_url") );
                }
                //释放资源
                rs.close();
                pstmt.close();
                conn.close();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return result;
    }

    public String getAdcode(Map<String, String> result){
        String adcode = result.get("adcode");
        return adcode;
    }

    public String getImgUrl(Map<String, String> result){
        String imgUrl = result.get("img_url");
        return imgUrl;
    }

    // 这个main函数主要是用来调试的，检验一下前面两个函数能不能在后端跑通
    public static void main(String[] args){
        String myUrl = "jdbc:postgresql://localhost:5433/WebGIS_Experiment";
        String myUserName = "postgres";
        String myPassword = "five";
        Connection conn = databaseConnect(myUrl, myUserName, myPassword);
        Map<String, String> result = queryWithAddress(conn, "武汉");
        String adcode = result.get("adcode");
        System.out.println(adcode);
    }

}


