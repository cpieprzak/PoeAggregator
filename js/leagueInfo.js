var loadLeagues = function(data, parameters)
{
	var leagues = JSON.parse(data);
	var leagueSelect = document.getElementById('league');
	var selectedIndex = 0;
	for(var i = 0; i < leagues.length; i++)
	{
		var league = leagues[i];
		var option = document.createElement('option');
		var leagueDescription = league.description;
		if(leagueDescription.indexOf('#LeagueStandard') > -1)
		{
			if(leagueDescription.indexOf('SSF') < 0)
			{
				option.selected = true;
			}
		}
		option.value = league.id;
		option.append(document.createTextNode(league.id));
		if(leagueSelect.lastSavedValue && leagueSelect.lastSavedValue == league.id)
		{
			selectedIndex = i;
		}
		leagueSelect.append(option);
	}
	leagueSelect.selectedIndex = selectedIndex;
};
callAjax('https://api.pathofexile.com/leagues',loadLeagues);