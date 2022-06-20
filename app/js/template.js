let templateTag = 'poe-agg-template';
class PoeAggTemplate extends HTMLDivElement {
    constructor() { super(); }
}
customElements.define(templateTag, PoeAggTemplate, { extends: 'div' });

async function loadTemplate(id) {
    return new Promise((resolve, reject) => {
    let url = './html/' + id;
    let xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let placeholder = document.getElementById(id);
            let parent = placeholder.parentNode;
            let content = document.createElement('div');
            content.innerHTML = xhr.responseText;
            content = content.firstChild;
            parent.insertBefore(content, placeholder);
            placeholder.remove();
            resolve();
        }
        else reject();
    }
    xhr.onerror = () => { reject(); };
    xhr.open("GET", url, false);
    xhr.setRequestHeader('Content-type', 'text/html');
    xhr.send();   
    }); 
}

async function loadTemplates() {
    let templates = document.querySelectorAll(templateTag);
    while (templates?.length > 0) {
        for(let template of templates) {
            try { await loadTemplate(template.id); }
            catch(e) { console.log(e); }
        }
        templates = document.querySelectorAll(templateTag);
    }
    document.dispatchEvent(new Event('poeAggTemplateComplete'));
}

loadTemplates(document);