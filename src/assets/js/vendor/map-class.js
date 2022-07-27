class Map {
    constructor(selector) {
        this.$map = document.querySelector(selector);
        this.$mapMenu = this.$map.querySelector('.js-map-menu');
        this.$mapMenuLinks = this.$mapMenu.querySelectorAll('li');
        this.$mapInfo = this.$map.querySelector('.js-map-info');
        this.$mapInfoItems = this.$mapInfo.querySelectorAll('.js-map-info__item');        

        this.setup();
    }

    setup = () => {
        this.$mapMenuLinks.forEach(link => {  
            link.addEventListener('click', () => this.onHoverHandler(link));  
        });
    }

    onHoverHandler = (link) => {
        console.log(link);
    }
}