import {
  trigger, state, style, animate, transition, query,
  stagger, group, sequence
} from '@angular/animations';

export const sidebarAnim = trigger('sidebarAnim', [
  state('expanded', style({ width: '280px' })),
  state('collapsed', style({ width: '84px' })),
  transition('expanded <=> collapsed', animate('280ms cubic-bezier(0.4,0,0.2,1)')),
]);

export const rightPanelAnim = trigger('rightPanelAnim', [
  state('open',   style({ width: '300px', opacity: 1 })),
  state('closed', style({ width: '0px',   opacity: 0 })),
  transition('closed => open',  animate('320ms cubic-bezier(0.4,0,0.2,1)')),
  transition('open  => closed', animate('280ms cubic-bezier(0.4,0,0.2,1)')),
]);

export const routeAnim = trigger('routeAnim', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(16px)' }),
      animate('360ms cubic-bezier(0.4,0,0.2,1)',
        style({ opacity: 1, transform: 'translateY(0)' }))
    ], { optional: true }),
  ]),
]);

export const fadeSlideIn = trigger('fadeSlideIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(40px)' }),
    animate('350ms 60ms cubic-bezier(0.4,0,0.2,1)',
      style({ opacity: 1, transform: 'translateX(0)' })),
  ]),
  transition(':leave', [
    animate('280ms cubic-bezier(0.4,0,0.2,1)',
      style({ opacity: 0, transform: 'translateX(40px)' })),
  ]),
]);

export const staggerList = trigger('staggerList', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(8px)' }),
      stagger('45ms', [
        animate('300ms cubic-bezier(0.4,0,0.2,1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);
