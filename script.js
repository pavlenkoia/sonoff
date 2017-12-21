window.onload = function() {
    loadDevice();
}

function loadDevice() {
    ajax.get('device.json',{},function(response) {

        var jsonDevice = JSON.parse(response);

        viewTemplate(jsonDevice, 'device');

    },true);
}

function viewTemplate(jsonContent, elemId){

    var element=document.getElementById(elemId);

    var html = '<div class="header"><h1>'+jsonContent.title+'</h1></div>';

    element.innerHTML = html;

    for(var i in jsonContent.blocks){

        var obj = jsonContent.blocks[i];

        html = '<div class="col-md-6"><div class="block"><h5>'+obj.title+'</h5>';

        for(var j in obj.controls){
            var control = obj.controls[j];

            if(control.type == 'input'){
                html += control.label;
                html += '<input class="form-control" name="'+control.name+'" value="'+control.value+'">';
            }

        }

        element.innerHTML += html;
    }
}