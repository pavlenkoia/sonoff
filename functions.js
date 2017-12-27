var ajax = {};
ajax.x = function () {
    var xhr;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    return xhr;
};

ajax.send = function (url, callback, method, data, async) {
    submit_disabled(true);
    if (async === undefined) {
        async = true;
    }
    var x = ajax.x();
    x.open(method, url, async);
    x.onreadystatechange = function () {
        if (x.readyState == 4) {
            submit_disabled(false);
            callback(x.responseText)
        }
    };
    if (method == 'POST') {
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    x.send(data)
};

ajax.get = function (url, data, callback, async) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async)
};

ajax.post = function (url, data, callback, async) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url, callback, 'POST', query.join('&'), async)
};

function submit_disabled(request){
    var element = document.getElementsByTagName("input");
    for (var i = 0; i < element.length; i++) {
        if (element[i].type === 'button') {element[i].disabled = request;}
    }
}

document.onclick = function(e) {
    if(!e.target.closest('.pull-right')){
        toggle('opt','show');
    }
}

function toggle(target,status) {
    if (document.getElementById(target)){
        var element = document.getElementById(target).classList;
        if (element.contains('hide')) {
            if (status != 'show') {
                element.remove('hide');
                element.add('show');
            }
        } else {
            if (status != 'hide') {
                element.remove('show');
                element.add('hide');
            }
        }
    }
    return false;
}
