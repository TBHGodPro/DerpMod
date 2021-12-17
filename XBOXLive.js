module.exports = async (client, Discord, fetch, wait) => {

	/* XBOX Live Status Updater */
	console.log('XBOX Live Status Updater Online')

	// Leah (Dino8293) XUID = 2535434439504902
	// Dylan (Dylanbrine9989) XUID (For tests) = 2535459281883157

	var message = await client.userFetch('668116405765537808')
	message = await message.createDM()
	message = await message.messages.fetch('921475771334262794')

	client.on('interactionCreate', async (int) => {
		if (!int.isSelectMenu()) return
		if (int.customId !== 'XBLUpdateUser') return

		int.message.embeds[0].title = `${int.message.components[0].components[0].options.find(option => option.value === int.values[0]).label}'s XBOX Live Status`
		int.update({ embeds: [new Discord.MessageEmbed().setTitle(int.message.embeds[0].title).setDescription('Updating...').setFields([])], components: [] })
		int.editReply(await loopFunc(true))
	})

	while (true) {
		await loopFunc()
	}
	async function loopFunc(sendBack) {
		var UserXUID = message.components[0] ? message.components[0].components[0].options.find(option => option.label === message.embeds[0].title.split("'")[0]).value : '2535434439504902'

		const UserGame = await fetch(`https://xbl.io/api/v2/${UserXUID}/presence`, {
			method: 'GET',
			headers: {
				'X-Authorization': process.env.API_KEY
			}
		}).then(res => res.json().catch(err => {
			console.log(err);
			return
		})).then(data => {

			if (data[0].state === 'Offline') {

				return data[0]

			} else {

				const game = data[0].devices.filter(device => {
					var games = device.titles.find(title => title.placement === 'Full')

					if (games !== undefined) {
						return true
					} else {
						return false
					}

				})[0].titles.find(title => title.placement === 'Full')

				game.state = data[0].state
				game.xuid = data[0].xuid

				return game

			}

		});

		const embed = new Discord.MessageEmbed()
			.setTitle(`${message.embeds[0].title.split("'")[0]}'s XBOX Live Status`)
			.setDescription(`The status of ${message.embeds[0].title.split("'")[0]} on XBOX Live.`)

		var oldEmb = message.embeds[0]
		var oldEmbTS = oldEmb.timestamp
		oldEmb.timestamp = null

		if (UserGame.state === 'Online') {
			embed.setColor('#00e600')
			embed.addFields({
				name: 'XUID',
				value: UserGame.xuid
			}, {
				name: 'Status',
				value: UserGame.state
			}, {
				name: 'Game',
				value: UserGame.name
			})

			if (oldEmb.fields.find(field => field.name === 'Status') ? oldEmb.fields.find(field => field.name === 'Status').value : 'Offline' === 'Offline') {

				embed.addFields({
					name: 'Since',
					value: new Date(UserGame.lastModified).toLocaleString('en-US', {
						timeZone: 'America/Chicago',
						weekday: 'short',
						year: 'numeric',
						month: 'short',
						day: 'numeric',
						hour: 'numeric',
						minute: 'numeric'
					})
				})

			} else {

				embed.addField('Since', oldEmb.fields.find(field => field.name === 'Since').value)

			}
		} else if (UserGame.state === 'Offline') {
			embed.setColor('#808080')
			embed.addFields({
				name: 'XUID',
				value: UserGame.xuid
			}, {
				name: 'Status',
				value: UserGame.state
			}, )
			if (UserGame.lastSeen !== undefined && oldEmb.fields.find(field => field.name === 'Last Seen') === undefined) {
				embed.addField('Last Seen', `${UserGame.lastSeen.titleName} on ${UserGame.lastSeen.deviceType} on ${new Date(UserGame.lastSeen.timestamp).toLocaleString('en-US', {timeZone:'America/Chicago', weekday: 'short', year:'numeric', month:'short', day:'numeric'})} at ${new Date(UserGame.lastSeen.timestamp).toLocaleString('en-US', {timeZone:'America/Chicago', hour:'numeric', minute:'numeric'})}`)
			} else if (oldEmb.fields.find(field => field.name === 'Last Seen') !== undefined && UserGame.lastSeen !== undefined) {
				embed.addField('Last Seen', oldEmb.fields.find(field => field.name === 'Last Seen').value)
			}
		}

		const switchUserRow = new Discord.MessageActionRow()
			.addComponents(
				new Discord.MessageSelectMenu()
				.setCustomId('XBLUpdateUser')
				.addOptions([{
						label: 'Dino8293',
						value: '2535434439504902',
						default: UserXUID === '2535434439504902'
					},
					{
						label: 'Dylanbrine9989',
						value: '2535459281883157',
						default: UserXUID === '2535459281883157'
					}
				])
				.setMinValues(1)
				.setMaxValues(1)
			)

		if (sendBack) {
			return {
				embeds: [embed],
				components: [switchUserRow]
			}
		}

		if (JSON.stringify(embed) !== JSON.stringify(oldEmb) || JSON.stringify(switchUserRow) !== JSON.stringify(message.components[0])) {
			embed.setTimestamp();
			await message.edit({
				embeds: [embed],
				components: [switchUserRow]
			})
		}

		await wait(60000)
	};
}