package com.example.demo1;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.Connection;
import java.util.Map;
import java.util.Scanner;

// 这部分servlet代码是之前将取adcode和利用放到一起的时候写的，所以使用的是Servlet.java程序，但后来我把取adcode写到了DatabaseServlet.java中后，这里其实用js发送GET就好，不需要Servlet
// 不过因为时间不够，所以没有改为.js程序。大家不需要参考这个，自己用jQuery写一个就好
@WebServlet("/WeatherServlet")
public class WeatherServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // 设置字符为UTF-8
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        // 因高德返回的天气数据为json，设置response的类型也为json
        response.setContentType("application/json; charset=UTF-8");
        // 获取参数存储到变量中
        // String adcode是变量，是存储数据的容器； ”adcode“是一个字符串
        String adcode = request.getParameter("adcode");
        String extensions = request.getParameter("extensions");

        // 利用adcode调用高德的天气API
        String API_KEY = "93afac8ee981dd0a403988d00d998bfe"; //注意：调用天气API需要申请的是“Web服务API”，这个和之前的“Web端API”是不一样的哦
        String weatherApiUrl = String.format("https://restapi.amap.com/v3/weather/weatherInfo?city=%s&extensions=%s&key=%s", adcode, extensions, API_KEY);
        try {
            // 这一部分使用Java的HttpURLConnection接口来访问高德的API，获取天气数据
            // 将string转为url并连接高德API
            URL weahterurl = new URL(weatherApiUrl);
            HttpURLConnection connWeather = (HttpURLConnection) weahterurl.openConnection();
            // 使用GET方法
            connWeather.setRequestMethod("GET");
            // 使用Scanner类来接收得到的数据并处理
            Scanner scanner = new Scanner(connWeather.getInputStream(), "UTF-8");
            StringBuilder json = new StringBuilder();
            // 判断是否还有输入
            while (scanner.hasNext()) {
                // 将数据加入json中
                json.append(scanner.nextLine());
            }
            scanner.close();

            // 这一部分利用PrintWriter和resopnse将Servlet中的数据返回到html页面中
            PrintWriter out = response.getWriter();
            // 将json以字符串的形式写到控制台
            out.print(json.toString());
            // 强制将写入器中存在的所有数据写入相应的目的地，也就是发出get请求的html网页
            out.flush();
        } catch (IOException e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to fetch weather information");
        }
    }
}


