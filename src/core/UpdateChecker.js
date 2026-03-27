import { Bridge } from './Bridge.js';
import { CONFIG } from '../config/config.js';
import { compareVersions } from '../libs/loader/CompareVersions/compareversions.min.js';
import { _detectLanguage } from '../utils/_detectLanguage.js';

export class UpdateChecker {
	constructor(logger) {
		this.version = CONFIG.SCRIPT_VERSION;
		this.logger = logger;
		this.translations = this.getTranslations();
	}

	getTranslations() {
		const translations = {
			en: { title: 'New version available!', text: (v, d) => `Version ${v} is available${d ? ` (${d})` : ''}. Update now?`, skip: 'Skip', later: 'Later', update: 'Update' },
			ru: { title: 'Доступна новая версия!', text: (v, d) => `Версия ${v} доступна${d ? ` (${d})` : ''}. Обновить сейчас?`, skip: 'Пропустить', later: 'Позже', update: 'Обновить' },
			uk: { title: 'Доступна нова версія!', text: (v, d) => `Версія ${v} доступна${d ? ` (${d})` : ''}. Оновити зараз?`, skip: 'Пропустити', later: 'Пізніше', update: 'Оновити' },
			nl: { title: 'Nieuwe versie beschikbaar!', text: (v, d) => `Versie ${v} is beschikbaar${d ? ` (${d})` : ''}. Nu updaten?`, skip: 'Overslaan', later: 'Later', update: 'Updaten' },
			pl: { title: 'Dostępna nowa wersja!', text: (v, d) => `Wersja ${v} jest dostępna${d ? ` (${d})` : ''}. Zaktualizować teraz?`, skip: 'Pomiń', later: 'Później', update: 'Aktualizuj' },
			pt: { title: 'Nova versão disponível!', text: (v, d) => `A versão ${v} está disponível${d ? ` (${d})` : ''}. Atualizar agora?`, skip: 'Pular', later: 'Depois', update: 'Atualizar' },
			de: { title: 'Neue Version verfügbar!', text: (v, d) => `Version ${v} ist verfügbar${d ? ` (${d})` : ''}. Jetzt aktualisieren?`, skip: 'Überspringen', later: 'Später', update: 'Aktualisieren' },
			ja: { title: '新しいバージョンが利用可能です！', text: (v, d) => `バージョン ${v} が利用可能です${d ? ` (${d})` : ''}。今すぐ更新しますか？`, skip: 'スキップ', later: '後で', update: '更新' },
			es: { title: '¡Nueva versión disponible!', text: (v, d) => `La versión ${v} está disponible${d ? ` (${d})` : ''}. ¿Actualizar ahora?`, skip: 'Omitir', later: 'Después', update: 'Actualizar' },
			fr: { title: 'Nouvelle version disponible !', text: (v, d) => `La version ${v} est disponible${d ? ` (${d})` : ''}. Mettre à jour maintenant ?`, skip: 'Ignorer', later: 'Plus tard', update: 'Mettre à jour' },
			tr: { title: 'Yeni sürüm mevcut!', text: (v, d) => `${v} sürümü mevcut${d ? ` (${d})` : ''}. Şimdi güncellensin mi?`, skip: 'Atla', later: 'Sonra', update: 'Güncelle' },
			cs: { title: 'Nová verze je k dispozici!', text: (v, d) => `Verze ${v} je k dispozici${d ? ` (${d})` : ''}. Aktualizovat nyní?`, skip: 'Přeskočit', later: 'Později', update: 'Aktualizovat' },
			hi: { title: 'नया संस्करण उपलब्ध है!', text: (v, d) => `संस्करण ${v} उपलब्ध है${d ? ` (${d})` : ''}। अभी अपडेट करें?`, skip: 'छोड़ें', later: 'बाद में', update: 'अपडेट करें' },
		};
		return translations[_detectLanguage()] || translations.en;
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
			const t = this.translations;
			const result = await window.Nuntaria.fire({
				type: 'info',
				title: `${CONFIG.SCRIPT_NAME}: ${t.title}`,
				text: t.text(version, date),
				timer: CONFIG.UPDATE_MODAL_TIMER,
				timerPause: true,
				position: 'top-right',
				theme: 'glass',
				buttons: [
					{ label: t.skip, value: 'skip', variant: 'cancel' },
					{ label: t.later, value: false, variant: 'cancel' },
					{ label: t.update, value: true, variant: 'primary' }
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
