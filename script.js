window.onload = function() {
    loadDevice('device.json');
}

var configJson = {};
var intIDs = [];

function loadDevice(device_json) {
    ajax.get('config.json',{},function(response) {
        configJson = JSON.parse(response);

        if(configJson.deviceName != undefined){
            document.title = configJson.deviceName;
        }

        ajax.get(device_json,{},function(response) {

            var jsonDevice = JSON.parse(response);

            viewTemplate(jsonDevice, 'device');

            for(var i in document.forms){
                var form = document.forms[i];
                if(form.addEventListener){
                    for (var j in form.elements){
                        var element = form.elements[j];
                        if((element.tagName === 'INPUT' || element.tagName === 'SELECT')){
                            element.addEventListener('keydown', function(event) {
                                if(event.keyCode == 13) {
                                    event.preventDefault();
                                }
                            });
                        }
                    }

                    if(!form.classList.contains('noajax')){
                        form.addEventListener('submit', function(event) {
                            formSubmit(this);
                            event.preventDefault();
                        });
                    }

                }
            }

            var elements = document.querySelectorAll('#opt a.ajax');
            for (var i = 0; i < elements.length; i++) {
                elements[i].addEventListener('click', function(event) {
                    toggle('opt');
                    optAjax(this);
                    event.preventDefault();
                });
            }

        },true);
    },true);
}

function viewTemplate(jsonContent, elemId){

    var value;
    var html = "";

    var element=document.getElementById(elemId);

    html += '<div class="header">';

    if(jsonContent.opt != undefined){
        html += '<div class="btn-group pull-right"><a href="#" class="btn btn-default dropdown-toggle" onclick="toggle(\'opt\');return false;"><i class="opt-img"></i> <span></span> <span class="caret"></span></a><ul class="dropdown-menu hide" id="opt">';
        for(var i in jsonContent.opt){
            var opt = jsonContent.opt[i];
            var opt_class = opt.class != undefined ? opt.class : '';
            html += '<li><a href="'+opt.action+'" class="'+opt_class+'"><b>'+opt.name+'</b></a></li>';
        }
        html += '</ul></div>';
    }

    html += '<h1>'+jsonContent.title;

    if(jsonContent.subtitle != undefined){
        html += '<small class="show">'+jsonContent.subtitle+'</small>';
    }

    html += '</h1></div>';

    for(var i in jsonContent.blocks){

        var obj = jsonContent.blocks[i];

        html += '<div class="col-md-6"><div class="block"><h5>'+obj.title+'</h5>';

        var form_class = obj.form_class != undefined ? 'class="'+obj.form_class+'"'  : '';
        var form_file = obj.form_file === true ? 'enctype="multipart/form-data"' : '';
        html += '<form method="post" action="'+obj.action+'" '+form_class+' '+form_file+'>';

        for(var j in obj.controls){
            var control = obj.controls[j];

            if(control.type == 'input'){
                value = configJson[control.name] == undefined ? control.value : configJson[control.name];
                html += control.label;
                html += '<input class="form-control" name="'+control.name+'" value="'+value+'">';
            }
            if(control.type == 'text'){
                value = configJson[control.name] == undefined ? control.value : configJson[control.name];
                html += control.label;
                html += '<textarea class="form-control" name="'+control.name+'">'+value+'</textarea>';
            }
            else if(control.type == 'submit'){
                html += '<input type="submit" class="button submit" value="'+control.value+'">';
                html += '<div class="loader hide"></div>';
            }
            else if(control.type == 'checkbox'){
                html += '<label><input name="'+control.name+'" value="'+control.value+'" type="checkbox"> '+control.label+'</label>';
            }
            else if(control.type == 'select'){
                html += control.label;
                html += '<select name="'+control.name+'" class="form-control">';
                for(var x in control.options){
                    var option = control.options[x];
                    html += '<option value="'+option.value+'">'+option.name+'</option>';
                }
                html += '</select>';
            }
            else if(control.type == 'file'){
                value = configJson[control.name] == undefined ? control.value : configJson[control.name];
                html += control.label;
                html += '<input class="form-control" name="'+control.name+'" type="file">';
            }
            else if(control.type == 'hr'){
                html += '<hr>';
            }
            else if(control.type == 'template'){
                var delay = control.delay == undefined ? 1000 : control.delay;
                html += '<div class="template" data-template="'+control.template+'" data-update="'+control.update+'" data-delay="'+delay+'" data-tmpl=""><div class="loader"></div></div>';
            }
        }

        html += '</form>';

        html += '</div></div>';

    }

    html = replaceTemplate(html, configJson);

    for (var i = 0; i < intIDs.length; i++){
        clearInterval(intIDs[i]);
    }
    intIDs = [];

    element.innerHTML = html;

    setControlTemplates(element);
}

function replaceTemplate (str, jsonData){
    for(var key in jsonData){
        str = str.replace(new RegExp('{{'+key+'}}', 'g'), jsonData[key]);
    }
    return str;
}

function setControlTemplates(root) {
    var els = root.querySelectorAll('.template');
    for(var i in els){
        loadTmpl(els[i]);
    }
}

function loadTmpl(el) {
    if (typeof el.dataset !== 'undefined'){
        ajax.get(el.dataset.template,{},function(response) {
            if (typeof el.dataset !== 'undefined'){
                el.dataset.tmpl = response;
                if(el.dataset.update != undefined && el.dataset.update != ""){
                    loadTmplUpdate(el);
                    var intID = setInterval(function () {
                        loadTmplUpdate(el);
                    },el.dataset.delay);
                    intIDs.push(intID);
                }
            }
        });
    }
}
function loadTmplUpdate(el){
    if (typeof el.dataset !== 'undefined'){
        ajax.get(el.dataset.update,{},function(response) {
            var updateJson = JSON.parse(response);
            el.innerHTML = replaceTemplate (el.dataset.tmpl, updateJson);
        });
    }
}

function formSubmit(form) {

    var data = {};
    for (var i in form.elements){
        var element = form.elements[i];

        if((element.tagName === 'INPUT' || element.tagName === 'SELECT')&& element.name !== ''){

            if(element.type === "checkbox"){
                if(element.checked){
                    data[element.name] = element.value;
                }
            }else{
                data[element.name] = element.value;
            }

        }

    }
    var loader = form.querySelector('.loader');
    var submit = form.querySelector('.submit');
    loader.classList.remove('hide');
    submit.classList.add('hide');

    setTimeout(function () {
        ajax.post(form.action, data,function(response) {
            loader.classList.add('hide');
            submit.classList.remove('hide');
            var res = JSON.parse(response);
            console.log(res);
            if(res.result == 'error'){
                alert(res.msg);
            }else if(res.result == 'reload' || form.classList.contains ('reload')){
                location.reload();
            }
        },true);
    },1000);

}

function optAjax(obj) {
    var element=document.getElementById('device');
    element.innerHTML = '<div class="loader-bg"></div>';

    if(obj.classList.contains('restart')){
        ajax.get(obj.href,{},function(response) {
            var res = JSON.parse(response);
            if(res.result == 'success'){
                var intID = setInterval(function(){
                    ajax.get('/ping',{},function(response){
                        if(response == 'pong'){
                            clearInterval(intID);
                            location.reload();
                        }
                    },true);
                },1000);
            }
        },true);
    }else{
        loadDevice(obj.href);
    }
}