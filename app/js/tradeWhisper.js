var whisperTemplate = document.getElementById('trade-whisper-template');
whisperTemplate.remove();

function TradeWhisper(line,isBigTrade)
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
    this.isBigTrade = isBigTrade;

    this.parseMessage = () => {
        var parts = this.line.split(' ');
        this.timestamp = getFormattedTime(parts[1]);
        parts = this.line.split(' @From ');
        this.from = this.line.split(' @From ')[1].split(':')[0].trim();
        if(this.from.includes('>'))
        {
            this.from = this.from.split('>')[1].trim();
        }
        if(this.line.includes(': Hi, I would like to buy your '))
        {
            this.itemName = this.line.split(': Hi, I would like to buy your ')[1].split(' listed for ')[0].trim();
            this.price = this.line.split(' listed for ')[1].split(' in ')[0].trim();
            this.priceQuantity = this.price.split(' ')[0].trim();
            this.priceType = this.price.split(' ')[1].trim();
            this.league = this.line.split(' listed for ')[1].split(' in ')[1].split(' (')[0].trim();        
            this.tab = this.line.split(' (stash tab "')[1].split('"; position')[0].trim();
            this.position = this.line.split('"; position:')[1].split(')')[0].trim();
        }
    }
    
    this.toElement = () => {
        this.parseMessage();
        var element = whisperTemplate.cloneNode(true);
        element.classList.remove('hidden');
        if(this.isBigTrade)
        {
            element.classList.add('big-trade');
        }
        element.id = '';
        var variables = element.querySelectorAll('poe-var');
        for(var i = 0; i < variables.length; i++)
        {
            var variable = variables[i];
            var varTarget = variable.getAttribute('rel');
            var data = this[varTarget];
            var newElement = document.createElement('span');
            var node = document.createTextNode(data);
            if(varTarget == 'priceType')
            {
                var priceImg = currencyImages[data];
                if(priceImg != null)
                {
                    node = document.createElement('img');
                    node.src = priceImg;
                    node.classList.add('currency-img');
                    node.title = data;
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
                    var content = myself.value;
                    var msg = '';
                    var whisperPrefix = '@' + myself.from + ' ';
                    var myItem = myself.itemName + ' listed for ' + myself.price;
                    switch(content)
                    {
                        case 'Wait' :
                            msg = whisperPrefix + 'I\'m currently busy. Can I message you back in a few?';
                            break;
                        case 'Still interested?' :
                            msg = whisperPrefix + 'Are you still interested in ' + myItem + '?';
                            break;
                        case 'Invite' :
                            msg = '/invite ' + myself.from;
                            break;
                        case 'Sold' :
                            msg = whisperPrefix + 'I\'m sorry but ' + myItem + ' has sold. :(';
                            break;
                    }
                    copyTextToClipboard(msg);
                    myself.classList.add('copied');
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