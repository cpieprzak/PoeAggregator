var whisperTemplate = document.getElementById('trade-whisper-template');
whisperTemplate.remove();

function TradeWhisper(line)
{
    this.line = line;
    this.timestamp = '';
    this.from = '';
    this.itemName = '';
    this.price = '';
    this.priceQuantity = '';
    this.priceType = '';
    this.league = '';
    this.tab = '';
    this.position = '';
    this.msg = '';
    this.isBigTrade = line.includes('exalted');
    this.inviteMsg = '';
    this.isCommodityTrade = false;

    this.parseMessage = () => {
        try {
            var parts = this.line.split(' ');
            this.timestamp = getFormattedTime(parts[1]);
            parts = this.line.split(' @From ');
            this.from = this.line.split(' @From ')[1].split(':')[0].trim();
            if(this.from.includes('>')) {
                this.from = this.from.split('>')[1].trim();
            }
            this.inviteMsg = '/invite ' + this.from;
            if(autoCopyTradeWhisperInvite) {copyTextToClipboard(this.inviteMsg);}
            this.isCommodityTrade = this.line.includes('Hi, I\'d like to buy your ');
            if(this.isCommodityTrade) {
                this.isBigTrade = false;
                this.itemName = this.line.split('d like to buy your ')[1].split(' for my ')[0].trim();
                this.price = this.line.split('d like to buy your ')[1].split(' for my ')[1].trim().split(' in ')[0].trim();
                this.priceQuantity = this.price.split(' ')[0].trim();
                this.priceType = this.price.substr(this.price.indexOf(' ')+1).trim().toLowerCase();            
                this.league = this.line.split('d like to buy your ')[1].split(' for my ')[1].trim().split(' in ')[1].trim().replace('.',''); 
            }
            else if(this.line.includes(': Hi, I would like to buy your ')) {
                this.itemName = this.line.split(': Hi, I would like to buy your ')[1].split(' listed for ')[0].trim();
                this.price = this.line.split(' listed for ')[1].split(' in ')[0].trim();
                this.priceQuantity = this.price.split(' ')[0].trim();
                this.priceType = this.price.split(' ')[1].trim();
                this.league = this.line.split(' listed for ')[1].split(' in ')[1].split(' (')[0].trim();        
                this.tab = this.line.split(' (stash tab "')[1].split('"; position')[0].trim();
                this.position = this.line.split('"; position:')[1].split(')')[0].trim();
                if(this.position != '') {
                    this.position = '(' + this.position + ')';
                }
            }
        }
        catch (e) {
            console.log('Failed to parse line: ' + this.line);
        }
    }
    this.parseMessage();
    playTradeSound(this);

    this.toElement = () => {
        var element = whisperTemplate.cloneNode(true);
        element.classList.remove('hidden');
        element.querySelector('.trade-whisper-wrapper').classList.add('new');
        element.addEventListener("mouseenter", (e)=>{
            e.target.querySelector('.trade-whisper-wrapper').classList.remove('new');
            document.querySelector('#trade-whisper-display-button').classList.remove('new');
        });
        element.add
        if(this.isBigTrade)
        {
            element.classList.add('big-trade');
        }
        if(this.isCommodityTrade)
        {
            element.classList.add('commoditye-trade');
        }
        element.id = '';
        var variables = element.querySelectorAll('poe-var');
        for(var i = 0; i < variables.length; i++)
        {
            var variable = variables[i];
            var varTarget = variable.getAttribute('rel');
            var data = this[varTarget];
            var newElement = document.createElement('span');
            var newElementClass = 'v-' + varTarget;
            newElement.classList.add(newElementClass);
            var node = document.createTextNode(data);
            if(varTarget == 'priceType')
            {
                var priceImg = currencyImages[data];
                for (const [key, value] of Object.entries(currencyImages))
                {
                    var priceTypeString = data.toLowerCase()
                    .replace(' ','-')
                    .replace('\'','');
                    var currencyKey = key.toLowerCase();
                    if(priceTypeString.includes(currencyKey))
                    {
                        node = document.createElement('img');
                        node.src = value;
                        node.classList.add('currency-img');
                        node.title = data;
                        break;
                    }
                }
            }
            newElement.appendChild(node);
            variable.parentNode.insertBefore(newElement,variable);
            variable.remove();
        }

        var buttons = element.querySelectorAll('input[type="button"]');
        for(var i = 0; i < buttons.length; i++)
        {
            var button = buttons[i];
            button.inviteMsg = this.inviteMsg;
            button.from = this.from;
            button.itemName = this.itemName;
            button.price = this.price;
            button.onclick = (e) =>
            {
                var myself = e.target;
                if(myself.value == 'X')
                {
                    element.remove();
                }
                else
                {
                    myself.classList.add('copied');
                    var content = myself.value;
                    var msg = '';
                    var whisperPrefix = '@' + myself.from + ' ';
                    var myItem = myself.itemName + ' listed for ' + myself.price;
                    switch(content)
                    {
                        case 'Wait' :
                            msg = whisperPrefix + 'I\'m currently busy. Can I message you back in a few?';
                            break;
                        case 'Interested?' :
                            msg = whisperPrefix + 'Are you still interested in my ' + myItem + '?';
                            break;
                        case 'Invite' :
                            msg = myself.inviteMsg;
                            break;
                        case 'Sold' :
                            msg = whisperPrefix + 'I\'m sorry but ' + myItem + ' has sold. :(';
                            break;                            
                        case 'Trade' :
                            msg = '/tradewith ' + myself.from;
                            break;                                                     
                        case 'Kick' :
                            msg = '/kick ' + myself.from;
                            element.remove();
                            break;
                    }
                    copyTextToClipboard(msg);
                    sendCopyPasteToPoe();
                }
            };
        }
        
        return element;
    }
}

var getFormattedTime = function (militaryTime){
    var parts = militaryTime.split(':');
    var hours24 = parseInt(parts[0]);
    var hours = ((hours24 + 11) % 12) + 1;
    var amPm = hours24 > 11 ? 'pm' : 'am';
    var minutes = parts[1];

    return hours + ':' + minutes + amPm;
};

function updateAutoCopyTradeWhisperInvite(checkbox)
{
    if(checkbox)
    {
        autoCopyTradeWhisperInvite = checkbox.checked;
    }
}

function playTradeSound(tradeWhisper)
{
    var line = tradeWhisper.line;
    var soundId = document.getElementById('trade-notification-sound').value;
    var volume = document.getElementById('trade-notification-sound-volume').value;
    if(tradeWhisper.isBigTrade)
    {
        var bigSound = document.getElementById('big-trade-notification-sound').value
        if(bigSound.trim() != '')
        {
            soundId = bigSound;
            volume = document.getElementById('big-trade-notification-sound-volume').value;
        }
    }
    if(soundId.trim() != '')
    {
        playSound(soundId, volume);
    }
}
                