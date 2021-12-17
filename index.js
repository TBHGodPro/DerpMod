const express = require('express')

const app = express()

app.get('/', (req, res) => {
	res.send('Hello World!')
})

app.listen(3000, () => {
	console.log('Host online')
})



const wait = require('util').promisify(setTimeout)
const fs = require('fs');
const fetch = require('node-fetch')

const Discord = require('discord.js')
const Intents = Discord.Intents

const mongoose = require('mongoose')
const mongooseLauncher = require('./database/mongoose')
const Guild = require('./database/models/guild')

const token = process.env.token

const client = new Discord.Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES]
})

var commands = [];
const applicationCommandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
var testCommands = [];
const guildCommandFiles = fs.readdirSync('./command tests').filter(file => file.endsWith('.js'));

async function getData(id, type) {

	var type = type ? type : 'g'
	var type = type.toLowerCase()

	if (type === 'g') {

		var data = await Guild.findOne({
			'id': id
		}, async (err, docs) => {
			return await docs
		})

		return data
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
		// ACTUAL CODE:
		// await setData(guildId, query, 'g')
		console.log(query)
		res.redirect(`https://derpdevs.repl.co/bots/derpmod/${redirect}`)
	}
})



client.on('rateLimit', (info) => {
	console.log(`Rate limit hit ${info.timeDifference ? info.timeDifference : info.timeout ? info.timeout: 'Unknown timeout '}`)
})

client.on('ready', async (client) => {

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

	console.log(`Logged in as ${client.user.tag} (${client.user.id}).`);

	/* XBOX Live Status Updater: */ require('./XBOXLive.js')(client, Discord, fetch, wait)

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
		var executor = auditEntry.executor.tag
	} else {
		var executor = msg.author.tag
	}

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
	}, (err, res) => {
		if (err) console.log(err)
	})

})

mongooseLauncher.init();
client.login(token)