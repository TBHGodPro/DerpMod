const fs = require('fs-extra');
module.exports = async (client, Discord, wait) => {

	
	console.log('Discord User Status Updater Online')

	
	const me = await client.userFetch('668116405765537808')
	const meDM = await me.createDM()

	
	var users = JSON.parse(fs.readFileSync(`${__dirname}/store/UserStatusUser.json`))

	
	var preBotGuilds = await client.guildFetch()
	preBotGuilds = preBotGuilds.map(guild => client.guilds.cache.find(g => g.id === guild.id))

	var botGuilds = []
	
	for(var i = 0;i < preBotGuilds.length;i++) {
		botGuilds[i] = preBotGuilds[i]
		botGuilds[i].members.cache = await preBotGuilds[i].members.fetch()
	}

	async function fetchUser(id, newFetch) {
		var id = id.toString()
		if(!newFetch) return botGuilds.find(guild => guild.members.cache.find(u => u.id === id))?.members.cache.find(u => u.user.id === id);
		var guild = botGuilds.find(guild => guild.members.cache.find(u => u.user.id === id))
		return await botGuilds[botGuilds.indexOf(guild)]?.members.fetch(id);
	}
	

	
	const userStatusesArray = []
	for(var i = 0;i<users.length;i++) {
		var user = await fetchUser(users[i], true)
		user = user.presence
		userStatusesArray[userStatusesArray.length] = {[users[i]]: user === null ? 'offline' : user.status === 'offline' ? 'offline' : 'online'}
	}
	await userStatusesArray[users.length-1]

	
	const userStatuses = {}
	for(var i = 0;i < userStatusesArray.length;i++) {
		userStatuses[Object.keys(userStatusesArray[i])] = userStatusesArray[i][Object.keys(userStatusesArray[i])]
	}
	

	const usernames = {}
	for(var i = 0;i < users.length;i++) {
		usernames[users[i]] = await fetchUser(users[i])
		usernames[users[i]] = usernames[users[i]].user.username
	}

	msg = await meDM.messages.fetch('954018812443893760')

	
	function userFields() {
		var returnData = []
		for(var i = 0;i < users.length;i++) {
			returnData[returnData.length] = { name:`${usernames[users[i]]} (${users[i]})`, value:userStatuses[users[i]] }
		}
		return returnData
	}


	async function presenceEvent(oldUser, newUser, skipIntro) {

		if(!skipIntro) {
			
			if(!users.includes(newUser.user.id)) return
			
			var user = newUser.user
	
			if(usernames[user.id] !== user.username) usernames[user.id] = user.username
			
			var oldStatus = oldUser === null ? 'offline' : oldUser.status === 'offline' ? 'offline' : 'online'
			var newStatus = oldUser === null ? 'offline' : newUser.status === 'offline' ? 'offline' : 'online'
	
			if(oldStatus === newStatus || newStatus === userStatuses[user.id]) return
	
			userStatuses[user.id] = newStatus

		}

		var row = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageButton()
						.setCustomId('SelfUserUpdaterUpdate')
						.setLabel('Update')
						.setStyle('PRIMARY'),
					new Discord.MessageButton()
						.setCustomId('SelfUserUpdaterAdd')
						.setLabel('Add User')
						.setStyle('SUCCESS'),
					new Discord.MessageButton()
							.setCustomId('SelfUserUpdaterRemove')
						.setLabel('Remove User')
						.setStyle('DANGER')
				)
	
		var embed = new Discord.MessageEmbed()
			.setTitle('User Status Updater')
			.setColor('#007dff')
			.setDescription('Statuses of users added.')
			.addFields(userFields())
	
		msg.edit({ embeds: [embed], components: [row] })
		
		if(!skipIntro) me.send({ content:`${user.username} is now ${newStatus}.` }).then(msg => {setTimeout(() => {msg.delete()}, 500)})
		
	}


	async function changeUsers(type, user) {
		if(!type || !user) return
		if((type !== 'add' && type !== 'sub') || parseInt(user) === 'NaN') return

		if(type === 'add') {
			
			users[users.length] = user
			
			var status = fetchUser(user).presence
			userStatuses[user] = status === null ? 'offline' : status.status === 'offline' ? 'offline' : 'online'

			usernames[user] = fetchUser(user).user.username

			presenceEvent(null, null, true)
			
		} else if(type === 'sub') {

			users.splice(users.indexOf(user), 1)
			await delete userStatuses[user];
			await delete usernames[user];

			presenceEvent(null, null, true)
			
		}

		fs.writeFileSync(`${__dirname}/store/UserStatusUser.json`, JSON.stringify(users))
		
	}
	

	client.on('presenceUpdate', presenceEvent)

	client.on('interactionCreate', async(int) => {
		if (!int.isButton()) return
		if (int.customId.substr(0, 15) !== 'SelfUserUpdater') return

		var type = int.customId.substr(15)
		
		await int.deferUpdate()
			
		if(type === 'Update') {
			presenceEvent(null, null, true)
		} else if(type === 'Add') {

			await int.followUp({ content:'Please type the ID of the user to Add' }).then(async msg => {
				await int.channel.awaitMessages({ filter:(message) => {
				return fetchUser(message.content) && users[users.indexOf(message.content)] === undefined ? true : false
				}, max:1 }).then(collected => {
					changeUsers('add', collected.first().content)
				})
				await msg.delete()
			})
			
		} else if(type === 'Remove') {

			await int.followUp({ content:'Please type the ID of the user to Remove' }).then(async msg => {
				await int.channel.awaitMessages({ filter:(message) => {
				return users.find(u => u === message.content) ? true : false
				}, max:1 }).then(collected => {
					changeUsers('sub', collected.first().content)
				})
				await msg.delete()
			})
		}
		
	})
	
	
}