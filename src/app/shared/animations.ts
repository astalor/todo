// src/app/shared/animations.ts
import { trigger, transition, style, animate, query, stagger, keyframes } from '@angular/animations';

export const routeSlide = trigger('routeSlide', [
  transition(':increment', [
    query(':enter, :leave', [
      style({ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden' })
    ], { optional: true }),
    query(':enter', [style({ transform: 'translate3d(110%,0,0)' })], { optional: true }),
    query(':leave', [animate('260ms cubic-bezier(.2,.8,.2,1)', style({ transform: 'translate3d(-120%,0,0)' }))], { optional: true }),
    query(':enter', [animate('300ms cubic-bezier(.2,.8,.2,1)', style({ transform: 'translate3d(0,0,0)' }))], { optional: true })
  ]),
  transition(':decrement', [
    query(':enter, :leave', [
      style({ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden' })
    ], { optional: true }),
    query(':enter', [style({ transform: 'translate3d(-110%,0,0)' })], { optional: true }),
    query(':leave', [animate('260ms cubic-bezier(.2,.8,.2,1)', style({ transform: 'translate3d(120%,0,0)' }))], { optional: true }),
    query(':enter', [animate('300ms cubic-bezier(.2,.8,.2,1)', style({ transform: 'translate3d(0,0,0)' }))], { optional: true })
  ])
]);

export const elementSlide = trigger('elementSlide', [
  transition(':enter', [
    style({ transform: 'translateY(12px)' }),
    animate('220ms cubic-bezier(.2,.8,.2,1)', style({ transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('160ms cubic-bezier(.4,0,.2,1)', style({ transform: 'translateY(-12px)' }))
  ])
]);

export const listSlideStagger = trigger('listSlideStagger', [
  transition(':enter, * => *', [
    query(':enter', [
      style({ transform: 'translateY(12px)' }),
      stagger(40, animate('170ms cubic-bezier(.2,.8,.2,1)', style({ transform: 'translateY(0)' })))
    ], { optional: true })
  ])
]);

export const scaleIn = trigger('scaleIn', [
  transition(':enter', [
    style({ transform: 'scale(0.94)' }),
    animate('160ms ease-out', style({ transform: 'scale(1)' }))
  ]),
  transition(':leave', [
    animate('130ms ease-in', style({ transform: 'scale(0.96)' }))
  ])
]);

export const bounceIn = trigger('bounceIn', [
  transition(':enter', [
    animate('360ms cubic-bezier(.34,1.56,.64,1)', keyframes([
      style({ offset: 0,   transform: 'translateY(14px) scale(0.92)' }),
      style({ offset: 0.6, transform: 'translateY(-4px) scale(1.04)' }),
      style({ offset: 0.8, transform: 'translateY(2px) scale(0.98)' }),
      style({ offset: 1,   transform: 'translateY(0) scale(1)' })
    ]))
  ])
]);

export const flipIn = trigger('flipIn', [
  transition(':enter', [
    style({ transform: 'perspective(800px) rotateY(-14deg) translateZ(0)' }),
    animate('260ms cubic-bezier(.2,.8,.2,1)', style({ transform: 'perspective(800px) rotateY(0) translateZ(0)' }))
  ]),
  transition(':leave', [
    animate('200ms cubic-bezier(.4,0,.2,1)', style({ transform: 'perspective(800px) rotateY(6deg) translateZ(0)' }))
  ])
]);

export const barGrow = trigger('barGrow', [
  transition(':enter', [
    style({ transform: 'scaleX(0)' }),
    animate('360ms cubic-bezier(.2,.8,.2,1)', style({ transform: 'scaleX(1)' }))
  ])
]);
