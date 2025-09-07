// src/app/shared/animations.ts
import { trigger, transition, style, query, group, animate, stagger, animateChild } from '@angular/animations';

export const routeSlide = trigger('routeSlide', [
  transition('* <=> *', [
    query(':enter, :leave', [style({ position: 'absolute', left: 0, top: 0, width: '100%' })], { optional: true }),
    group([
      query(':enter', [
        style({ transform: 'translateX(24px)' }),
        animate('220ms cubic-bezier(0.2,0,0,1)', style({ transform: 'translateX(0)' })),
        query('@*', animateChild(), { optional: true })
      ], { optional: true }),
      query(':leave', [
        style({ transform: 'translateX(0)' }),
        animate('180ms cubic-bezier(0.4,0,1,1)', style({ transform: 'translateX(-24px)' }))
      ], { optional: true })
    ])
  ])
]);

export const routeScale = trigger('routeScale', [
  transition('* <=> *', [
    query(':enter, :leave', [style({ position: 'absolute', left: 0, top: 0, width: '100%' })], { optional: true }),
    group([
      query(':enter', [
        style({ transform: 'scale(0.98)' }),
        animate('200ms cubic-bezier(0.2,0,0,1)', style({ transform: 'scale(1)' }))
      ], { optional: true }),
      query(':leave', [
        style({ transform: 'scale(1)' }),
        animate('180ms cubic-bezier(0.4,0,1,1)', style({ transform: 'scale(0.98)' }))
      ], { optional: true })
    ])
  ])
]);

export const elementSlide = trigger('elementSlide', [
  transition(':enter', [
    style({ transform: 'translateY(6px)' }),
    animate('150ms cubic-bezier(0.2,0,0,1)', style({ transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('120ms cubic-bezier(0.4,0,1,1)', style({ transform: 'translateY(-6px)' }))
  ])
]);

export const listSlideStagger = trigger('listSlideStagger', [
  transition('* <=> *', [
    query(':enter', [
      style({ transform: 'translateY(8px)' }),
      stagger(40, animate('180ms cubic-bezier(0.2,0,0,1)', style({ transform: 'translateY(0)' })))
    ], { optional: true })
  ])
]);

export const slideToggle = trigger('slideToggle', [
  transition(':enter', [style({ height: 0, overflow: 'hidden' }), animate('160ms ease-out', style({ height: '*' }))]),
  transition(':leave', [style({ overflow: 'hidden' }), animate('130ms ease-in', style({ height: 0 }))])
]);

export const routeTransition = routeSlide;
export const fadeInOut = elementSlide;
export const listStagger = listSlideStagger;
