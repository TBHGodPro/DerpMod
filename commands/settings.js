const Builders = require('@discordjs/builders')
const { SlashCommandBuilder, SlashCommandSubcommandBuilder } = Builders

var settings = require('../extras/guildSettings')

var command = new SlashCommandBuilder()
	.setName('settings')
	.setDescription('View and edit server settings.')
    
  .addSubcommand(subcom => subcom
    .setName('view')
    .setDescription('View the current server settings.')
  )
    
  settings.forEach(setting => {

		var subcommand = new SlashCommandSubcommandBuilder()

		subcommand.name = setting.name
		subcommand.description = setting.desc

		var options = []

		setting.values.forEach(value => {

			var option = new Builders[`SlashCommand${value.typeText}Option`]

			option.name = value.name
			option.description = value.desc
			option.required = value.required
			option.type = value.type
			
			options.splice(-1, 0, option)		
			
		})

		subcommand["options"] = options

    command.addSubcommand(subcom => subcom = subcommand)
	})


module.exports = {
	data: command,
	type: 'SLASH'
};