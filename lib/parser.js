const parser = (function(){

	const spec = {
		env: 0,
		file: 1,
		command: 2,
		config: {},
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

	function parse(args){
		if(isNotSafe())
			end("No config object found")

		let command = args[spec["command"]]

		checkIfCommandExists(command)

		let extractedFlags = extractFlags(args)
		let extractedOptions = extractOptions(args)
		let extractedArgument = extractCommandArguments(command, args, Object.assign({}, extractedFlags, extractedOptions))

		let output = Object.assign({}, extractedFlags, extractedOptions, extractedArgument)
		console.log(output)

		if(spec.actions[command])
			spec.actions[command](output)

	}

	function action(actionName, fn){
		if(typeof fn != "function")
			throw new Error(`Expected a function for (${actionName})`)

		spec.actions[actionName] = fn

	}


	return {
		use: use,
		parse: parse,
		action: action
	}




	//use api helper functions
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


	//Helper functions for the parse api
	function checkIfCommandExists(command){
		if(!spec.config.commands[command]){
			console.log(`Command (${command}) does not exist`)
			console.log()
			console.log(`Commands: ${Object.keys(spec.config.commands).join(" | ")}`)
			end()
		}
	}

	function extractCommandArguments(command, args, currentOutput){
		let extracted = {command: command}, expected = spec.config.commands[command]

		let nonModifiers = expected.filter(variable => !variable.startsWith("-"))
		let longModifiers = expected.filter(variable => variable.startsWith("--"))
		let modifiers = expected.filter(variable => variable.startsWith("-") && !variable.startsWith("--"))

		function reverseObj(obj){
			let reverseObj = {}
			for(prop in obj){
				if(!obj.hasOwnProperty(prop))
					return
				reverseObj[String(obj[prop])] = String(prop)
			}
			return reverseObj
		}

		longModifiers.forEach(function(modifier){
			modifier = modifier.substr(2)
			if(spec.config.flags[modifier])
				if(!currentOutput.flags[modifier])
					end(`Flag (--${modifier}) required`)
			else if(spec.config.options[modifier])
				if(!currentOutput.options[modifier])
					end(`Flag (--${modifier}) required`)
		})

		let reverseFlag = reverseObj(spec.config.flags || {}), reverseOptions = reverseObj(spec.config.options || {})

		modifiers.forEach(function(modifier){
			if(reverseFlag[modifier])
				if(!currentOutput.flags[reverseFlag[modifier]])
					end(`Flag (${modifier}) required`)
			else if(reverseOptions[modifier])
				if(!currentOutput.options[reverseOptions[modifier]])
					end(`Option (${modifier} required`)
		})

		if(nonModifiers.length > args.length - 3)
			end(`Missing args: ${command} <${expected.join("> <")}>`)

		nonModifiers.forEach(function(variable, i){
			extracted[variable] = args[i + 3]
		})

		return extracted

	}

	function extractOptions(args){
		if(!spec.config.options)
			return {}

		const options = Object.keys(spec.config.options), optionSource = spec.config.options, extracted = {}

		options.forEach(function(option){
			if(args.includes(optionSource[option]))
				extract(optionSource[option], option)

			if(args.includes("--" + option))
				extract("--" + option, option)
		})

		function extract(value, option){
			let position = args.indexOf(value)
			if(!args[position + 1])
				end(`No value for option ${value}`)
			args.splice(position, 1)
			extracted[option] = args.splice(position, 1)[0]
		}

		return { options: extracted }

	}

	function extractFlags(args){
		if(!spec.config.flags)
			return {}

		const flags = Object.keys(spec.config.flags), flagSource = spec.config.flags, extracted = {}

		flags.forEach(function(flag){
			if(args.includes(flagSource[flag]))
				extract(flagSource[flag], flag)

			if(args.includes("--" + flag))
				extract("--" + flag, flag)
		})

		function extract(value, flag){
			args.splice(args.indexOf(value), 1)
			extracted[flag] = true
		}

		return { flags: extracted }
	}


	//Global helper function

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