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