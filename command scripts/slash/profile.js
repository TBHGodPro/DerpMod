const Canvas = require('canvas')
const Builders = require('@discordjs/builders')

Canvas.registerFont('././fonts/Ubuntu-Light.ttf', { family: 'Ubuntu' });

const applyText = (canvas, text, fontSize, font, fillColor, x, y) => {
    if(!fillColor.includes('#')) {
        var fillColor = `#${fillColor}`
    }

	const context = canvas.getContext('2d');

	do {
		context.font = `${fontSize -= 1}px ${font}`;
	} while (context.measureText(text).width + x > canvas.width - 10);

    context.fillStyle = `${fillColor}`
        
    context.fillText(text, x, y)

	return context
}

exports.run = async(Discord, client, wait, getData, setData, trigger) => {


	
	if(trigger !== undefined) {
		await interactionCreate1(trigger)
	} else {
		client.on('interactionCreate', async int => {await interactionCreate1(int)})
	}


	
	async function interactionCreate1(interaction) {

	    const { commandName } = interaction;

	    if (commandName === 'profile' || commandName === 'view_profile') {
    
        var canvas = Canvas.createCanvas(700, 250)
    
        var context = canvas.getContext('2d')
    
        var background = await Canvas.loadImage('././images/profile-wallpaper.png')
    
        context.drawImage(background, 0, 0, canvas.width, canvas.height)

        var guild = await client.guilds.fetch(interaction.member.guild.id)

        if(interaction.options._hoistedOptions[0] === undefined) {
            var member = interaction.member
            var user = interaction.member.user
        } else {
            var member = interaction.options._hoistedOptions[0].member
            var user = interaction.options._hoistedOptions[0].user
        }

        var presence = member.presence
        
        /*
            
            `https://cdn.discordapp.com/app-assets/${presence.activities[0].applicationId}/${presence.activities[0].assets.largeImage}` 
            
            The way to get activity images.
            
            (WARNING: Most activites do not give API Images, such as Genshin Impact, Valorant, etc. But some do, such as Lunar Client, etc.)
            
        */

        // text start

        context = applyText(canvas, `${member.displayName}#${user.discriminator}`, '50', 'Ubuntu', member.displayHexColor, canvas.width / 2.8, canvas.height / 2.9)
        
        context = applyText(canvas, `ID: ${user.id}`, '30', 'Ubuntu', 'ffffff', canvas.width / 2.75, canvas.height / 2)

        var roles = await guild.roles.fetch()
        var userRoles = ''

        member._roles.forEach(role => {
            var role = roles.get(role)

            userRoles = `${userRoles} ${role.name},`
        })

        userRoles = `${userRoles.substr(0, userRoles.length - 1)}.`

        context = applyText(canvas, `Roles:${userRoles}`, '25', 'Ubuntu', 'ffffff', canvas.width / 2.75, canvas.height / 1.2)

        if(presence === null) {
	        var status = 'No status'
	    	} else if(presence.activities[0] !== undefined) {
            if(presence.activities[0].type === 'CUSTOM') {
                var status = `${presence.activities[0].state}`
            } else if(presence.activities[0].type === 'PLAYING' || presence.activities[0].type === 'STREAMING' || presence.activities[0].type === 'WATCHING') {
                var status = `${presence.activities[0].type.substr(0,1)}${presence.activities[0].type.substr(1).toLowerCase()} ${presence.activities[0].name}`
            } else if(presence.activities[0].type === 'LISTENING') {
                var status = `Listening to ${presence.activities[0].name}`
            }
        } else {
            var status = 'No status'
        }

        context = applyText(canvas, `Status: ${status}`, '27', 'Ubuntu', 'ffffff', canvas.width / 2.75, canvas.height / 1.6)

        var devices = 'Devices:'

        try {

        if(presence.clientStatus.desktop !== undefined) {
            var devices = `${devices} Desktop,`
        }

        if(presence.clientStatus.mobile !== undefined) {
            var devices = `${devices} Mobile,`
        }

        } catch(err) {}

        if(devices === 'Devices:') {
            var devices = 'Devices: None,'
        }

        var devices = `${devices.substr(0, devices.length - 1)}.`

        context = applyText(canvas, devices, '27', 'Ubuntu', 'ffffff', canvas.width / 2.75, canvas.height / 1.35)

        // text end

        if(member.premiumSinceTimestamp !== null) {
            var boosterLogo = await Canvas.loadImage('././images/booster-logo.png')

		    context.drawImage(boosterLogo, canvas.width / 1.075, 0, 50, 50);

            context = applyText(canvas, 'Server Booster', '20', 'Ubuntu', 'ff6efa', canvas.width / 1.32, 33)
        }

        if(presence === null) {
            var statusIMG = await Canvas.loadImage('././images/statuses/offline.png')
        } else if(presence.clientStatus.mobile === 'online') {
            var statusIMG = await Canvas.loadImage('././images/statuses/mobile.png')
        } else {
            var statusIMG = await Canvas.loadImage(`././images/statuses/${presence.status}.png`)
        }

        context.drawImage(statusIMG, -5, canvas.height / 1.35, 70, 63)

        var avatar = await Canvas.loadImage(user.displayAvatarURL({format: 'jpg'}))
        
        context.beginPath();
		context.arc(125, 125, 100, 0, Math.PI * 2, true);
		context.closePath();
		context.clip();
		context.drawImage(avatar, 25, 25, 200, 200);

        var attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'profile-image.png')
    
        interaction.reply({files: [attachment]})
    
	    }
    
	}    
        
}