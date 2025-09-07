// src/app/shared/animations.ts
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

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
