/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Inject, Injectable} from '@angular/core';

import {mergeAlias} from '../add-alias';
import {MediaChange} from '../media-change';
import {BreakPoint} from '../breakpoints/break-point';
import {LAYOUT_CONFIG, LayoutConfigOptions} from '../tokens/library-config';
import {BreakPointRegistry, OptionalBreakPoint} from '../breakpoints/break-point-registry';

/**
 * Interface to apply PrintHook to call anonymous `target.updateStyles()`
 */
export interface HookTarget {
  activatedBreakpoints: BreakPoint[];

  updateStyles(): void;
}

/**
 * PrintHook - Use to intercept print MediaQuery activations and force
 *             layouts to render with the specified print alias/breakpoint
 *
 * Used in MediaMarshaller and MediaObserver
 */
@Injectable({providedIn: 'root'})
export class PrintHook {
  protected _isPrinting = false;

  constructor(
      protected breakpoints: BreakPointRegistry,
      @Inject(LAYOUT_CONFIG) protected layoutConfig: LayoutConfigOptions) {
  }

  /** Add 'print' mediaQuery: to listen for matchMedia activations */
  withPrintQuery(queries: string[]): string[] {
    if (!!this.printAlias) {
      queries.push('print');
    }
    return queries;
  }

  /** Is the MediaChange event for a 'print' @media */
  isPrintEvent(e: MediaChange) {
    return e.mediaQuery === 'print';
  }

  /** Is this service currently in Print-mode ? */
  get isPrinting(): boolean {
    return this._isPrinting;
  }

  /** What is the desired mqAlias to use while printing? */
  get printAlias(): string {
    return this.layoutConfig.printWithBreakpoint || '';
  }

  /** Lookup breakpoint associated with print alias. */
  get printBreakPoint(): OptionalBreakPoint {
    return this.breakpoints.findByAlias(this.printAlias!);
  }

  /**
   * Prepare RxJs filter operator with partial application
   * @return pipeable filter predicate
   */
  interceptEvents(target: HookTarget) {
    return (event: MediaChange): boolean => {
      if (this.printAlias && this.isPrintEvent(event)) {

        if (event.matches && !this.isPrinting) {
          this.startPrinting(target, this.printBreakPoint);
          target.updateStyles();

        } else if (!event.matches && this.isPrinting) {
          this.stopPrinting(target);
          target.updateStyles();
        }
      }

      return !this.isPrinting;
    };
  }

  updateEvent(event: MediaChange): MediaChange {
    let bp: OptionalBreakPoint = this.breakpoints.findByQuery(event.mediaQuery);
    if (this.isPrintEvent(event)) {
      // Reset from 'print' to specified print breakpoint
      bp = this.printBreakPoint;
      event.mediaQuery = bp ? bp.mediaQuery : '';
    }
    return mergeAlias(event, bp);
  }

  /**
   * Save current activateBreakpoints (for later restore)
   * and substitute only the printAlias breakpoint
   */
  protected startPrinting(target: HookTarget, bp: OptionalBreakPoint) {
    if (!!bp) {
      // Just add the print breakpoint as highest priority in the queue
      target.activatedBreakpoints = [bp, ...target.activatedBreakpoints];
    }
  }

  /** Remove the print breakpoint */
  protected stopPrinting(target: HookTarget) {
    if (this._isPrinting) {
      target.activatedBreakpoints.shift();  // remove print breakpoint
    }
  }

}
