const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('See info about a Server Member')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to view the profile of.')
                .setRequired(false)),
	type: 'SLASH'
};