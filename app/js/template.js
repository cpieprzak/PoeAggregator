var templateTag = 'poe-agg-template';
class PoeAggTemplate extends HTMLDivElement 
{
    constructor()
    {
        super();
    }
}
customElements.define(templateTag, PoeAggTemplate, { extends: 'div' });

function loadTemplate(id)
{
    var url = './html/' + id;
    var xhr = new XMLHttpRequest();
    xhr.templateId = id;
    xhr.onreadystatechange = function (e) 
    {
        if (xhr.readyState == 4 && xhr.status == 200) 
        {
            var placeholder = document.getElementById(this.templateId);
            var parent = placeholder.parentNode;
            var content = document.createElement('div');
            content.innerHTML = xhr.responseText;
            parent.insertBefore(content, placeholder);
            placeholder.remove();
        }
    }
    xhr.open("GET", url, false);
    xhr.setRequestHeader('Content-type', 'text/html');
    xhr.send();
}

var templates = document.querySelectorAll(templateTag);
while(templates != null && templates.length > 0)
{
    for(var i = 0; i < templates.length; i++)
    {
        var template = templates[i];
        try
        {
            loadTemplate(template.id);
        }
        catch(e)
        {
            console.log(e);
        }
    }
    templates = document.querySelectorAll(templateTag);
}
