var chatOut = document.querySelector('.chat');
var chatFilterBox = document.querySelector('#chat-filter-box');

document.addEventListener('localDataLoaded', () => {
    chatOut = document.querySelector('.chat');
    chatFilterBox = document.querySelector('#chat-filter-box');

    let getFilterElementAndText = () => {
        let filterElementAndText = [];
        for (let chatRow of document.querySelectorAll('.chat-row')) {
            filterElementAndText.push({ element : chatRow, text : chatRow.innerHTML});
        }
        return filterElementAndText;
    };

    configureFilter(document.querySelector('#chat-filter-box'), getFilterElementAndText);
});

function processLineForChat(line) {
    if(chatOut) {
        let div = document.createElement('div');
        div.classList.add('chat-row');
        div.append(document.createTextNode(line));
        if(!shouldShowFilteredObject(chatFilterBox.value, line)) div.classList.add('hidden');
        if (chatOut.childNodes) chatOut.insertBefore(div,chatOut.childNodes[0]);
        else chatOut.append(div);
    }
}

function clearChatRows() {
    for(let chat of document.querySelectorAll('.chat-row')) {
        chat.remove();
    }
}