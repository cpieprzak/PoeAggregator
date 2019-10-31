var loadLeagues = function(data, parameters)
{
	var leagues = JSON.parse(data);
	var leagueSelect = document.getElementById('league');
	var selectedIndex = 0;
	var currentIndex = 0;
	for(var i = 0; i < leagues.length; i++)
	{
		var league = leagues[i];
		var leagueDescription = league.description;

		if(leagueDescription.indexOf('SSF') < 0)
		{
			var option = document.createElement('option');
			if(leagueSelect.lastSavedValue)
			{
				if(leagueSelect.lastSavedValue == league.id)
				{
					selectedIndex = currentIndex;
				}
			}
			else
			{
				if(leagueDescription.indexOf('#LeagueStandard') > -1)
				{
					selectedIndex = currentIndex;
				}
			}
			
			option.value = league.id;
			option.appendChild(document.createTextNode(league.id));
			
			leagueSelect.appendChild(option);
			currentIndex++;
		}
	}
	leagueSelect.selectedIndex = selectedIndex;
};
callAjax('https://api.pathofexile.com/leagues', loadLeagues);