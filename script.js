window.onload = function() {
    //document.getElementById('device').innerHTML  = '<div class="loader-bg"></div>';
    setTimeout(function () {

    },2000);
    //loadDevice();
}

var configJson = {};

function loadDevice() {
    ajax.get('config.json',{},function(response) {
        configJson = JSON.parse(response);

        ajax.get('device.json',{},function(response) {

            var jsonDevice = JSON.parse(response);

            viewTemplate(jsonDevice, 'device');

            for(var i in document.forms){
                var form = document.forms[i];
                if(form.addEventListener){
                    form.addEventListener('keydown', function(event) {
                        if(event.keyCode == 13) {
                            event.preventDefault();
                        }
                    });
                    form.addEventListener('submit', function(event) {
                        formSubmit(this);

                        event.preventDefault();
                    });
                }
            }

        },true);
    },true);
}

function viewTemplate(jsonContent, elemId){

    var value;

    var element=document.getElementById(elemId);

    var html = '<div class="header"><h1>'+jsonContent.title+'</h1></div>';

    for(var i in jsonContent.blocks){

        var obj = jsonContent.blocks[i];

        html += '<div class="col-md-6"><div class="block"><h5>'+obj.title+'</h5>';

        var form_class = obj.form_class != undefined ? obj.form_class : '';

        html += '<form method="post" action="'+obj.action+'" class="'+form_class+'">';

        for(var j in obj.controls){
            var control = obj.controls[j];

            if(control.type == 'input'){
                value = configJson[control.name] == undefined ? control.value : configJson[control.name];
                html += control.label;
                html += '<input class="form-control" name="'+control.name+'" value="'+value+'">';
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
            else if(control.type == 'hr'){
                html += '<hr>';
            }
        }

        html += '</form>';

        html += '</div></div>';

    }

    html = replaceTemplate(html, configJson);

    element.innerHTML = html;
}

function replaceTemplate (str, jsonData){
    for(var key in jsonData){
        str = str.replace(new RegExp('{{'+key+'}}', 'g'), jsonData[key]);
    }
    return str;
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