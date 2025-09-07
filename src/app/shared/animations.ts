import { animate, group, query, stagger, state, style, transition, trigger } from '@angular/animations';

const fast = 180;
const normal = 240;
const slow = 320;

export const routeTransition = trigger('routeTransition', [
  transition('* <=> *', [
    query(':enter, :leave', style({ position: 'absolute', top: 0, left: 0, width: '100%' }), { optional: true }),
    group([
      query(':leave', [
        style({ opacity: 1, transform: 'translateY(0px)' }),
        animate(`${normal}ms ease`, style({ opacity: 0, transform: 'translateY(8px)' }))
      ], { optional: true }),
      query(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate(`${normal}ms ease`, style({ opacity: 1, transform: 'translateY(0px)' }))
      ], { optional: true })
    ])
  ])
]);

export const listStagger = trigger('listStagger', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(6px)' }),
      stagger(40, animate(`${fast}ms ease-out`, style({ opacity: 1, transform: 'translateY(0)' })))
    ], { optional: true }),
    query(':leave', [
      stagger(20, animate(`${fast}ms ease-in`, style({ opacity: 0, transform: 'translateY(6px)' })))
    ], { optional: true })
  ])
]);

export const expandCollapse = trigger('expandCollapse', [
  state('collapsed', style({ height: '0px', opacity: 0, overflow: 'hidden', transform: 'scaleY(.98)' })),
  state('expanded', style({ height: '*', opacity: 1, overflow: 'hidden', transform: 'scaleY(1)' })),
  transition('collapsed <=> expanded', animate(`${slow}ms cubic-bezier(.2,.8,.2,1)`))
]);

export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate(`${fast}ms ease-out`, style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate(`${fast}ms ease-in`, style({ opacity: 0 }))
  ])
]);

export const chipPulse = trigger('chipPulse', [
  transition(':enter', [
    style({ transform: 'scale(.9)', opacity: 0 }),
    animate(`${fast}ms ease-out`, style({ transform: 'scale(1)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate(`${fast}ms ease-in`, style({ transform: 'scale(.9)', opacity: 0 }))
  ])
]);
