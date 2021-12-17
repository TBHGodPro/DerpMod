const mongoose = require('mongoose')
const Guild = require('../../database/models/guild')

const guildSettings = require('../../extras/guildSettings')

const { MessageEmbed } = require('discord.js')

exports.run = async(Discord, client, wait, getData, setData) => {


client.on('interactionCreate', async int => {

  await interactionCreate1(int)

})


async function interactionCreate1(interaction) {
  if(!interaction.isCommand()) return

  var { commandName } = interaction

  if(commandName === 'settings') {
    var subcommand = interaction.options._subcommand
    var options = interaction.options._hoistedOptions

    if(subcommand === 'view') {

      var { guild } = interaction
      
      var guildData = await getData(guild.id)
      var settings = guildData.settings

      const settingsEmbed = new MessageEmbed()
        .setColor('#17b3e3')
        .setTitle('Server Settings')
        .setDescription(`The settings for \"${interaction.guild.name}\".`)
				for(const name in settings) {
					var value = ''

					for(const name2 in settings[name]) {
						value = value + `${name2}: ${settings[name][name2]}\n`
					}

					var nameFinder = {}
					nameFinder[name] = settings[name]
					settingsEmbed.addField(guildSettings[Object.keys(settings).indexOf(name)].displayName, value)
				}

			interaction.reply({ embeds: [settingsEmbed], ephemeral:true })

    } else {

			var { guild } = interaction

			if(subcommand === 'message_delete_log') {

				var updateData = {'settings':{}}
				updateData.settings[subcommand] = {}

				var optionValues = ''

				options.forEach(option => {
					updateData.settings[subcommand][option.name] = option.value
					optionValues = `${optionValues} ${option.value},`
				})
				var optionValues = optionValues.substr(0, optionValues.length - 1)

				await setData(guild.id, updateData)

				interaction.reply({ content:`Set setting ${subcommand} to values:${optionValues}.`, ephemeral:true })

			}
			
		}

  }

}



}