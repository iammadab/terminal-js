const parser = require("./lib/parser")

// parser.use({
// 	commands: {
// 		push: ["remote", "login"],
// 		login: ["-u", "-p"]
// 	},
// 	options: {
// 		username: "-u",
// 		password: "-p"
// 	},
// 	flags: {
// 		verbose: "-v"
// 	}
// })

// parser.parse(process.argv)


module.exports = parser
