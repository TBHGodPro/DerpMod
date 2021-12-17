 exports.run = async(Discord, client, wait) => {



client.on('interactionCreate', async(interaction) => {
  if(!interaction.isCommand()) return

  const { commandName } = interaction

  if(commandName === 'purge') {
    const options = interaction.options._hoistedOptions

    const channel = options[1] ? await interaction.guild.channels.fetch(options[1].value) : interaction.channel

    channel.bulkDelete(options[0].value).then(messages => {
      interaction.reply({ content:`Deleted ${messages.size} messages in <#${channel.id}>.`, ephemeral:true })
    }).catch(err => {
      interaction.reply({ content:`Could not delete ${options[0].value} messages in <#${channel.id}> because one or more of the messages was over 14 days old.`, ephemeral:true })
    })
  }
})



}