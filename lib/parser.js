const parser = (function(){

	const spec = {
		env: 0,
		file: 1,
		command: 2,
		actions: {}
	}

	function use(config){
		if(config && typeof config == "object")
			spec.config = config
		else
			end("No config object found")
	}

	function action(actionName, fn){
		if(typeof fn != "function"){
			throw new Error(`Expected a function for (${actionName})`)
		}

		spec.actions[actionName] = fn

	}

	function parse(args){
		if(isNotSafe())
			end("No config object found")

		let command = args[spec["command"]], commandVars = spec.config.commands[command]

		if(!commandVars){
			console.log(`Command (${command}) does not exist`)
			console.log()
			console.log(`Commands: ${Object.keys(spec.config.commands).join(" | ")}`)
			end()
		}

		let output = getVariables(commandVars, args, command)

		output.command = command

		if(spec.actions[command])
			spec.actions[command](output)

	}


	return {
		use: use,
		parse: parse,
		action: action
	}

	


	//Helper functions

	function getVariables(commandVars, args, command){
		let result = {}

		if(commandVars.length > args.length - 3){
			console.log(`Missing args: ${command} <${spec.config.commands[command].join("> <")}>`)
			end()
		}

		commandVars.forEach(function(variable, i){
			result[variable] = args[i + 3]
		})

		return result

	}

	function isNotSafe(){
		if(spec.config && typeof spec.config == "object")
			return false
		else
			return true
	}

	function end(message){
		if(message)
			console.log(message)
		process.exit(0)
	}


})()

module.exports = parser