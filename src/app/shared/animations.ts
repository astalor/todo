import { animate, group, query, stagger, style, transition, trigger } from '@angular/animations';

export const routeSlide = trigger('routeSlide', [
  transition(':increment', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({ position: 'absolute', top: 0, left: 0, right: 0, width: '100%' })
    ], { optional: true }),
    query(':enter', [style({ transform: 'translate3d(100%,0,0)' })], { optional: true }),
    group([
      query(':leave', [animate('260ms cubic-bezier(.2,.8,.2,1)', style({ transform: 'translate3d(-30%,0,0)' }))], { optional: true }),
      query(':enter', [animate('300ms cubic-bezier(.2,.8,.2,1)', style({ transform: 'translate3d(0,0,0)' }))], { optional: true })
    ])
  ]),
  transition(':decrement', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({ position: 'absolute', top: 0, left: 0, right: 0, width: '100%' })
    ], { optional: true }),
    query(':enter', [style({ transform: 'translate3d(-100%,0,0)' })], { optional: true }),
    group([
      query(':leave', [animate('260ms cubic-bezier(.2,.8,.2,1)', style({ transform: 'translate3d(30%,0,0)' }))], { optional: true }),
      query(':enter', [animate('300ms cubic-bezier(.2,.8,.2,1)', style({ transform: 'translate3d(0,0,0)' }))], { optional: true })
    ])
  ])
]);

export const elementSlide = trigger('elementSlide', [
  transition(':enter', [
    style({ transform: 'translateY(8px)' }),
    animate('200ms cubic-bezier(.2,.8,.2,1)', style({ transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('160ms cubic-bezier(.4,0,.2,1)', style({ transform: 'translateY(-8px)' }))
  ])
]);

export const listSlideStagger = trigger('listSlideStagger', [
  transition(':enter, * => *', [
    query(':enter', [
      style({ transform: 'translateY(8px)' }),
      stagger(35, animate('170ms cubic-bezier(.2,.8,.2,1)', style({ transform: 'translateY(0)' })))
    ], { optional: true })
  ])
]);
