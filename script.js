window.onload = function() {
    loadDevice();
}

function loadDevice() {
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
}

function viewTemplate(jsonContent, elemId){

    var element=document.getElementById(elemId);

    var html = '<div class="header"><h1>'+jsonContent.title+'</h1></div>';

    element.innerHTML = html;

    for(var i in jsonContent.blocks){

        var obj = jsonContent.blocks[i];

        html = '<div class="col-md-6"><div class="block"><h5>'+obj.title+'</h5>';

        html += '<form method="post">';

        for(var j in obj.controls){
            var control = obj.controls[j];

            if(control.type == 'input'){
                html += control.label;
                html += '<input class="form-control" name="'+control.name+'" value="'+control.value+'">';
            }
            else if(control.type == 'submit'){
                html += '<input type="submit" class="button submit" value="'+control.value+'">';
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

        element.innerHTML += html;
    }
}

function formSubmit(form) {

    var data = {};
    for (var i in form.elements){
        var element = form.elements[i];

        if((element.tagName === 'INPUT' || element.tagName === 'SELECT')&& element.name !== ''){

            if(element.type === "checkbox" && element.checked){
                data[element.name] = element.value;
            }else{
                data[element.name] = element.value;
            }

        }

    }
    console.log(data);
}