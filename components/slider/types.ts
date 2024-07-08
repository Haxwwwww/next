import React, { MouseEventHandler, ReactElement } from 'react';
import { CommonProps } from '../util';
import { Locale } from '../locale/types';

interface HTMLAttributesWeak extends React.HTMLAttributes<HTMLElement> {}

export interface OptionProps {
    message?: string;
    index?: number;
    currentSlide?: number;
    slidesToScroll?: number;
}

interface BasicSlideProps {
    /**
     * 是否启用居中模式
     */
    centerMode?: boolean;

    /**
     * 是否使用无穷循环模式
     */
    infinite?: boolean;

    /**
     * 同时展示的图片数量
     */
    slidesToShow?: number;

    /**
     * 同时滑动的图片数量
     */
    slidesToScroll?: number;

    /**
     * 轮播图数量
     */
    slideCount?: number;

    /**
     * 当前图片
     */
    currentSlide?: number;
}

export interface TrackProps extends CommonProps, BasicSlideProps {
    /**
     * 跳转到指定的轮播图（受控）
     * @defaultValue 0
     */
    activeIndex?: number;

    /**
     * 轨道样式
     */
    trackStyle?: React.CSSProperties;

    /**
     * 是否启用懒加载
     */
    lazyLoad?: boolean;

    /**
     * 懒加载列表
     */
    // @_@ todo: 数据类型待定
    lazyLoadedList?: number[];

    /**
     * 动效类型，默认是'slide'
     */
    animation?: string | boolean;

    variableWidth?: boolean;
    slideWidth?: number;
    slideHeight?: number;
    /**
     * CSS3 Animation Easing,默认‘ease’
     */
    cssEase?: string;

    /**
     * 轮播速度
     */
    speed?: number;
    vertical?: boolean;

    children?: ReactElement[];

    focusOnSelect?: (options: OptionProps) => void;
}

export interface DotsProps extends CommonProps, BasicSlideProps {
    /**
     * 导航锚点的 CSS 类
     */
    dotsClass?: string;

    /**
     * 导航锚点位置
     */
    dotsDirection?: 'hoz' | 'ver';

    /**
     * 自定义导航锚点
     */
    dotsRender?: (index: number, current: number) => void;

    /**
     * 锚点导航触发方式
     */
    triggerType?: 'click' | 'hover';

    /**
     * 改变轮播图
     */
    // @_@ todo: 数据类型待定
    changeSlide?: (options: OptionProps) => void;
}

export interface ArrowProps
    extends Omit<HTMLAttributesWeak, 'onMouseEnter' | 'onMouseLeave'>,
        CommonProps,
        BasicSlideProps {
    /**
     * 箭头种类
     */
    type: 'prev' | 'next';

    /**
     * 导航箭头大小 可选值: 'medium', 'large'
     */
    arrowSize?: 'medium' | 'large';

    /**
     * 导航箭头位置 可选值: 'inner', 'outer'
     */
    arrowPosition?: 'inner' | 'outer';

    /**
     * 导航箭头的方向 可选值: 'hoz', 'ver'
     */
    arrowDirection: 'hoz' | 'ver';

    children?: ReactElement[];

    /**
     * 点击事件处理函数
     */
    clickHandler?: (options: OptionProps, e: React.MouseEvent<HTMLElement>) => void;

    /**
     * 鼠标进入
     */
    onMouseEnter?: MouseEventHandler<HTMLDivElement | HTMLButtonElement>;

    /**
     * 鼠标移出
     */
    onMouseLeave?: MouseEventHandler<HTMLDivElement | HTMLButtonElement>;
}

export interface InnerSliderProps
    extends CommonProps,
        Omit<ArrowProps, 'onChange'>,
        DotsProps,
        Omit<TrackProps, 'focusOnSelect'>,
        Omit<HTMLAttributesWeak, 'onMouseEnter' | 'onMouseLeave' | 'onChange' | 'children'> {
    /**
     * 是否显示箭头
     */
    arrows?: boolean;

    /**
     * 是否显示导航锚点
     */
    dots?: boolean;

    /**
     * 初始被激活的轮播图
     */
    defaultActiveIndex?: number;

    /**
     * Side padding when in center mode (px or %); 展示部分为center，pading会产生前后预览
     */
    centerPadding?: string;

    /**
     * 多图轮播时，点击选中后自动居中
     */
    focusOnSelect?: boolean;

    verticalSwiping?: boolean;

    /**
     * 是否使用自适应高度
     */
    adaptiveHeight?: boolean;

    /**
     * 轮播切换的回调函数
     */
    onChange?: (index: number) => void;

    onBeforeChange?: (index: number) => void;

    prevArrow?: ReactElement[];
    nextArrow?: ReactElement[];
}
export interface InnerSliderState {
    lazyLoadedList?: number[];
    slideCount?: number;
    currentSlide?: number;
    trackStyle?: React.CSSProperties;
    animating?: boolean;
    dragging?: boolean;
    autoPlayTimer?: NodeJS.Timeout;
    currentDirection?: number;
    currentLeft?: number;
    direction?: number;
    listWidth?: number;
    listHeight?: number;
    slideWidth?: number;
    slideHeight?: number;
    slideHeightList?: number[];
    swipeLeft?: number;
    touchObject?: {
        startX: number;
        startY: number;
        curX: number;
        curY: number;
    };
    initialized?: boolean;
    edgeDragged?: boolean;
    swiped?: boolean;
    trackWidth?: number;
    children?: ReactElement[];
}

export interface SliderProps
    extends Omit<
            HTMLAttributesWeak,
            'onChange' | 'draggable' | 'children' | 'onMouseEnter' | 'onMouseLeave'
        >,
        CommonProps,
        InnerSliderProps {
    /**
     * 各组件的国际化文案对象，属性为组件的 displayName
     * @en Locale object for components
     */
    locale?: Partial<Locale>;
    /**
     * 自定义传入的样式
     */
    className?: string;

    /**
     * 是否自动播放
     */
    autoplay?: boolean;

    /**
     * 自动播放的速度
     */
    autoplaySpeed?: number;

    /**
     * 是否可拖拽
     */
    draggable?: boolean;

    /**
     * 轮播方向
     */
    slideDirection?: 'hoz' | 'ver';

    /**
     * 自定义传入的class
     */
    style?: React.CSSProperties;

    // @_@ todo: 下面为一些废弃属性，详见index.tsx
    /**
     * @deprecated use arrowPosition instead
     * @skip
     */
    arrowPos?: string;

    /**
     * @deprecated use defaultActiveIndex instead
     * @skip
     */
    initialSlide?: number;

    /**
     * @deprecated use activeIndex instead
     * @skip
     */
    slickGoTo?: number;

    /**
     * @deprecated use onChange instead
     * @skip
     */
    afterChange?: (index: number) => void;

    /**
     * @deprecated use onBeforeChange instead
     * @skip
     */
    beforeChange?: (index: number) => void;
}
