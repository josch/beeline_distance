var localSearch = new GlocalSearch();
var routePoints = new Array(0);
var routeMarkers = new Array(0);
var lineWidth = 1;
var lineColor = '#ff0066';
var routePath;
var map = new google.maps.Map(document.getElementById("map_canvas"), {
    zoom: 1,
    center: new google.maps.LatLng(0, 0),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    draggableCursor: 'crosshair',
    mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
    }
});
google.maps.event.addListener(map, 'click', function (event) {
    clickatpoint(event.latLng);
});

function clickatpoint(point) {
    routePoints.push(point);
    var marker = placeMarker(point, routePoints.length);
    routeMarkers.push(marker);
    if (!(routePath == undefined)) {
        routePath.setMap(null);
    }
    routePath = getRoutePath();
    routePath.setMap(map);
    updateDisplay();
}
function getRoutePath() {
    var routePath = new google.maps.Polyline({
        path: routePoints,
        strokeColor: lineColor,
        strokeOpacity: 1.0,
        strokeWeight: lineWidth,
        geodesic: true
    });
    return routePath;
}
function clearMap() {
    if (routeMarkers) {
        for (i in routeMarkers) {
            routeMarkers[i].setMap(null);
        }
    }
    routePoints = new Array(0);
    routeMarkers = new Array(0);
    if (!(routePath == undefined)) {
        routePath.setMap(null);
    }
    document.getElementById("distance").value = "0.000";
}
function ftn_quickfind(address) {
    localSearch.setSearchCompleteCallback(null, function () {
        if (localSearch.results[0]) {
            clickatpoint(new google.maps.LatLng(localSearch.results[0].lat,
                                                localSearch.results[0].lng));
        }
    });
    localSearch.execute(address);
}
function placeMarker(location, number) {
    var image = new google.maps.MarkerImage('http://www.daftlogic.com/images/gmmarkersv3/stripes.png', new google.maps.Size(20, 34), new google.maps.Point(0, 0), new google.maps.Point(9, 33));
    var shadow = new google.maps.MarkerImage('http://www.daftlogic.com/images/gmmarkersv3/shadow.png', new google.maps.Size(28, 22), new google.maps.Point(0, 0), new google.maps.Point(1, 22));
    var text = "(" + (number) + ")" + location;
    var marker = new google.maps.Marker({
        position: location,
        map: map,
        shadow: shadow,
        icon: image,
        title: text,
        draggable: true
    });
    google.maps.event.addListener(marker, 'dragend', function (event) {
        routePoints[number - 1] = event.latLng;
        routePath.setMap(null);
        routePath = getRoutePath();
        routePath.setMap(map);
        updateDisplay();
    });
    return marker;
}
function clearLastLeg() {
    if (routePoints.length < 2) return;
    routeMarkers[routeMarkers.length - 1].setMap(null);
    if (!(routePath == undefined)) {
        routePath.setMap(null);
    }
    routePoints.pop();
    routeMarkers.pop();
    routePath = getRoutePath();
    routePath.setMap(map);
    updateDisplay();
}
function greatcircle(lat1, lon1, lat2, lon2) {
    var ra = Math.PI / 180;
    var f = Math.cos(lat1 * ra) * Math.cos(lat2 * ra);
        f *= Math.pow(Math.sin((lon1 * ra - lon2 * ra) / 2), 2);
        f += Math.pow(Math.sin((lat1 * ra - lat2 * ra) / 2), 2);
        f = 6372802 * 2 * Math.asin(Math.sqrt(f)); // geometric mean
        // read: http://math.wikia.com/index.php?title=Elliptical_great-circle_radius_average
        //       http://en.wikipedia.org/w/index.php?title=Talk:Earth/Archive_7&amp;oldid=256964396#Mean_radius
    return f;
}
function updateDisplay() {
    var a = routePath.getPath(),
        len = a.getLength(),
        dist = 0;
    for (var i = 0; i < len - 1; i++) {
        var pos1 = a.getAt(i);
        var pos2 = a.getAt(i+1);
        dist += greatcircle(pos1.lat(), pos1.lng(), pos2.lat(), pos2.lng());
    }
    document.getElementById("distance").value = dist.toFixed();
}

function submitenter(myfield, e) {
    var keycode;
    if (window.event) keycode = window.event.keyCode;
    else if (e) keycode = e.which;
    else return true;
    if (keycode == 13) {
        ftn_quickfind(myfield.value);
        return false;
    } else {
        return true;
    }
}
