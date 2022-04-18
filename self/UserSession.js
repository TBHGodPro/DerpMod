const fs = require('fs-extra');
module.exports = async (client, Discord, wait) => {

	
	console.log('Discord User Session Updater Online')

	
	const me = await client.userFetch('668116405765537808')
	const meDM = await me.createDM()

	
	var userID = JSON.parse(fs.readFileSync(`${__dirname}/store/UserSessionUser.json`))[0]

	var user = await client.guilds.cache.find(async guild => {
		return await guild.members.fetch(userID).catch(err => {return}) ? true : false
	})
	user = await user.members.fetch(userID)
	
	var { presence, user:{username} } = user
	var activites = presence ? presence.activites : []

	
	msg = await meDM.messages.fetch('955106004448718858')

	
	function userFields() {
		var returnData = []
		for(var i = 0;i < users.length;i++) {
			returnData[returnData.length] = { name:`${usernames[users[i]]} (${users[i]})`, value:userStatuses[users[i]] }
		}
		return returnData
	}


	async function presenceEvent(oldUser, newUser) {

		var skipIntro = (oldUser === true)

		if(!skipIntro) {
			
			if(activities === newUser.activities) return

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


	async function changeUser(u) {

		if(!u) return

		user = u

		presenceEvent(true)

		fs.writeFileSync(`${__dirname}/store/UserSessionUser.txt`, users)
		
	}
	

	// client.on('presenceUpdate', presenceEvent)

	// client.on('interactionCreate', async(int) => {})
	
}