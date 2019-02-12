const parser = (function(){

	const spec = {
		env: 0,
		file: 1,
		command: 2,
		actions: {}
	}

	function use(config){
		if(config && typeof config == "object"){
			validateConfig(config)
			spec.config = config
		}
		else
			end("No config object found")
	}

	function action(actionName, fn){
		if(typeof fn != "function")
			throw new Error(`Expected a function for (${actionName})`)

		spec.actions[actionName] = fn

	}

	function parse(args){
		if(isNotSafe())
			end("No config object found")

		//Extract all flags
		let command = args[spec["command"]]

		checkIfCommandExists(command)

		let extractedFlags = extractFlags(args)
		let extractedOptions = extractOptions(args)
		let extractedArgument = extractCommandArguments(command, args)

		let output = Object.assign({}, extractedFlags, extractedOptions, extractedArgument)
		console.log(output)

		if(spec.actions[command])
			spec.actions[command](output)

	}


	return {
		use: use,
		parse: parse,
		action: action
	}




	//Helper functions

	function checkIfCommandExists(command){
		if(!spec.config.commands[command]){
			console.log(`Command (${command}) does not exist`)
			console.log()
			console.log(`Commands: ${Object.keys(spec.config.commands).join(" | ")}`)
			end()
		}
	}

	function extractCommandArguments(command, args){
		let extracted = {command: command}, expected = spec.config.commands[command]

		if(expected.length > args.length - 3)
			end(`Missing args: ${command} <${expected.join("> <")}>`)

		expected.forEach(function(variable, i){
			extracted[variable] = args[i + 3]
		})

		return extracted

	}

	function extractOptions(args){
		//check for shorthand options
		if(!spec.config.options)
			return {}

		const options = Object.keys(spec.config.options), optionSource = spec.config.options, extracted = {}

		options.forEach(function(option){
			if(args.includes(optionSource[option])){
				let position = args.indexOf(optionSource[option])
				if(!args[position + 1])
					end(`No value for option ${optionSource[option]}`)
				args.splice(position, 1)
				extracted[option] = args.splice(position, 1)[0]
			}
		})

		return { options: extracted }

	}

	function extractFlags(args){
		if(!spec.config.flags)
			return {}

		const flags = Object.keys(spec.config.flags), flagSource = spec.config.flags, extracted = {}

		flags.forEach(function(flag){
			if(args.includes(flagSource[flag])){
				args.splice(args.indexOf(flagSource[flag]), 1)
				extracted[flag] = true
			}
		})

		return { flags: extracted }
	}

	function validateConfig(configObj){
		let commands = Object.keys(configObj.commands || {})
		let options = Object.keys(configObj.options || {})
		let flags = Object.keys(configObj.flags || {})

		checkForClash(commands, options, "commands", "options")
		checkForClash(commands, flags, "commands", "flags")
		checkForClash(options, flags, "options", "flags")
	}

	function checkForClash(array1, array2, name1, name2){
		let result = exclusive(array1, array2)
		if(!result.exclusive){
			console.log(`There is a clash in ${name1} config and ${name2} config`)
			console.log(" --> " + result.clash)
			end()
		}
	}

	function exclusive(array1, array2){
		let result = {exclusive: true}
		for(let i = 0; i < array1.length; i++){
			if(array2.includes(array1[i])){
				result.exclusive = false
				result.clash = array1[i]
				break
			}
		}
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