exports.run = async(Discord, client, wait) => {



client.on('interactionCreate', async interaction => {
    if(!interaction.isCommand()) return

    var { commandName } = interaction

    if(commandName === 'unban') {
        
        var guild = await client.guilds.fetch(interaction.member.guild.id)

        var clientMember = await guild.members.fetch(client.user.id)

        if(clientMember.permissions.has([Discord.Permissions.FLAGS.BAN_MEMBERS])) {

            var bans = await guild.bans.fetch()
        
        } else {

           interaction.reply({content:`Insufficient Permissions: Cannot get banned members`, ephemeral:true})

           return

        }

        var row = new Discord.MessageActionRow()

            var selectMenu = new Discord.MessageSelectMenu()
                .setCustomId('unbanUser')
                .setPlaceholder('Select a User')
                .setMaxValues(1)

            bans.forEach(ban => {

                selectMenu.addOptions([{
                    label: `${ban.user.username}#${ban.user.discriminator}`,
                    description: `ID: ${ban.user.id}`,
                    value: ban.user.id,
                }])

            })

            if(selectMenu.options.length === 0) {

                await interaction.reply({content: 'No users are currently banned', ephemeral: true, components: []})

            } else {

                row.addComponents(
                    selectMenu
                )

                await interaction.reply({content: 'Please select a user to unban', ephemeral: true, components: [row]})

            }

    }
})


client.on('interactionCreate', async interaction => {
    if(!interaction.isSelectMenu()) return

    if(interaction.customId === 'unbanUser') {

        var guild = await client.guilds.fetch(interaction.member.guild.id)

        var user = await guild.bans.fetch(interaction.values[0])

        var row = new Discord.MessageActionRow()
            row.addComponents(
                new Discord.MessageButton()
                    .setCustomId('unbanNo')
                    .setLabel('No')
                    .setStyle('DANGER'),
                
                new Discord.MessageButton()
                    .setCustomId(`unbanYes${user.user.id}`)
                    .setLabel('Yes')
                    .setStyle('SUCCESS')
            )

        await interaction.update({content:`Are you sure you would like to unban ${user.user.tag}?`, ephemeral:true, components:[row]})

    }

})


client.on('interactionCreate', async interaction => {
    if(!interaction.isButton()) return

    if(interaction.customId.substr(0, 8) === 'unbanYes') {

        var guild = await client.guilds.fetch(interaction.member.guild.id)

        var user = await guild.bans.fetch(interaction.customId.substr(8))

        var row = new Discord.MessageActionRow()
            
            row.addComponents(
                new Discord.MessageButton()
                    .setCustomId('unbanNo')
                    .setLabel('Back')
                    .setStyle('PRIMARY')
            )

        await interaction.update({content: `Successfully unbanned ${user.user.tag}`, ephemeral: true, components: [row]})

        await guild.members.unban(user.user.id)
    
    } else if(interaction.customId === 'unbanNo') {

        var guild = await client.guilds.fetch(interaction.member.guild.id)

        var bans = await guild.bans.fetch()

        var row = new Discord.MessageActionRow()

            var selectMenu = new Discord.MessageSelectMenu()
                .setCustomId('unbanUser')
                .setPlaceholder('Select a User')
                .setMaxValues(1)

            bans.forEach(ban => {

                selectMenu.addOptions([{
                    label: `${ban.user.username}#${ban.user.discriminator}`,
                    description: `ID: ${ban.user.id}`,
                    value: ban.user.id,
                }])

            })

            if(selectMenu.options.length === 0) {

                await interaction.update({content: 'No users are currently banned', ephemeral: true, components: []})

            } else {

                row.addComponents(
                    selectMenu
                )

                await interaction.update({content: 'Please select a user to unban', ephemeral: true, components: [row]})

            }

    }

})



}