class Input {
    constructor() {
        this.resetKeys();

        this.onKeyUp = this.onKeyUp.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);

        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('blur', this.onBlur);
        window.addEventListener('visibilitychange', this.onVisibilityChange);
        window.addEventListener('contextmenu', this.onContextMenu);
    }

    resetKeys() {
        this.space = false;
        this.alt = false;
        this.shift = false;
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.w = false;
        this.a = false;
        this.s = false;
        this.d = false;
        this.e = false;
        this.q = false;
        this.r = false;
        this.f = false;
        this.t = false;
        this.g = false;
    }

    onKeyDown(e) {
        switch (e.key) {
            case " ": this.space = true; break;
            case "Alt": this.alt = true; break;
            case "Shift": this.shift = true; break;
            case "ArrowUp": this.up = true; break;
            case "ArrowDown": this.down = true; break;
            case "ArrowLeft": this.left = true; break;
            case "ArrowRight": this.right = true; break;
            case "w": this.w = true; break;
            case "a": this.a = true; break;
            case "s": this.s = true; break;
            case "d": this.d = true; break;
            case "e": this.e = true; break;
            case "q": this.q = true; break;
            case "r": this.r = true; break;
            case "f": this.f = true; break;
            case "t": this.t = true; break;
            case "g": this.g = true; break;
        }
    }

    onKeyUp(e) {
        switch (e.key) {
            case " ": this.space = false; break;
            case "Alt": this.alt = false; break;
            case "Shift": this.shift = false; break;
            case "ArrowUp": this.up = false; break;
            case "ArrowDown": this.down = false; break;
            case "ArrowLeft": this.left = false; break;
            case "ArrowRight": this.right = false; break;
            case "w": this.w = false; break;
            case "a": this.a = false; break;
            case "s": this.s = false; break;
            case "d": this.d = false; break;
            case "e": this.e = false; break;
            case "q": this.q = false; break;
            case "r": this.r = false; break;
            case "f": this.f = false; break;
            case "t": this.t = false; break;
            case "g": this.g = false; break;
        }
    }

    onBlur() {
        this.resetKeys(); // Clear all keys if window loses focus
    }

    onVisibilityChange() {
        if (document.visibilityState !== "visible") {
            this.resetKeys();
        }
    }

    onContextMenu(e) {
        e.preventDefault(); // Disable right-click context menu
    }
}

