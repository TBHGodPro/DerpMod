const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('Mass delete messages in the channel.')
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('The amount of messages to purge.')
                .setRequired(true))
        .addChannelOption(option => 
          option.setName('channel')
            .setDescription('The channel to purge messages in.')
            .setRequired(false)),
	type: 'SLASH'
};