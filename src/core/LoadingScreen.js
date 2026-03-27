export class LoadingScreen {
	constructor(name) {
		this.name = name;
		this.fadeSpeed = 1;
		this.isFading = false;
		this.stars = [];
		this.animationFrameId = null;
		this.canvas = null;
		this.ctx = null;
		this.starCount = 150;
		this.lastFrameTime = performance.now();
		this.language = this.detectLanguage();
		this.translations = this.getTranslations();
		this.totalModules = 0;
		this.loadedModules = 0;
	}

	detectLanguage() {
		const urlLang = new URLSearchParams(document.location.search).get('locale');
		if (urlLang) return urlLang.toLowerCase();

		const storedLang = localStorage.getItem('language_store_key');
		if (storedLang) return storedLang.toLowerCase();

		return navigator.language.split('-')[0].toLowerCase();
	}

	getTranslations() {
		const translations = {
			en: { loading: "Loading resources, please wait...", wait: "It can take up to a few minutes to load." },
			ru: { loading: "Загрузка ресурсов, пожалуйста, подождите...", wait: "Это может занять несколько минут." },
			uk: { loading: "Завантаження ресурсів, будь ласка, зачекайте...", wait: "Це може зайняти кілька хвилин." },
			nl: { loading: "Bronnen laden, even geduld...", wait: "Het kan een paar minuten duren om te laden." },
			pl: { loading: "Ładowanie zasobów, proszę czekać...", wait: "Może to potrwać kilka minut." },
			pt: { loading: "Carregando recursos, por favor, aguarde...", wait: "Isso pode levar alguns minutos para carregar." },
			de: { loading: "Ressourcen werden geladen, bitte warten...", wait: "Das Laden kann einige Minuten dauern." },
			ja: { loading: "リソースを読み込んでいます。お待ちください...", wait: "読み込みには数分かかる場合があります。" },
			es: { loading: "Cargando recursos, por favor espere...", wait: "Puede tardar hasta unos minutos en cargar." },
			fr: { loading: "Chargement des ressources, veuillez patienter...", wait: "Cela peut prendre quelques minutes." },
			tr: { loading: "Kaynaklar yükleniyor, lütfen bekleyin...", wait: "Yükleme birkaç dakika sürebilir." },
			cs: { loading: "Načítání zdrojů, prosím čekejte...", wait: "Načítání může trvat několik minut." },
			hi: { loading: "संसाधन लोड हो रहे हैं, कृपया प्रतीक्षा करें...", wait: "लोड होने में कुछ मिनट लग सकते हैं।" },
		};
		return translations[this.language] || translations.en;
	}

	static add(name) {
		const instance = new LoadingScreen(name);
		instance.init();
		return instance;
	}

	init() {
		const el = document.createElement('div');
		el.className = `${this.name}--loading-screen`;
		el.innerHTML = `
			<canvas class="${this.name}--night-sky"></canvas>
			<div class="${this.name}--loading-banner">
				<h3 class="${this.name}--loading-header">${this.name}</h3>
				<p class="${this.name}--loading-text">${this.translations.loading}</p>
				<p class="${this.name}--loading-text">${this.translations.wait}</p>
			</div>
			<style>
				html { font-size: 16px !important; }
				body {
					position: absolute !important; top: 0 !important; left: 0 !important;
					min-height: 100vh !important; height: 100vh !important;
					width: 100vw !important; margin: 0; overflow: hidden;
				}
				.${this.name}--loading-screen, .${this.name}--loading-screen * { margin: 0; padding: 0; box-sizing: border-box; }
				.${this.name}--loading-screen {
					position: absolute; top: 0; left: 0; width: 100%;
					min-height: 100vh; height: 100vh;
					display: flex; justify-content: center; align-items: center; z-index: 9999;
				}
				.${this.name}--loading-banner {
					position: absolute; display: flex; flex-direction: column;
					align-items: center; justify-content: center; gap: 1rem;
					text-align: center; padding: .5rem 1rem;
					background-color: rgba(0,0,0,.25); color: rgb(255,255,255);
					border: .1rem solid rgb(75,75,75); border-radius: .25rem;
					backdrop-filter: blur(.5rem); z-index: 10000; overflow: hidden;
					animation: ${this.name}--banner-appear ${1 / this.fadeSpeed}s ease-in-out;
				}
				.${this.name}--loading-header { font-size: 2.5rem; font-weight: bold; }
				.${this.name}--loading-text   { font-size: 1.5rem; font-weight: normal; }
				.${this.name}--loading-progress-container {
					width: 100%; display: flex; align-items: center;
					justify-content: space-between; gap: .5rem; margin-top: .5rem;
					opacity: 0; transform: scale(0);
					transition: opacity .2s ease, transform .2s ease;
				}
				.${this.name}--loading-progress-container.shown { opacity: 1; transform: scale(1); }
				.${this.name}--loading-progress-bar-container {
					width: 80%; height: .5rem;
					background: rgba(255,255,255,.2); border-radius: .25rem; overflow: hidden;
				}
				.${this.name}--loading-progress-bar-value {
					width: 0; height: 100%;
					background: rgb(80,150,200); transition: width .2s ease;
				}
				.${this.name}--loading-progress-text {
					text-align: center; color: rgb(255,255,255);
					max-width: 20%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
				}
				@keyframes ${this.name}--banner-appear {
					0%   { transform: translateX(-100vw) scale(.7); opacity: .7; }
					80%  { transform: translateX(0) scale(.7);      opacity: .7; }
					100% { transform: scale(1);                      opacity: 1;  }
				}
				@keyframes ${this.name}--banner-disappear {
					0%   { transform: scale(1);                      opacity: 1;  }
					20%  { transform: translateX(0) scale(.7);      opacity: .7; }
					100% { transform: translateX(100vw) scale(.7);  opacity: .7; }
				}
			</style>
		`;

		document.body.appendChild(el);

		this.canvas = document.querySelector(`.${this.name}--night-sky`);
		this.ctx = this.canvas.getContext('2d');
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

		window.addEventListener('resize', () => this.resizeCanvas());
		this.initStars();
		requestAnimationFrame(this.animate.bind(this));
	}

	initStars() {
		for (let i = 0; i < this.starCount; i++) {
			const size = Math.random() * 2 + 0.5;
			const baseTwinkleSpeed = (1 / size) * (Math.random() * 0.5 + 0.5) / 20;
			this.stars.push({
				x: Math.random() * this.canvas.width,
				y: Math.random() * this.canvas.height,
				size,
				opacity: Math.random() * 0.7 + 0.3,
				baseTwinkleSpeed,
				twinkleSpeed: baseTwinkleSpeed,
			});
		}
	}

	resizeCanvas() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.stars = [];
		this.initStars();
	}

	updateGradient() {
		const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
		gradient.addColorStop(0, 'rgb(10, 15, 30)');
		gradient.addColorStop(1, 'rgb(10, 25, 50)');
		this.ctx.fillStyle = gradient;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	fadeOut() {
		const banner = document.querySelector(`.${this.name}--loading-banner`);
		banner.style.animation = `${this.name}--banner-disappear ${1 / this.fadeSpeed}s ease-in-out`;
		setTimeout(() => {
			banner.remove();
			this.isFading = true;
		}, 1000 / this.fadeSpeed);
	}

	animate(timestamp) {
		const deltaTime = (timestamp - this.lastFrameTime) / 1000;
		this.lastFrameTime = timestamp;
		const fadeStep = this.fadeSpeed * deltaTime * 60;

		this.updateGradient();

		this.stars.forEach((star) => {
			if (!this.isFading) {
				star.opacity += star.twinkleSpeed * deltaTime * 60;
				if (star.opacity >= 1) {
					star.opacity = 1;
					star.twinkleSpeed = -star.baseTwinkleSpeed * (Math.random() * 0.5 + 0.5);
				} else if (star.opacity <= 0.3) {
					star.opacity = 0.3;
					star.twinkleSpeed = star.baseTwinkleSpeed * (Math.random() * 0.5 + 0.5);
				}
			} else {
				star.opacity -= fadeStep;
				if (star.opacity < 0) star.opacity = 0;
			}

			this.ctx.beginPath();
			this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
			this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
			this.ctx.fill();
		});

		if (this.isFading && this.stars.every(s => s.opacity === 0)) {
			cancelAnimationFrame(this.animationFrameId);
			const screen = document.querySelector(`.${this.name}--loading-screen`);
			screen.style.transition = `opacity ${1 / this.fadeSpeed}s ease-in-out`;
			screen.style.opacity = '0';
			setTimeout(() => screen.remove(), 1000 / this.fadeSpeed);
			return;
		}

		this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
	}

	setTotalModules(totalModules) {
		this.totalModules = totalModules;
		const banner = document.querySelector(`.${this.name}--loading-banner`);
		if (!banner) return;

		const progressContainer = document.createElement('div');
		progressContainer.className = `${this.name}--loading-progress-container`;
		progressContainer.innerHTML = `
			<div class="${this.name}--loading-progress-bar-container">
				<div class="${this.name}--loading-progress-bar-value"></div>
			</div>
			<p class="${this.name}--loading-progress-text">0/${this.totalModules}</p>
		`;
		banner.appendChild(progressContainer);
		setTimeout(() => progressContainer.classList.add('shown'), 10);
	}

	updateProgress() {
		this.loadedModules++;
		const bar = document.querySelector(`.${this.name}--loading-progress-bar-value`);
		const text = document.querySelector(`.${this.name}--loading-progress-text`);
		if (bar && text) {
			bar.style.width = `${(this.loadedModules / this.totalModules) * 100}%`;
			text.textContent = `${this.loadedModules}/${this.totalModules}`;
		}
	}

	static remove(instance) {
		if (instance) instance.fadeOut();
	}
}