import { findDOMNode } from 'react-dom';
import { getTrackCSS, getTrackLeft, getTrackAnimateCSS } from './trackHelper';
import type { OptionProps } from '../../types';

/* istanbul ignore next */
const EventHandlers = {
    // Event handler for previous and next
    changeSlide(options: OptionProps) {
        let slideOffset, targetSlide;
        const unevenOffset = this.state.slideCount % this.props.slidesToScroll !== 0;
        const indexOffset = unevenOffset
            ? 0
            : (this.state.slideCount - this.state.currentSlide) % this.props.slidesToScroll;

        if (options.message === 'previous') {
            slideOffset =
                indexOffset === 0
                    ? this.props.slidesToScroll
                    : this.props.slidesToShow - indexOffset;
            targetSlide = this.state.currentSlide - slideOffset;
        } else if (options.message === 'next') {
            slideOffset = indexOffset === 0 ? this.props.slidesToScroll : indexOffset;
            targetSlide = this.state.currentSlide + slideOffset;
        } else if (options.message === 'dots' || options.message === 'children') {
            // Click on dots
            targetSlide =
                options.index && options.slidesToScroll && options.index * options.slidesToScroll;
            if (targetSlide === options.currentSlide) {
                return;
            }
        } else if (options.message === 'index') {
            targetSlide = options.index;
            if (targetSlide === options.currentSlide) {
                return;
            }
        }
        this.slideHandler(targetSlide);
    },

    // Accessiblity handler for previous and next
    // @_@ todo: 这个函数似乎没有被调用过？
    keyHandler(e: KeyboardEvent) {
        //Dont slide if the cursor is inside the form fields and arrow keys are pressed
        if (!(e.target instanceof HTMLElement && e.target.tagName.match('TEXTAREA|INPUT|SELECT'))) {
            if (e.keyCode === 37 && this.props.accessibility === true) {
                this.changeSlide({
                    message: this.props.rtl === true ? 'next' : 'previous',
                });
            } else if (e.keyCode === 39 && this.props.accessibility === true) {
                this.changeSlide({
                    message: this.props.rtl === true ? 'previous' : 'next',
                });
            }
        }
    },

    // Focus on selecting a slide (click handler on track)
    selectHandler(options: OptionProps) {
        this.changeSlide(options);
    },

    swipeStart(e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) {
        if (
            this.props.swipe === false ||
            ('ontouchend' in document && this.props.swipe === false)
        ) {
            return;
        } else if (this.props.draggable === false && e.type.indexOf('mouse') !== -1) {
            return;
        }
        const posX = 'touches' in e ? e.touches[0].pageX : e.clientX;
        const posY = 'touches' in e ? e.touches[0].pageY : e.clientY;
        this.setState({
            dragging: true,
            touchObject: {
                startX: posX,
                startY: posY,
                curX: posX,
                curY: posY,
            },
        });
    },

    swipeMove(e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) {
        if (!this.state.dragging) {
            return;
        }
        if (this.state.animating) {
            return;
        }
        const touchObject = this.state.touchObject;

        const curLeft = getTrackLeft({
            slideIndex: this.state.currentSlide,
            trackRef: this.refs.track,
            ...this.props,
            ...this.state,
        });

        touchObject.curX = 'touches' in e ? e.touches[0].pageX : e.clientX;
        touchObject.curY = 'touches' in e ? e.touches[0].pageY : e.clientY;
        touchObject.swipeLength = Math.round(
            Math.sqrt(Math.pow(touchObject.curX - touchObject.startX, 2))
        );

        let positionOffset =
            (this.props.rtl === false ? 1 : -1) * (touchObject.curX > touchObject.startX ? 1 : -1);

        if (this.props.verticalSwiping === true) {
            touchObject.swipeLength = Math.round(
                Math.sqrt(Math.pow(touchObject.curY - touchObject.startY, 2))
            );
            positionOffset = touchObject.curY > touchObject.startY ? 1 : -1;
        }

        const currentSlide = this.state.currentSlide;
        const dotCount = Math.ceil(this.state.slideCount / this.props.slidesToScroll);
        const swipeDirection = this.swipeDirection(this.state.touchObject);
        let touchSwipeLength = touchObject.swipeLength;

        if (this.props.infinite === false) {
            if (
                (currentSlide === 0 && swipeDirection === 'right') ||
                (currentSlide + 1 >= dotCount && swipeDirection === 'left')
            ) {
                touchSwipeLength = touchObject.swipeLength * this.props.edgeFriction;

                if (this.state.edgeDragged === false && this.props.edgeEvent) {
                    this.props.edgeEvent(swipeDirection);
                    this.setState({ edgeDragged: true });
                }
            }
        }

        if (this.state.swiped === false && this.props.swipeEvent) {
            this.props.swipeEvent(swipeDirection);
            this.setState({ swiped: true });
        }

        const swipeLeft = curLeft + touchSwipeLength * positionOffset;
        this.setState({
            touchObject: touchObject,
            swipeLeft: swipeLeft,
            trackStyle: getTrackCSS({
                left: swipeLeft,
                ...this.props,
                ...this.state,
            }),
        });

        if (
            Math.abs(touchObject.curX - touchObject.startX) <
            Math.abs(touchObject.curY - touchObject.startY) * 0.8
        ) {
            return;
        }
        if (touchObject.swipeLength > 4) {
            e.preventDefault();
        }
    },

    getNavigableIndexes() {
        let max;
        let breakPoint = 0;
        let counter = 0;
        const indexes = [];

        if (!this.props.infinite) {
            max = this.state.slideCount;
        } else {
            breakPoint = this.props.slidesToShow * -1;
            counter = this.props.slidesToShow * -1;
            max = this.state.slideCount * 2;
        }

        while (breakPoint < max) {
            indexes.push(breakPoint);
            breakPoint = counter + this.props.slidesToScroll;

            counter +=
                this.props.slidesToScroll <= this.props.slidesToShow
                    ? this.props.slidesToScroll
                    : this.props.slidesToShow;
        }

        return indexes;
    },

    checkNavigable(index: number) {
        const navigables = this.getNavigableIndexes();
        let prevNavigable = 0;

        if (index > navigables[navigables.length - 1]) {
            index = navigables[navigables.length - 1];
        } else {
            for (const n in navigables) {
                if (index < navigables[n]) {
                    index = prevNavigable;
                    break;
                }

                prevNavigable = navigables[n];
            }
        }

        return index;
    },

    getSlideCount() {
        const centerOffset = this.props.centerMode
            ? this.state.slideWidth * Math.floor(this.props.slidesToShow / 2)
            : 0;
        if (this.props.swipeToSlide) {
            let swipedSlide: HTMLElement | undefined;
            const slickList = findDOMNode(this.list);

            const slides =
                slickList instanceof Element &&
                slickList?.querySelectorAll(`${this.props.prefix}slick-slide`);

            if (!slides) return 0;

            // @_@ todo: 此处计数逻辑稍做补充
            Array.from(slides).every(slide => {
                if (slide instanceof HTMLElement) {
                    if (!this.props.vertical) {
                        if (
                            slide.offsetLeft - centerOffset + (this.getWidth(slide) || 0) / 2 >
                            this.state.swipeLeft * -1
                        ) {
                            swipedSlide = slide;
                            return false;
                        }
                    } else if (
                        slide.offsetTop + (this.getHeight(slide) || 0) / 2 >
                        this.state.swipeLeft * -1
                    ) {
                        swipedSlide = slide;
                        return false;
                    }

                    return true;
                }
                return true;
            });
            // @_@ todo: 这段逻辑待确认
            const slidesTraversed =
                Math.abs(
                    (swipedSlide?.dataset?.index && parseInt(swipedSlide.dataset?.index)) ||
                        0 - this.state.currentSlide
                ) || 1;
            return slidesTraversed;
        } else {
            return this.props.slidesToScroll;
        }
    },

    swipeEnd(e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) {
        if (!this.state.dragging) {
            if (this.props.swipe) {
                e.preventDefault();
            }
            return;
        }
        const touchObject = this.state.touchObject;
        let minSwipe = this.state.listWidth / this.props.touchThreshold;
        const swipeDirection = this.swipeDirection(touchObject);

        if (this.props.verticalSwiping) {
            minSwipe = this.state.listHeight / this.props.touchThreshold;
        }

        // reset the state of touch related state variables.
        this.setState({
            dragging: false,
            edgeDragged: false,
            swiped: false,
            swipeLeft: null,
            touchObject: {},
        });

        if (!touchObject.swipeLength) {
            return;
        }

        if (touchObject.swipeLength > minSwipe) {
            e.preventDefault();

            let slideCount;
            let newSlide;

            switch (swipeDirection) {
                case 'left':
                case 'down':
                    newSlide = this.state.currentSlide + this.getSlideCount();
                    slideCount = this.props.swipeToSlide ? this.checkNavigable(newSlide) : newSlide;
                    this.setState({ currentDirection: 0 });
                    break;
                case 'right':
                case 'up':
                    newSlide = this.state.currentSlide - this.getSlideCount();
                    slideCount = this.props.swipeToSlide ? this.checkNavigable(newSlide) : newSlide;
                    this.setState({ currentDirection: 1 });
                    break;
                default:
                    slideCount = this.state.currentSlide;
            }
            this.slideHandler(slideCount);
        } else {
            // Adjust the track back to it's original position.
            const currentLeft = getTrackLeft({
                slideIndex: this.state.currentSlide,
                trackRef: this.track,
                ...this.props,
                ...this.state,
            });

            this.setState({
                trackStyle: getTrackAnimateCSS({
                    left: currentLeft,
                    ...this.props,
                    ...this.state,
                }),
            });
        }
    },

    onInnerSliderEnter() {
        if (this.props.autoplay && this.props.pauseOnHover) {
            this.pause();
        }
    },

    onInnerSliderLeave() {
        if (this.props.autoplay && this.props.pauseOnHover) {
            this.autoPlay();
        }
    },
};

export default EventHandlers;
