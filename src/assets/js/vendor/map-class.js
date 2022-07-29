class Map {
    constructor(selector) {
        this.$map = document.querySelector(selector);
        this.$mapInner = this.$map.querySelector('.map__inner');
        this.$mapMenu = this.$map.querySelector('.js-map-menu');
        this.$mapMenuLinks = this.$mapMenu.querySelectorAll('li');
        this.$mapInfo = this.$map.querySelector('.js-map-info');
        this.$mapInfoItems = this.$mapInfo.querySelectorAll('.js-map-info__item');        
        this.$closePopup = this.$map.querySelectorAll('.js-close');        

        this.setup();
    }

    setup = () => {
        this.$mapMenuLinks.forEach(link => {  
            link.addEventListener('click', () => this.onClickHandler(link));  
        });

        this.$closePopup.forEach(close => {  
            close.addEventListener('click', this.onCloseHandler);  
        });
    }

    onClickHandler = (link) => {
        const id = link.getAttribute('data-id');
        this.$mapInfoItems.forEach(item => {  
            const itemId = item.getAttribute('data-id');

            item.classList.remove('active');
            if (itemId === id) {
                item.classList.add('active');
                this.$mapInner.className = `map__inner move-${id}`;
            }
        });
    }

    onCloseHandler = (e) => {
        const item = e.target.closest('.js-map-info__item');

        this.$mapInner.className = 'map__inner';
        if (item.classList.contains('active')) item.classList.remove('active');
    }
}