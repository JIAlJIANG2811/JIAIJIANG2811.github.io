// 使用jQuery库来进行异步传输，记得提前在,html文件中引入jQuery库
// 定义全局变量存储后续会用到的值
let myAdcode;
let myImgUrl;
let myAddress;

// 因js代码有hoisting特点，即变量和函数的声明都会被提升到最上面，所以这里把“主程序”放到最上面，方便理解执行了哪些功能
$(document).ready(function() {
    console.log("hello");
    // Openlayers.js文件中的函数
    initalMap();
    addOverviewMap();
    addFullScreen();
    $("#drawButton").click(startDrawing);
    $("#stopButton").click(stopDrawing);
    $('#removeButton').click(removeDrawing);
    //Ajax.js文件中的函数
    getAdcodeAjax();
    weatherAjax();
    futureWeatherAjax();
    // 双击关掉天气查询结果
    $('#todayWeather-btn').on('dblclick', function() {
        // 切换todayWeather-btn的显示/隐藏状态
        $('#weather-info-container').toggle();
    })
    $('#futureWeather-btn').on('dblclick', function() {
        // 切换future-weather-chart-container的显示/隐藏状态
        $('#future-weather-chart-container').toggle();
    })
    // $('chart_btn').on('click')
});

// 利用表单提交的地名，连接数据库，查询地点对应的adcode和imgUrl
function getAdcodeAjax(address){
    // 选择名称为address-from的html元素，当它submit的时候，执行function(e){...}
    $('#address-form').on('submit',function(e){
        // e默认情况下可能会跳转页面什么的，调用e.preventDefault()方法阻止它，我们有更重要的事情要处理
        e.preventDefault();
        // val()方法，val即value获取名称为address的元素的值，将它存到变量myAddress中
        myAddress = $('#address').val();
        // viewPointChange是Openlayers中定义的一个函数，能根据地址改变底图视图（暂时不用管）
        addWithView(myAddress);
        // 使用jQuery的ajax方法
        $.ajax({
            url: '/Demo/databaseServlet', // 我们想要发送参数的网址
            method: 'GET', // 要用GET还是POST方法
            data: { address: myAddress }, // 发送的数据，一般为key-value也就是json格式吧
            // 成功之后要对返回的参数进行怎样的操作（这里命名为data，其实随你取名）。我们将参数保存到.js的变量中
            success:function(data){
                console.log(data);
                myAdcode = data.adcode;
                myImgUrl = data.imgUrl;
                getPicture(myImgUrl);
            }
        })
    })
}

// 利用从数据库中取出来的img_url插入图片
function getPicture(img_url){
    // Clear the existing image if any
    $("#picture-container").empty();
    // Create an image element and set its source to the received imgUrl
    let img = $('<img>', {
        src: img_url,
        alt: 'City Image',
        class: 'picture'
    });
    // Append the image to the "picture" div
    $("#picture-container").append(img);
}

// 点击查询今日天气后，利用获得的adcode连接高德天气API，查询实时的天气数据
function weatherAjax() {
    $('#todayWeather-btn').on('click', function(e) {
        e.preventDefault();
        // Fetch weather information using the new WeatherServlet
        $.ajax({
            url: '/Demo/WeatherServlet',
            method: 'GET',
            data: {
                adcode: myAdcode,
                extensions:"base"
            },
            success: function(weatherData) {
                if (weatherData.status === '1') {
                    console.log(weatherData);
                    const weatherInfo = weatherData.lives[0];
                    const weatherHtml = `
                        <h3>今日${myAddress} ${weatherInfo.reporttime.substring(11)} 天气情况</h3>
                        <p>Weather: ${weatherInfo.weather}</p>
                        <p>Temperature: ${weatherInfo.temperature}°C</p>
                        <p>Wind Direction: ${weatherInfo.winddirection}</p>
                        <p>Wind Power: ${weatherInfo.windpower}</p>
                        <p>Humidity: ${weatherInfo.humidity}%</p>
                    `;
                    $('#weather-info-container').html(weatherHtml);

                    // Add text label
                    /**
                    $("#label").html("</br>" + weatherInfo.city);
                    var newOverlay = new ol.Overlay({
                        position: newCenter,
                        positioning: 'top-center',
                        element: document.getElementById('label')
                    });
                    map.addOverlay(newOverlay);
                     */

                } else {
                    $('#weather-info-container').html('<p>Failed to fetch weather information.</p>');
                }
            }
        });
    });
}

function futureWeatherAjax(){
    $('#futureWeather-btn').on('click',function(e){
        e.preventDefault();
        console.log("future");
        $.ajax({
            url: '/Demo/WeatherServlet',
            method: 'GET',
            data: {
                adcode: myAdcode,
                extensions:"all"
            },
            success:function(data){
                let dataset = getFutureInfo(data);
                let daytimeTem = dataset[0];
                let nightTem = dataset[1];
                let dayWeather = dataset[2];
                let nightWeather = dataset[3];
                echartDraw(daytimeTem, nightTem, dayWeather, nightWeather);
            }
        })
    });
}

// 将天气API返回的未来四天的天气json数据拆分成白天均温、白天天气、夜晚均温、夜晚天气，从而适应echart所需要的数据结构
function getFutureInfo(futureData){
    // futureData 是一个Object，其结构为 {?,?,forecasts:Array(0)}
    const forecastInfo = futureData.forecasts[0];
    const cast = forecastInfo.casts;
    let dayTem = [];
    let nightTem = [];
    let dayWeather = [];
    let nightWeather = [];
    for(let i=0;i<4;i++){
        dayTem.push(cast[i].daytemp);
        nightTem.push(cast[i].nighttemp);
        dayWeather.push(cast[i].dayweather);
        nightWeather.push(cast[i].nightweather);
    }
    let dataset = [dayTem, nightTem, dayWeather, nightWeather];
    console.log(dataset);
    return dataset;
}

// 为了避免过于冗长，将echart的配置代码单独放到一个函数中
// 注意，给echart分配div的时候，一定要指定长宽，不然echart不会显示
function echartDraw(daytimeTem, nightTem, dayWeather, nightWeather){
    var myChart = echarts.init(document.getElementById('future-weather-chart-container'));
    let timeAxis = ['1 Day', '2 Days', '3 Days', '4 Days'];
    let dayMarkpointPara = parameterForMarkPoint(timeAxis, daytimeTem, dayWeather);
    let nightMarkpointPara = parameterForMarkPoint(timeAxis, nightTem, nightWeather);
    var option = {
        title: {
            text: '随后四天的天气',
            textStyle: { fontFamily: 'Arial, sans-serif' }
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            right: 20,
            textStyle: { fontFamily: 'Arial, sans-serif' }
        },
        /**
         * toolbox控件，这里给略去
         toolbox: {
    show: true,
    feature: {
      dataZoom: {
        yAxisIndex: 'none'
      },
      dataView: { readOnly: false },
      magicType: { type: ['line', 'bar'] },
      restore: {},
      saveAsImage: {}
    }
  },
         */
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: timeAxis
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value}°C',
                textStyle: { fontFamily: 'Arial, sans-serif' }
            }
        },
        series: [
            {
                name: 'Daytime',
                type: 'line',
                data: daytimeTem,
                color: '#FF7F50', // Orange color for daytime line
                lineStyle: {
                    width: 2 // Increase line width for daytime
                },
                markPoint: {
                    data: dayMarkpointPara
                },
                markLine: {
                    symbol:'none',
                    data: [{
                        type: 'average',
                        name: '昼均温',
                        label: {
                            formatter: '{b}: {c}', // 标签的内容，{b} 表示名称，{c} 表示数值
                            position: 'end', // 标签的位置，insideEnd 表示在线末端内部
                            offset:[-50,-25],
                            color: '#333', // 标签颜色
                        },
                        lineStyle: {
                            color: '#FF7F50', // Use the same color for average line
                            type: 'dashed'
                        },
                    }]
                }
            },
            {
                name: 'Night',
                type: 'line',
                data: nightTem,
                color: '#4169E1', // Royal blue color for nighttime line
                lineStyle: {
                    width: 2 // Increase line width for nighttime
                },
                markPoint: {
                    data: nightMarkpointPara
                },
                markLine: {
                    symbol:'none',
                    data: [{
                        type: 'average',
                        name: '夜均温',
                        label: {
                            formatter: '{b}: {c}', // 标签的内容，{b} 表示名称，{c} 表示数值
                            position: 'end', // 标签的位置，insideEnd 表示在线末端内部
                            offset:[-50,50],
                            color: '#333', // 标签颜色
                        },
                        lineStyle: {
                            color: '#4169E1', // Use the same color for average line
                            type: 'dashed'
                        }
                    }]
                }
            },
        ]
    };
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);

}

// 因为echart中的markPoint需要设置许多参数，会显得代码冗长，创这个函数将markPoint所需参数放到一个变量中
function parameterForMarkPoint(xAxis, yAxis, Weather){
    let markpointParameter = [];
    let aSymbolSize = [30, 30];
    for(let i=0; i<4; i++){
        let aCoord=[xAxis[i], yAxis[i]];
        let aSymbol = getWeatherIcon(Weather[i]);
        // 修改之后的结构
        markpointParameter[i] = {
            coord:aCoord,
            symbol:aSymbol,
            symbolSize:aSymbolSize
        }
    }
    return markpointParameter;
}

// 天气情况数据包括：晴，多云，小雨，中雨，大雨……这里将它们归纳整合为晴、雨、云、其他四类，分别给一个图标
function getWeatherIcon(data){
    if (data.includes('雨')) {
        return 'image://img/rainy.png';
    } else if (data.includes('晴')) {
        return 'image://img/sunny.png';
    } else if (data.includes('云')) {
        return 'image://img/cloudy.png';
    } else {
        return 'image://img/else.png';
    }
}







