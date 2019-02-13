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

		checkIfHelpCommand(command)

		checkIfCommandExists(command)

		let extractedFlags = extractFlags(args)
		let extractedOptions = extractOptions(args)
		let extractedArgument = extractCommandArguments(command, args, Object.assign({}, extractedFlags, extractedOptions))

		let output = Object.assign({}, extractedFlags, extractedOptions, extractedArgument)

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
		let reverseFlag = Object.keys(reverseObj(configObj.flags || {}))
		let reverseOptions = Object.keys(reverseObj(configObj.options || {}))

		checkForClash(commands, options, "commands", "options")
		checkForClash(commands, flags, "commands", "flags")
		checkForClash(options, flags, "options", "flags")
		checkForClash(reverseFlag, reverseOptions, "flag shorthand", "option shorthand")
	}

	function checkForClash(array1, array2, name1, name2){
		let result = exclusive(array1, array2)
		if(!result.exclusive){
			console.log(`There is a clash in (${name1} config) and (${name2} config)`)
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
	function checkIfHelpCommand(command){
		if(command == "--help" || command == "-h" || command == "help"){
			console.log("")
			Object.keys(spec.config.commands).forEach(command => {
				help(command)
			})
			end()
		}
	}

	function help(command){
		checkIfCommandExists(command)
		let expected = spec.config.commands[command]
		expected = makeVerbose(expected)
		console.log("")
		console.log(`    Command (${command})`)
		console.log(`            usage: ${command} <${expected.join("> <")}>`)
		console.log("")
	}

	function makeVerbose(commands){
		let reverseFlag = reverseObj(spec.config.flags), reverseOptions = reverseObj(spec.config.options)
		return commands.map(function(command){
			if(command.startsWith("--"))
				return `[${command} (${command.substr(2)})]`
			else if(command.startsWith("-")){
				if(reverseFlag[command])
					return `flag: ${command} (${reverseFlag[command]})`
				else if(reverseOptions[command])
					return `option: ${command} (${reverseOptions[command]})`
			}
			return command
		})
	}

	function checkIfCommandExists(command){
		if(!spec.config.commands[command]){
			console.log(`Command (${command}) does not exist`)
			console.log()
			// console.log(`Commands: ${Object.keys(spec.config.commands).join(" | ")}`)
			console.log(`Use --help to see command list and usage`)
			end()
		}
	}

	function extractCommandArguments(command, args, currentOutput){
		let extracted = {command: command}, expected = spec.config.commands[command]

		let nonModifiers = expected.filter(variable => !variable.startsWith("-"))
		let longModifiers = expected.filter(variable => variable.startsWith("--"))
		let modifiers = expected.filter(variable => variable.startsWith("-") && !variable.startsWith("--"))

		longModifiers.forEach(function(modifier){
			modifier = modifier.substr(2)
			if(spec.config.flags[modifier])
				if(!currentOutput.flags[modifier]){
					console.log("    Err: Missing args")
					end(help(command))
				}
			else if(spec.config.options[modifier])
				if(!currentOutput.options[modifier]){
					console.log("    Err: Missing args")
					end(help(command))
				}
		})

		let reverseFlag = reverseObj(spec.config.flags || {}), reverseOptions = reverseObj(spec.config.options || {})

		modifiers.forEach(function(modifier){
			if(reverseFlag[modifier]){
				if(!currentOutput.flags[reverseFlag[modifier]]){
					console.log("    Err: Missing args")
					end(help(command))
				}
			}
			else if(reverseOptions[modifier]){
				if(!currentOutput.options[reverseOptions[modifier]]){
					console.log("    Err: Missing args")
					end(help(command))
				}
			}
		})

		if(nonModifiers.length > args.length - 3){
			console.log(`    Err: Missing args`)
			help(command)
			end()
		}

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


	//Global helper functions
	function isNotSafe(){
		if(spec.config && typeof spec.config == "object")
			return false
		else
			return true
	}

	function reverseObj(obj){
		let reverseObj = {}
		for(prop in obj){
			if(!obj.hasOwnProperty(prop))
				return
			reverseObj[String(obj[prop])] = String(prop)
		}
		return reverseObj
	}

	function end(message){
		if(message)
			console.log(message)
		process.exit(0)
	}


})()

module.exports = parser