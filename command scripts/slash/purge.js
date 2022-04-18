 exports.run = async(Discord, client, wait) => {



client.on('interactionCreate', async(int) => {
  if(!int.isCommand()) return

  const { commandName } = int

  if(commandName === 'purge') {
    const options = int.options._hoistedOptions

    const channel = options[1] ? await int.guild.channels.fetch(options[1].value) : int.channel

		try {
	    channel.bulkDelete(options[0].value).then(async messages => {
				await int.reply({ content:`${int.member.toString()} deleted ${messages.size} messages in ${channel.toString()}.` })
	      int.followUp({ content:`Deleted ${messages.size} messages in ${channel.toString()}.`, ephemeral:true })
	    }).catch(async err => {
				await int.reply({ content:`${int.member.toString()} attempted to delete ${options[0].value} messages in ${channel.toString()}.` })
	      int.followUp({ content:`Could not delete ${options[0].value} messages in ${channel.toString()} because one or more of the messages was over 14 days old.`, ephemeral:true })
	    })
		} catch(err) {
			try {
				var messages = await channel.messages.fetch({ limit:options[0].value })
				messages = messages.map(m => m)
				for(var i = 0;i < options[0].value;i++) {
					messages[i].delete().catch(err => {return})
				}
	      await int.reply({ content:`${int.member.toString()} deleted ${options[0].value} messages in ${channel.toString()}.` })
	      int.followUp({ content:`Deleted ${options[0].value} messages in ${channel.toString()}.`, ephemeral:true })
			} catch(err) {
				console.log(err)
	      await int.reply({ content:`${int.member.toString()} attempted to delete ${options[0].value} messages in ${channel.toString()}.` })
	      int.followUp({ content:`Something went wrong while deleting ${options[0].value} messages in ${channel.toString()}.`, ephemeral:true })
			}
		}
  }
})



}