var allTrackedStats = {};
function TrackedStats()
{
	this.id = '';
	this.cost = '';
	this.onlineStatus = '';
	this.gone = false;
	
	this.setTrackedStats = function(result)
	{
		if(result != null)
		{
			if(result.gone)
			{
				this.gone = true;
			}
			else
			{
				this.gone = false;
			}
			if(result.id != null)
			{
				this.id = result.id;
			}
			var listing = result.listing;
			if(listing != null)
			{
				var price = listing.price;
				if(price != null)
				{
					this.cost = JSON.stringify(price);
				}
				this.onlineStatus = 'Offline';
				var account = listing.account;
				if(account != null)
				{
					var online = account.online;
					if(online != null)
					{
						this.onlineStatus = 'Online';
						if(online.status)
						{
							this.onlineStatus = online.status;
						}
					}
				}
			}
		}
	}
	this.alert = function(oldStats)
	{
		var alert = false;
		if(oldStats != null)
		{
			if(this.gone && !oldStats.gone)
			{
				alert = true;
			}
			if (oldStats.onlineStatus == 'Offline' && this.onlineStatus != 'Offline')
			{
				alert = true;
			}
			else if (oldStats.cost != this.cost)
			{
				alert = true;
			}
		}
		return alert;
	}
}