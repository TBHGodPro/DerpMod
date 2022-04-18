exports.run = async (Discord, client, wait) => {


	client.on('interactionCreate', async int => {
		await interactionCreate1(int)
		await interactionCreate2(int)
		await interactionCreate3(int)
	})


	async function interactionCreate1(interaction) {
		if (!interaction.isCommand()) return;

		const { commandName } = interaction;

		if (commandName === 'ban') {
			const row = new Discord.MessageActionRow()
			const guild = client.guilds.cache.get(interaction.member.guild.id);
			var selectMenu = new Discord.MessageSelectMenu()
			selectMenu.setCustomId('banUser')
			selectMenu.setPlaceholder('Select a User')
			selectMenu.setMaxValues(1)
			var members = await guild.members.fetch()
			var members = JSON.parse(JSON.stringify(members))
			members.forEach(member => {

				selectMenu.addOptions([{
					label: member.displayName,
					description: `ID: ${member.userId}`,
					value: member.userId
				}])

			})
			row.addComponents(
				selectMenu
			)

			await interaction.reply({ content: 'Please select a user to ban', ephemeral: true, components: [row] });
		}
	}


	async function interactionCreate2(interaction) {
		if (!interaction.isSelectMenu()) return

		if (interaction.customId === 'banUser') {

			var guild = client.guilds.cache.get(interaction.member.guild.id)

			var user = await guild.members.fetch(interaction.values[0])

			var row = new Discord.MessageActionRow()
			row.addComponents(
				new Discord.MessageButton()
					.setCustomId('banNo')
					.setLabel('No')
					.setStyle('DANGER'),

				new Discord.MessageButton()
					.setCustomId(`banYes${user.user.id}`)
					.setLabel('Yes')
					.setStyle('SUCCESS')
			)

			await interaction.update({ content: `Are you sure you would like to ban ${user.user.tag}?`, ephemeral: true, components: [row] })

		}
	}


	async function interactionCreate3(interaction) {
		if (!interaction.isButton()) return



		if (interaction.customId.substr(0, 6) === 'banYes') {

			const row = new Discord.MessageActionRow()
			row.addComponents(
				new Discord.MessageButton()
					.setCustomId('banNo')
					.setLabel('Back')
					.setStyle('PRIMARY')
			)

			var guild = client.guilds.cache.get(interaction.member.guild.id)

			var user = interaction.customId.substr(6)

			var user = await guild.members.fetch(user)

			if (user.bannable) {

				interaction.update({ content: `Successfully banned ${user.user.tag}`, ephemeral: true, components: [row] })

				user.ban()

			} else {

				interaction.update({ content: `Insufficient Permissions: Cannot ban ${user.user.tag}`, ephemeral: true, components: [row] })

			}

		} else if (interaction.customId === 'banNo') {
			const row = new Discord.MessageActionRow()
			const guild = client.guilds.cache.get(interaction.member.guild.id);
			var selectMenu = new Discord.MessageSelectMenu()
			selectMenu.setCustomId('banUser')
			selectMenu.setPlaceholder('Select a User')
			selectMenu.setMaxValues(1)
			var members = await guild.members.fetch()
			var members = JSON.parse(JSON.stringify(members))
			members.forEach(member => {

				selectMenu.addOptions([{
					label: member.displayName,
					description: `ID: ${member.userId}`,
					value: member.userId
				}])

			})
			row.addComponents(
				selectMenu
			)

			await interaction.update({ content: 'Please select a user to ban', ephemeral: true, components: [row] });
		}


	}



}