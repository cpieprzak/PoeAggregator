function ItemFetcher()
{	
	this.allRates = null;
	this.rates = [];
	this.fetchTimes = [];
	this.dontSendCount = 1;
	this.dontSendPrior = null;
	this.canFetch = function()
	{
		var passesRateTest = true;
		var now = new Date();
		if(this.dontSendPrior != null && this.dontSendPrior > now)
		{
			console.log('Cannot fetch due to rate limiting. Resuming at ' + this.dontSendPrior + '.');
			passesRateTest = false;
		}
		else
		{
			var cutoff = new Date(now.getTime() - (60 * 1000));
			for(var i = 0; i < this.rates.length; i++)
			{
				var rate = this.rates[i];
				if(passesRateTest && !rate.passes(now,this.fetchTimes))
				{
					console.log('Cannot fetch due to rate limiting.');
					passesRateTest = false;
				}
			}
			var tmp = [];
			for(var i = 0; i < this.fetchTimes.length; i++)
			{
				var time = this.fetchTimes[i];
				if(time > cutoff)
				{
					tmp.push(time);
				}
			}
			this.fetchTimes = tmp;
		}
		
		return passesRateTest;
	}
	
	this.fetch = function(itemRequest)
	{
		if(this.canFetch)
		{
			this.fetchTimes.push(new Date());
			var searchInfo = itemRequest.searchInfo;
			var getItemUrl = 'https://www.pathofexile.com/api/trade/fetch/';	
			var url = getItemUrl + itemRequest.listings;
			url += '?query=' + itemRequest.searchInfo.searchUrlPart;
			
			var callback = itemRequest.callback;
			if(callback == null)
			{
				callback = addItem;
			}
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.mycallback = callback;
			xmlhttp.onreadystatechange = function()
			{
				if (xmlhttp.readyState == 4)
				{
					if(xmlhttp.status == 200)
					{
						this.mycallback(xmlhttp.responseText, searchInfo);
						if(ItemFetchManager.dontSendPrior != null)
						{
							if(ItemFetchManager.dontSendPrior < new Date())
							{
								ItemFetchManager.dontSendCount = 1;
							}
						}
					}
					else if (xmlhttp.status === 429) 
					{
						ItemFetchManager.dontSendCount++;
						
						var delay = 15 * ItemFetchManager.dontSendCount * 1000;
						ItemFetchManager.dontSendPrior = new Date(new Date().getTime() + delay);
					}
					updateRateLimits(xmlhttp);
					if(searchInfo.viewId == 'display-window')
					{
						playSound(searchInfo.soundId, searchInfo.soundVolume);
					}
				}		
			}
			xmlhttp.open("GET", url, true);
			xmlhttp.send();
		}
	}
}


var updateRateLimits = (xmlhttp) => {
			
	var ratelimitPolicy = xmlhttp.getResponseHeader('x-rate-limit-policy');
	if(ratelimitPolicy != null && ratelimitPolicy == 'trade-fetch-request-limit')
	{
		var rateLimits = xmlhttp.getResponseHeader('x-rate-limit-ip');
		if(rateLimits != null)
		{
			if(ItemFetchManager.allRates == null || ItemFetchManager.allRates != rateLimits)
			{
				ItemFetchManager.allRates = rateLimits;
				ItemFetchManager.rates = [];
				
				var parts = rateLimits.split(',');
				for(var i = 0; i < parts.length; i++)
				{							
					var rl = new RateLimit();
					rl.parse(parts[i]);
					ItemFetchManager.rates.push(rl);
				}
			}					
		}
	}
}

function RateLimit()
{
	this.requests = null;
	this.seconds = null;
	this.timeout = null;
	this.parse = function(rateString)
	{
		var limitParts = rateString.split(':');
		this.requests = limitParts[0];
		this.seconds = limitParts[1];
		if(limitParts.length > 2)
		{
			this.timeout = limitParts[2];
		}
	}
	this.passes = function(now, fetchTimes)
	{
		var passes = true;
		var cutoff = new Date(now.getTime() - (this.seconds * 1000));
		var count = 0;
		if(fetchTimes != null && fetchTimes.length > 0)
		{
			for(var i = 0; i < fetchTimes.length; i++)
			{
				if(fetchTimes[i] > cutoff)
				{
					count++;
					if(count >= this.requests)
					{
						passes = false;
						break;
					}
				}
			}
		}
		return passes;
	}
	this.log = function()
	{
		var msg = this.requests + ' requests ';
		msg += ' per ' + this.seconds + ' seconds';
		if(this.timeout != null)
		{
			msg += ' | timeout = ' + this.timeout;
		}
		console.log(msg);
	}
}

var ItemFetchManager = new ItemFetcher(); 