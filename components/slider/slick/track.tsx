import React, { Component, ReactElement } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { dom } from '../../util';
import type { OptionProps, TrackProps } from '../types';

const isNumber = (value: number | undefined): value is number => {
    return typeof value === 'number';
};

/**
 * Slider Track
 * 内容轨道
 */

const getSlideClasses = (specProps: TrackProps) => {
    const prefix = specProps.prefix;
    let slickActive, slickCenter;
    let centerOffset, index;

    if (
        !isNumber(specProps.slideCount) ||
        !isNumber(specProps.activeIndex) ||
        !isNumber(specProps.slidesToShow) ||
        !isNumber(specProps.currentSlide)
    )
        return;

    // @_@ todo: specProps.activeIndex可能为未定义
    if (specProps.rtl) {
        index = specProps.slideCount - 1 - specProps.activeIndex;
    } else {
        index = specProps.activeIndex || 0;
    }

    const slickCloned = index < 0 || index >= specProps.slideCount;
    if (specProps.centerMode) {
        centerOffset = Math.floor(specProps.slidesToShow / 2);
        slickCenter = (index - specProps.currentSlide) % specProps.slideCount === 0;
        if (
            index > specProps.currentSlide - centerOffset - 1 &&
            index <= specProps.currentSlide + centerOffset
        ) {
            slickActive = true;
        }
    } else {
        slickActive =
            specProps.currentSlide <= index &&
            index < specProps.currentSlide + specProps.slidesToShow;
    }

    return classNames(`${prefix}slick-slide`, {
        [`${prefix}slick-active`]: slickActive,
        [`${prefix}slick-center`]: slickCenter,
        [`${prefix}slick-cloned`]: slickCloned,
    });
};

const getSlideStyle = function (specProps: TrackProps) {
    if (!isNumber(specProps.slideHeight) || !isNumber(specProps.slideWidth)) return;

    const style: React.CSSProperties = {};

    if (specProps.variableWidth === undefined || specProps.variableWidth === false) {
        style.width = specProps.slideWidth;
    }

    if (specProps.animation === 'fade') {
        style.position = 'relative';

        style.opacity = specProps.currentSlide === specProps.activeIndex ? 1 : 0;
        style.visibility = 'visible';
        style.transition = `opacity ${specProps.speed}ms ${specProps.cssEase}`;
        style.WebkitTransition = `opacity ${specProps.speed}ms ${specProps.cssEase}`;

        // @_@ todo: specProps.activeIndex可能为未定义
        if (specProps.vertical) {
            style.top = -(specProps.activeIndex || 0) * specProps.slideHeight;
        } else {
            style.left = -(specProps.activeIndex || 0) * specProps.slideWidth;
        }
    }

    if (specProps.vertical) {
        style.width = '100%';
    }

    return style;
};

const getKey = (child: ReactElement, fallbackKey: number) => {
    // key could be a zero
    return child.key === null || child.key === undefined ? fallbackKey : child.key;
};

const renderSlides = (specProps: TrackProps) => {
    let key;
    const slides: ReactElement[] = [];
    const preCloneSlides: ReactElement[] = [];
    const postCloneSlides: ReactElement[] = [];
    const count = React.Children.count(specProps.children);
    let child: ReactElement;

    React.Children.forEach(specProps.children, (elem, index) => {
        if (!elem) return;
        const childOnClickOptions: OptionProps = {
            message: 'children',
            index,
            slidesToScroll: specProps.slidesToScroll,
            currentSlide: specProps.currentSlide,
        };

        if (
            !specProps.lazyLoad ||
            (specProps.lazyLoad &&
                specProps.lazyLoadedList?.indexOf(index) &&
                specProps.lazyLoadedList?.indexOf(index) >= 0)
        ) {
            child = elem;
        } else {
            child = elem.key ? <div key={elem.key} /> : <div />;
        }
        const childStyle = getSlideStyle({ ...specProps, activeIndex: index });
        const slickClasses = getSlideClasses({
            ...specProps,
            activeIndex: index,
        });
        let cssClasses;

        if (child.props.className) {
            cssClasses = classNames(slickClasses, child.props.className);
        } else {
            cssClasses = slickClasses;
        }

        const onClick = function (e: React.MouseEvent<HTMLElement>) {
            // only child === elem, it will has .props.onClick;
            child.props && child.props.onClick && elem.props.onClick(e);
            if (specProps.focusOnSelect) {
                // @_@ todo: 这里有点奇怪：外层slideProps的同名属性是个布尔值，到里面居然会变成函数？
                specProps.focusOnSelect(childOnClickOptions);
            }
        };

        slides.push(
            React.cloneElement(child, {
                key: `original${getKey(child, index)}`,
                'data-index': index,
                className: cssClasses,
                tabIndex: '-1',
                'aria-posinset': index,
                'aria-setsize': count,
                role: 'listitem',
                dir: specProps.rtl ? 'rtl' : 'ltr',
                // server-side render depend on elements of their own style
                style: !dom.hasDOM
                    ? { outline: 'none', ...childStyle, ...child.props.style }
                    : { outline: 'none', ...child.props.style, ...childStyle },
                onClick,
            })
        );

        // variableWidth doesn't wrap properly.
        if (
            specProps.infinite &&
            specProps.animation !== 'fade' &&
            isNumber(specProps.slidesToShow)
        ) {
            const infiniteCount = specProps.variableWidth
                ? specProps.slidesToShow + 1
                : specProps.slidesToShow;

            if (index >= count - infiniteCount) {
                key = -(count - index);
                preCloneSlides.push(
                    React.cloneElement(child, {
                        key: `precloned${getKey(child, key)}`,
                        'data-index': key,
                        className: cssClasses,
                        style: { ...child.props.style, ...childStyle },
                    })
                );
            }

            if (index < infiniteCount) {
                key = count + index;
                postCloneSlides.push(
                    React.cloneElement(child, {
                        key: `postcloned${getKey(child, key)}`,
                        'data-index': key,
                        className: cssClasses,
                        style: { ...child.props.style, ...childStyle },
                    })
                );
            }
        }
    });
    // To support server-side rendering
    if (!dom.hasDOM && isNumber(specProps.currentSlide) && isNumber(specProps.slidesToShow)) {
        return slides.slice(
            specProps.currentSlide,
            specProps.currentSlide + specProps.slidesToShow
        );
    }
    if (specProps.rtl) {
        return preCloneSlides.concat(slides, postCloneSlides).reverse();
    } else {
        return preCloneSlides.concat(slides, postCloneSlides);
    }
};

export default class Track extends Component<TrackProps> {
    static propTypes = {
        prefix: PropTypes.string,
        trackStyle: PropTypes.object,
    };

    static defaultProps = {
        prefix: 'next-',
    };

    render() {
        const slides = renderSlides(this.props);
        return (
            <div
                role="list"
                className={`${this.props.prefix}slick-track`}
                style={this.props.trackStyle}
            >
                {slides}
            </div>
        );
    }
}
