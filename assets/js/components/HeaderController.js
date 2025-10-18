export class HeaderController {
    constructor() {
        this.header = document.querySelector('.header');
        this.logo = document.querySelector('[data-element="logo"]');
        this.init();
    }

    init() {
        this.handleLogoClick();
    }

    handleLogoClick() {
        if (this.logo) {
            this.logo.addEventListener('click', (e) => {
                e.preventDefault();
                location.reload();
            });
        }
    }
}
