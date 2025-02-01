class Logger {
	/**
	 * Creates an instance of Logger.
	 *
	 * @param {string} scriptName - The script name.
	 * @param {boolean} [logging=false] - Enables or disables logging.
	 */
	constructor(scriptName, logging = false) {
		this.scriptName = scriptName;
		this.logging = logging;
	}

	/**
	 * Logs messages to the console with different styles based on log type.
	 *
	 * @param {string} message - The message to log.
	 * @param {string} type - The type of log (log, info, warn, error, success, debug).
	 */
	log(message, type = 'log') {
		if (!this.logging) return;

		const styles = {
			log: 'color: white',
			info: 'color: blue',
			warn: 'color: orange',
			error: 'color: red',
			success: 'color: green',
			debug: 'color: purple'
		};

		console.log(`%c${this.scriptName.toUpperCase()} log:%c ${message}`, 'color: white; font-weight: bold', styles[type] || styles.log);
	}

	/**
	 * Logs the result of the version comparison.
	 *
	 * @param {number} compareResult - The result of the version comparison.
	 * @param {string} githubVersion - The current version of the script.
	 * @param {string} githubVersion - The latest version from GitHub.
	 */
	logVersionComparison(compareResult, currentVersion, githubVersion) {
		this.logging = true;
		this.log(`========\n`);

		switch (compareResult) {
			case 1:
				this.log(`A new version is available on GitHub: ${githubVersion}. Checking for stable version...`, 'info');
				break;
			case 0:
				this.log(/[-+]/.test(currentVersion)
					? `You are using some version that is based on the latest stable.`
					: `You are using the latest stable version.`, 'info');
				break;
			case -1:
				this.log(`You are using a version newer than the one on GitHub.`, 'warn');
				break;
			case -2:
				this.log(`Error comparing versions.`, 'error');
				break;
			default:
				this.log(`Default case`);
		}

		this.log(`Your × GitHub:\n${currentVersion} × ${githubVersion}`, 'info');
		this.log(`\n========`);
		this.logging = false;
	}

	/**
	 * Enables logging.
	 */
	enableLogging() {
		this.logging = true;
	}

	/**
	 * Disables logging.
	 */
	disableLogging() {
		this.logging = false;
	}
}