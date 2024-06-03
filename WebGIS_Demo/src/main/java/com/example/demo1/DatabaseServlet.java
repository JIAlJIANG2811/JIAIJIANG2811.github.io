package com.example.demo1;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.Connection;
import java.util.Map;

@WebServlet("/databaseServlet")
public class DatabaseServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // request就是.js程序发送过来的数据。
        // 利用setCharacterEncoding方法，设置它的编码方式为UTF-8，这样就会是中文
        request.setCharacterEncoding("UTF-8");
        // 利用getParameter方法获取别处提交的数据
        // String adcode是变量，是存储数据的容器； ”address“是一个字符串，是request中的一个key——因为request提交的数据类型为{address:具体的值}，是key-value的形式
        String address = request.getParameter("address");
        if (address == null || address.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing address parameter");
            return;
        }
        // 调用编写的数据库连接函数
        // 因为查的结果为乱码，所以url里加了一个 ?characterEncoding=UTF-8，如果没有问题的话可不用
        String url = "jdbc:postgresql://localhost:5433/WebGIS_Experiment?characterEncoding=UTF-8";
        String user = "postgres";
        String password = "five";
        Connection connDatabase = Database.databaseConnect(url, user, password);
        // 调用查询程序函数并加结果赋给变量adcode
        Map<String, String> result = Database.queryWithAddress(connDatabase, address);
        String adcode = result.get("adcode");
        String imgUrl = result.get("img_url");
        // 构建JSON格式的字符串
        String jsonString = "{\"adcode\": \"" + adcode + "\", \"imgUrl\": \"" + imgUrl + "\"}";
        // 将JSON字符串作为响应发送回客户端
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(jsonString);
    }
}
