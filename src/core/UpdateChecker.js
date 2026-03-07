import { Bridge } from './Bridge.js';
import { CONFIG } from '../config/config.js';
import { compareVersions } from '../libs/loader/CompareVersions/compareversions.min.js';

export class UpdateChecker {
	constructor(logger) {
		this.version = CONFIG.SCRIPT_VERSION;
		this.logger = logger;
	}

	async check() {
		try {
			const stableData = await Bridge.fetch(
				CONFIG.STABLE_JSON_URL(this.version),
				'json'
			);

			if (!stableData?.versions || stableData.versions.length === 0) {
				this.logger.log('No stable versions found', 'warn');
				return;
			}

			const latest = this._getLatestVersion(stableData.versions);

			if (!latest) {
				this.logger.log('Failed to determine latest version', 'warn');
				return;
			}

			const comparison = compareVersions(latest.version, this.version);

			this.logger.log(
				`Current: ${this.version}, Latest: ${latest.version}, Comparison: ${comparison}`,
				'info'
			);

			switch (comparison) {
				case 1:
					this.logger.log(`A new version is available on GitHub: ${latest.version}. Checking for stable version...`, 'info');
					break;
				case 0:
					this.logger.log(/[-+]/.test(this.version)
						? `You are using some version that is based on the latest stable.`
						: `You are using the latest stable version.`, 'info');
					break;
				case -1:
					this.logger.log(`You are using a version newer than the one on GitHub.`, 'warn');
					break;
				case -2:
					this.logger.log(`Error comparing versions.`, 'error');
					break;
				default:
					this.logger.log(`Default case`, 'info');
			}

			this.logger.log(`Your × GitHub:\n${this.version} × ${latest.version}`, 'info');

			if (comparison === 1) {
				await this._showUpdateModal(latest);
			}
		} catch (error) {
			this.logger.log(`Update check failed: ${error}`, 'error');
		}
	}

	_getLatestVersion(versions) {
		if (!Array.isArray(versions) || versions.length === 0) return null;

		return versions.reduce((latest, current) => {
			return compareVersions(current.version, latest.version) > 0
				? current
				: latest;
		});
	}

	async _showUpdateModal({ version, hash, date }) {
		const skippedVersion = await Bridge.getValue('skippedVersion', '');
		if (skippedVersion === version) {
			this.logger.log(`Version ${version} was skipped by user`, 'info');
			return;
		}

		try {
			const result = await window.Nuntaria.fire({
				type: 'info',
				title: `${CONFIG.SCRIPT_NAME}: New version available!`,
				text: `Version ${version} is available${date ? ` (${date})` : ''}. Update now?`,
				timer: CONFIG.UPDATE_MODAL_TIMER,
				timerPause: true,
				position: 'top-right',
				theme: 'glass',
				buttons: [
					{ label: 'Skip', value: 'skip', variant: 'cancel' },
					{ label: 'Later', value: false, variant: 'cancel' },
					{ label: 'Update', value: true, variant: 'primary' }
				]
			});

			if (result === true) {
				Bridge.updateScript(hash);
				this.logger.log(`User chose to update to ${version}`, 'info');
			} else if (result === 'skip') {
				await Bridge.setValue('skippedVersion', version);
				this.logger.log(`User skipped version ${version}`, 'info');
			} else {
				this.logger.log('User chose to update later', 'info');
			}
		} catch (error) {
			this.logger.log(`Failed to show update modal: ${error}`, 'error');
		}
	}
}
