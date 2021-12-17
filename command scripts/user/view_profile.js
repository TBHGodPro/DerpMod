exports.run = async(Discord, client, wait, getData, setData) => {

	client.on('interactionCreate', async interaction => {
		if(interaction.commandName === 'view_profile') {require('../slash/profile.js').run(Discord, client, wait, getData, setData, interaction)}
	})
}