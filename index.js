const parser = require("./lib/parser")

parser.use({
	commands: {
		login: ["-u", "-p"]
	},
	options: {
		username: "-u",
		password: "-p"
	},
	flags: {
		username: "-u"
	}
})

parser.parse(process.argv)


module.exports = parser
