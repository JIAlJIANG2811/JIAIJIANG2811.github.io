<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<html lang="en">
<meta name="viewport" content="width=device-width, initial-scale=1">
<head>
    <meta charset="UTF-8">
    <title>Home</title>
    <link rel="stylesheet" href="homeStyle.css" ></link>
</head>
<body>
<div class="wrapper">
    <nav class="navbar">
        <img class="logo" src="img/whuLogo.png">
        <ul>
            <li><a href="#">主页</li>
            <li><a href="#">关于</li>
            <li><a href="#">服务</li>
            <li><a href="#">联系</li>
            <li><a href="#">反馈</li>
        </ul>
    </nav>
    <div class="center">
        <h1>欢迎来到Jungle的WebGIS</h1>

        <div class="buttons">
            <a href="/Demo/TravelMap.jsp" class="button-link">
                <button>探索使用吧</button>
            </a>
        </div>
    </div>
</div>
<script>
    // 获取按钮的元素
    var buttonElement = document.querySelector('.buttons button');

    // 添加点击事件监听器
    buttonElement.addEventListener('click', function() {
        // 跳转到目标页面
        window.location.href = '/TravelMap.jsp';
    });
</script>
</body>
</html>