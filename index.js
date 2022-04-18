const express = require('express')

const app = express()

app.get('/', (req, res) => {
	res.send('Hello World!')
})

app.listen(3000, () => {
	console.log('Host online')
})



const wait = require('util').promisify(setTimeout)
const fs = require('fs-extra');

const Discord = require('discord.js')
const Intents = Discord.Intents.FLAGS

const mongoose = require('mongoose')
const mongooseLauncher = require('./database/mongoose')
const Guild = require('./database/models/guild')

const token = process.env.token

const client = new Discord.Client({
	intents: [Intents.GUILDS, Intents.GUILD_MEMBERS, Intents.GUILD_VOICE_STATES, Intents.GUILD_PRESENCES, Intents.GUILD_MESSAGES, Intents.DIRECT_MESSAGES]
})

var commands = [];
const applicationCommandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
var testCommands = [];
const guildCommandFiles = fs.readdirSync('./command tests').filter(file => file.endsWith('.js'));

async function getData(id, type) {

	var type = type ? type : 'g'
	var type = type.toLowerCase()

	if (type === 'g') {

		var data = await Guild.find({
			'id': id
		}, {_id:0, __v:0})

		return data[0]
	}

}

async function setData(id, data, type) {

	var type = type ? type : 'g'
	var type = type.toLowerCase()

	if (type === 'g') {

		var oldData = await getData(id)
		var settings = oldData.settings

		if (data.settings !== undefined && data.settings !== settings) {

			for (const name in settings) {

				if (data.settings[name] !== settings[name] && data.settings[name] !== undefined) {

					for (const name2 in settings[name]) {

						if (data.settings[name][name2] !== settings[name][name2] && data.settings[name][name2] !== undefined) {

							settings[name][name2] = data.settings[name][name2]

						}

					}

				}

			}
		}

		/* NEW DB OBJECTS HERE */

		for (const name in oldData) {

			if (oldData[name] !== data[name] && data[name] !== undefined) {
				oldData[name] = data[name]
			}

		}

		var newData = oldData
		newData.settings = settings

		await Guild.findOneAndUpdate({
			'id': id
		}, newData)

	}

}



app.get('/getGuild', async (req, res) => {
	function waitForTrue() {
		if (client.isReady() === false) {
			setTimeout(waitForTrue, 100)
		} else {
			run()
			return
		}
	}
	waitForTrue()
	async function run() {
		var guild = await getData(req.query.guildId)
		res.send(guild)
	}
})



app.get('/guildcheck', async (req, res) => {
	function waitForTrue() {
		if (client.isReady() === false) {
			setTimeout(waitForTrue, 100)
		} else {
			run()
			return
		}
	}
	waitForTrue()
	async function run() {
		var guilds = JSON.parse(req.query.guilds)
		var guildsCheck = []
		var botGuilds = await client.guilds.fetch()
		for (var i = 0; i < guilds.length; i++) {
			if (botGuilds.get(guilds[i]) === undefined) {
				guildsCheck[guildsCheck.length] = false
			} else {
				guildsCheck[guildsCheck.length] = true
			}
		}
		res.send(guildsCheck)
	}
})

app.get('/guildsave', async (req, res) => {
	function waitForTrue() {
		if (client.isReady() === false) {
			setTimeout(waitForTrue, 100)
		} else {
			run()
			return
		}
	}
	waitForTrue()
	async function run() {
		var query = req.query
		var redirect = query.redirect
		var guildId = query.guildId
		delete query.redirect;
		delete query.guildId;

		var updateData = {'settings':{}}

		Object.keys(query).forEach(key => {
			if(updateData.settings[key.split('.')[0]] === undefined) updateData.settings[key.split('.')[0]] = {}

			var value = query[key]

			try {var value = JSON.parse(value)} catch(err) {if(parseInt(value) !== 'NaN') {var value = parseInt(value)} else if(value === 'true') {var value = true} else if(value === 'false') {var value = false} else {var value = value}}

			updateData.settings[key.split('.')[0]][key.split('.')[1]] = value
		})

		await setData(guildId, updateData, 'g')
		var botGuild = await getData(guildId)
		res.redirect(`https://derpdevs.repl.co/bots/derpmod/${redirect}?botGuild=${JSON.stringify(botGuild)}`)
	}
})



client.on('rateLimit', (info) => {
	console.log(`Rate limit hit ${info.timeDifference ? info.timeDifference : info.timeout ? info.timeout: 'Unknown timeout '}`)
})

client.on('ready', async (client) => {

	console.log(`Logged in as ${client.user.tag} (${client.user.id}).`);

	/* Client easier fetching */
	(() => {
		client.userFetch = async (id, options) => {
			return await client.users.fetch(id ? id : '', options)
		}
		client.quickGuildFetch = async (id, options) => {
			return await client.guilds.fetch(id ? id : '', options)
		}
		client.guildFetch = async (id, options) => {
			var guilds = await client.quickGuildFetch(id, options)

			if (guilds.length === undefined) {
				guilds = [guilds]
			}

			guilds.forEach(guild => {
				guild.channelFetch = async (id, options) => {
					return await guild.channels.fetch(id ? id : '', options)
				}
				guild.roleFetch = async (id, options) => {
					return await guild.roles.fetch(id ? id : '', options)
				}
				guild.memberFetch = async (id, options) => {
					return await guild.members.fetch(id ? id : '', options)
				}
				guild.userFetch = async (id, options) => {
					return await guild.members.fetch(id ? id : '', options)
				}
			})

			if (guilds.length === 1) {
				guilds = guilds[0]
			}

			return guilds
		}
		client.commandFetch = async (id, options) => {
			return await client.application.commands.fetch(id ? id : '', options)
		}
	})();

	/* XBOX Live Status Updater */ require('./self/XBOXLive.js')(client, Discord, wait);
	/* Discord User Status Updater */ require('./self/UserStatus.js')(client, Discord, wait);
	/* Discord User Session Updater */ require('./self/UserSession.js')(client, Discord, wait);

	var clientId = '888219648364019792';
	var guildId = '880227023711244328';
	var guild = await client.guildFetch(guildId)
	var guildName = guild.name

	for (var file of applicationCommandFiles) {
		var command = require(`./commands/${file}`);

		var commandFile = require(`./command scripts/${command.type.toLowerCase()}/${file}`)
		commandFile.run(Discord, client, wait, getData, setData)

		commands.push(JSON.parse(JSON.stringify(command.data)));
	}

	for (var file of guildCommandFiles) {
		var command = require(`./command tests/${file}`)

		var commandFile = require(`./command scripts/${command.type.toLowerCase()}/${file}`)
		commandFile.run(Discord, client, wait, getData, setData)

		testCommands.push(JSON.parse(JSON.stringify(command.data)))
	}

	testCommands = [...commands, ...testCommands];

	(async () => {
		try {
			console.log('Started applying application (/) commands.');

			await client.application.commands.set(commands);
			console.log('Successfully applied application (/) commands.');

			await client.application.commands.set(testCommands, guildId);

			console.log(`Successfully applied testing (/) commands in guild \"${guildName}\".`);
		} catch (err) {
			console.error(err)
		}
	})();
})

client.on('messageDelete', async (msg) => {
	if(msg.guild === null) return;
	(async() => {
		var data = await Guild.find({
			'id': msg.guild.id
		})
		data = data[0]
		if(data.name !== msg.guild.name) {
			data.name = msg.guild.name
			await data.save()
		}
	})();
	var enabledCheck = await getData(msg.guild.id)
	if (enabledCheck.settings.message_delete_log['on-off'] === false) return

	const fetchedLogs = await msg.guild.fetchAuditLogs({
		limit: 5,
		type: 'MESSAGE_DELETE'
	}).catch(console.error);

	const auditEntry = fetchedLogs.entries.find(a =>
		a.target.id === msg.author.id &&
		a.extra.channel.id === msg.channel.id
	);

	if (auditEntry !== undefined) {
		var executor = auditEntry.executor
	} else {
		var executor = msg.author
	}

	var skipArray = [
		'888219648364019792',
		'808791103477252147'
	]

	if(skipArray.includes(executor.id)) return

	executor = executor.tag

	var replyMessage = `${executor} deleted a message by ${msg.author.tag}.`

	if (msg.content.substr(0, 2) === '(x') {
		var repeatCount = parseInt(msg.content.substr(2, 1)) + 1
		msg.contentUpdated = msg.content.substr(5)
	} else {
		var repeatCount = 2
		msg.contentUpdated = msg.content
	}

	if (replyMessage === msg.contentUpdated.substr(0, replyMessage.length)) {
		var replyMessage = `(x${repeatCount}) ${msg.contentUpdated}`
	} else {
		var replyMessage = `${executor} deleted a message by ${msg.author.tag}. Content:\n\n${msg.content}`
	}

	msg.channel.send({
		content: replyMessage
	})

});


var settingsPlaceHolder = require('./extras/guildSettings')

client.on('guildCreate', async (guild) => {
	var settings = {}

	settingsPlaceHolder.forEach(setting => {
		var values = {}
		setting.values.forEach(value => {
			values[value.name] = value.value
		})
		settings[setting.name] = values
	})

	var icon = guild.icon ? guild.icon : 'null'

	await Guild.create({

		_id: mongoose.Types.ObjectId(),

		'id': guild.id,
		'name': guild.name,
		'icon': icon,

		settings

	})

})

client.on('guildDelete', async (guild) => {

	Guild.findOneAndDelete({
		'id': guild.id,
	}, (err) => {
		if (err) console.log(err)
	})

})

mongooseLauncher.init();
client.login(token)