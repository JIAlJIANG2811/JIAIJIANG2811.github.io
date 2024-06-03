// 存放地图
var map;
// 用来存储绘制的矢量图形
var vectorSource;
// 用来显示矢量图形
var vectorLayer;
// 存放地址对应的点坐标
var newCenter;
//
var draw;
// 存放叠置到图层上的注释等东西
var overlay;
//
var lineLengthDiv;
var lineCounter = 0;

// 这个.js文件其实就是在使用Openlayers框架中的类，分成函数是为了看起来简单，不至于代码全堆到一起
// 为了简洁，把ol.Map类的参数设置放到一个函数里
function initalMap(){
    vectorSource = new ol.source.Vector();
    vectorLayer = new ol.layer.Vector({source:vectorSource});

    map = new ol.Map({
        // Set the target to the map div
        target: 'map',
        // Add the layers to the map
        layers: [
            // Create a tile layer using the OpenStreetMap source
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            vectorLayer
        ],
        // Set the view for the map
        view: new ol.View({
            center: ol.proj.fromLonLat([120, 40]), // Set the center of the map
            zoom: 4 // Set the initial zoom level
        })
    });

    overlay = new ol.Overlay({
        element: document.getElementById('popup'),
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -10]
    });
    map.addOverlay(overlay);

    lineLengthDiv = $("#lineLength");
}

function addWithView(address){
    $.getJSON('https://nominatim.openstreetmap.org/search', {
        q: address,
        format: 'json',
        addressdetails: 1,
        limit: 1
    }, function (data) {
        if (data.length > 0) {
            // change the view of map to the location queried
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            const view = map.getView();
            newCenter = ol.proj.fromLonLat([lon, lat]);
            view.setCenter(newCenter);
            view.setZoom(14); // Set the zoom level

            // 调用函数在坐标处添加一个指示性的图标
            addMarker(newCenter);
            // 为地名添加名称标签
            addLabel(newCenter);

        } else {
            alert('Address not found');
        }
    });

}

// 利用坐标数据添加点图标标示
function addMarker(markerPosition){
    // Initialize vector source and layer if not already initialized
    if (!vectorSource) {
        vectorSource = new ol.source.Vector();
    }
    if (!vectorLayer) {
        vectorLayer = new ol.layer.Vector({
            source: vectorSource,
        });
        // 先将图层添加到地图中
        map.addLayer(vectorLayer);  // Assuming `map` is your OpenLayers map object
    }

    // Add a marker at the new location
    var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(markerPosition),
    });

    // Define the style with an icon
    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            imgSize: [100, 100],
            scale: 0.5,
            src: 'img/marker.png'
        })
    });

    // Apply the style to the feature
    iconFeature.setStyle(iconStyle);

    // 为矢量源添加点要素（先清楚后添加）
    vectorSource.clear();
    vectorSource.addFeature(iconFeature);
}

// 将检索的地点名添加到坐标处
function addLabel(labelPosition){
    // Add text label
    $("#label-container").html("<p>"+myAddress+"</p>").show();
    var overlayForAddress = new ol.Overlay({
        position: labelPosition,
        positioning: 'top-center',
        element:document.getElementById('label-container')
    });
    map.addOverlay(overlayForAddress);
}

// 添加鹰眼图地图控件
function addOverviewMap(){
    var overview = new ol.control.OverviewMap({
        // Pass the main map instance to the overview map control
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([120, 40]), // Set the center of the overview map
            zoom: 4 // Set the initial zoom level of the overview map
        }),
        collapsed:false
    });
    map.addControl(overview);
}

//添加FullScreen地图控件
function addFullScreen(){
        var fullScreen = new ol.control.FullScreen({
            tipLabel:"Hey guys,my name is FullScreen."
        });
        map.addControl(fullScreen);
}

// 开始绘制模式
function startDrawing() {
    draw = new ol.interaction.Draw({
        source: vectorSource,
        type: 'LineString'
    });

    map.addInteraction(draw);

    draw.on('drawstart', function(evt) {
        var sketch = evt.feature;
        var tooltipElement = document.createElement('div');
        tooltipElement.className = 'tooltip tooltip-measure';
        overlay.setElement(tooltipElement);

        sketch.getGeometry().on('change', function(evt) {
            var geom = evt.target;
            var output = formatLength(geom);
            tooltipElement.innerHTML = output;
            overlay.setPosition(geom.getLastCoordinate());
        });
    });

    draw.on('drawend', function(evt) {
        var geom = evt.feature.getGeometry();
        var length = formatLength(geom);
        var endCoord = geom.getLastCoordinate();

        var lengthInfo = $("<div>")
            .text(`Line ${++lineCounter}: ${length}`)
            .attr("data-coord", endCoord)
            .addClass("line-info");

        lineLengthDiv.append(lengthInfo);

        var staticTooltipElement = document.createElement('div');
        staticTooltipElement.className = 'tooltip tooltip-static';
        staticTooltipElement.innerHTML = `Line ${lineCounter}: ${length}`;
        var staticOverlay = new ol.Overlay({
            element: staticTooltipElement,
            positioning: 'bottom-center',
            stopEvent: false,
            offset: [0, -10],
            position: endCoord
        });
        map.addOverlay(staticOverlay);

        overlay.setElement(null);
    });
}

// 停止绘制模式
function stopDrawing() {
    map.removeInteraction(draw);
}

function removeDrawing(){
    // 清除矢量图层上的所有要素
    vectorSource.clear();
    // 移除所有的静态标注
    map.getOverlays().clear();
    // 清空线段长度记录的div
    lineLengthDiv.empty();
    // 移除照片
    $("#picture-container img").remove();
}

// 计算绘制线段的长度
function formatLength(line) {
    var length = ol.sphere.getLength(line);
    var output;
    if (length > 100) {
        output = (Math.round(length / 1000 * 100) / 100) + ' km';
    } else {
        output = (Math.round(length * 100) / 100) + ' m';
    }
    return output;
}


