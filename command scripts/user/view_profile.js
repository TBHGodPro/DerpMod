exports.run = async(Discord, client, wait, getData, setData) => {

	client.on('interactionCreate', async interaction => {
		if(interaction.commandName === 'View Profile') {await interaction.deferReply({ ephemeral:true });interaction.editReply(await require('../slash/profile.js').run(Discord, client, wait, getData, setData, interaction))}
	})
}