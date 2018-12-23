/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {async, fakeAsync, inject, TestBed} from '@angular/core/testing';
import {Subject} from 'rxjs';

import {MediaMarshaller} from './media-marshaller';
import {MatchMedia} from '../match-media/match-media';
import {DEFAULT_CONFIG, LAYOUT_CONFIG} from '../tokens/library-config';
import {MockMatchMedia, MockMatchMediaProvider} from '../match-media/mock/mock-match-media';

describe('media-marshaller', () => {
  let matchMedia: MockMatchMedia;
  let mediaMarshaller: MediaMarshaller;

  describe('with layout printing NOT configured', () => {
    beforeEach(() => {
      // Configure testbed to prepare services
      TestBed.configureTestingModule({
        providers: [MockMatchMediaProvider]
      });
      spyOn(MediaMarshaller.prototype, 'onMediaChange').and.callThrough();
      spyOn(MediaMarshaller.prototype, 'updateStyles').and.callThrough();
    });

    // Single async inject to save references; which are used in all tests below
    beforeEach(async(inject([MatchMedia, MediaMarshaller],
        (service: MockMatchMedia, marshal: MediaMarshaller) => {
          matchMedia = service;      // inject only to manually onMediaChange mediaQuery ranges
          mediaMarshaller = marshal;
        })));
    afterEach(() => {
      matchMedia.clearAll();
    });

    it('activates when match-media activates', () => {
      matchMedia.activate('xs');
      expect(mediaMarshaller.onMediaChange).toHaveBeenCalled();
    });

    it('doesn\'t onMediaChange when match-media activates the same breakpoint twice', () => {
      matchMedia.activate('xs');
      matchMedia.activate('xs');
      expect(mediaMarshaller.updateStyles).toHaveBeenCalledTimes(1);
    });

    it('should set correct activated breakpoint', () => {
      matchMedia.activate('lg');
      expect(mediaMarshaller.activatedAlias).toBe('lg');

      matchMedia.activate('gt-md');
      expect(mediaMarshaller.activatedAlias).toBe('gt-md');
    });

    it('should init', () => {
      let triggered = false;
      const builder = () => {
        triggered = true;
      };
      mediaMarshaller.init(fakeElement, fakeKey, builder);
      mediaMarshaller.setValue(fakeElement, fakeKey, 0, 'xs');
      triggered = false;
      matchMedia.activate('xs');
      expect(triggered).toBeTruthy();
    });

    it('should init with observables', () => {
      let triggered = false;
      const subject: Subject<void> = new Subject();
      const obs = subject.asObservable();
      const builder = () => {
        triggered = true;
      };
      mediaMarshaller.init(fakeElement, fakeKey, builder, () => {
      }, [obs]);
      subject.next();
      expect(triggered).toBeTruthy();
    });

    it('should updateStyles', () => {
      let triggered = false;
      const builder = () => {
        triggered = true;
      };
      mediaMarshaller.init(fakeElement, fakeKey, builder);
      mediaMarshaller.setValue(fakeElement, fakeKey, 0, '');
      triggered = false;
      mediaMarshaller.updateStyles();
      expect(triggered).toBeTruthy();
    });

    it('should updateElement', () => {
      let triggered = false;
      const builder = () => {
        triggered = true;
      };
      mediaMarshaller.init(fakeElement, fakeKey, builder);
      mediaMarshaller.updateElement(fakeElement, fakeKey, 0);
      expect(triggered).toBeTruthy();
    });

    it('should get the right value', () => {
      const builder = () => {
      };
      mediaMarshaller.init(fakeElement, fakeKey, builder);
      mediaMarshaller.setValue(fakeElement, fakeKey, 0, '');
      const value = mediaMarshaller.getValue(fakeElement, fakeKey);
      expect(value).toEqual(0);
    });

    it('should track changes', fakeAsync(() => {
      const builder = () => {
      };
      let triggered = false;
      mediaMarshaller.init(fakeElement, fakeKey, builder);
      mediaMarshaller.trackValue(fakeElement, fakeKey).subscribe(() => {
        triggered = true;
      });
      mediaMarshaller.setValue(fakeElement, fakeKey, 0, '');
      expect(triggered).toBeTruthy();
    }));

    it('should release', () => {
      let triggered = false;
      const subject: Subject<void> = new Subject();
      const obs = subject.asObservable();
      const builder = () => {
        triggered = true;
      };
      mediaMarshaller.init(fakeElement, fakeKey, builder, () => {
      }, [obs]);
      mediaMarshaller.releaseElement(fakeElement);
      subject.next();
      expect(triggered).toBeFalsy();
    });
  });

  describe('with layout "print" configured', () => {
    // const mdMediaQuery = 'screen and (min-width: 600px) and (max-width: 959px)';

    beforeEach(() => {
      // Configure testbed to prepare services
      TestBed.configureTestingModule({
        providers: [
          MockMatchMediaProvider,
          {
            provide: LAYOUT_CONFIG,
            useValue: {
              ...DEFAULT_CONFIG,
              ...{printWithBreakpoint: 'sm'}
            }
          }
        ]
      });
      spyOn(MediaMarshaller.prototype, 'onMediaChange').and.callThrough();
      spyOn(MediaMarshaller.prototype, 'updateStyles').and.callThrough();
    });

    // Single async inject to save references; which are used in all tests below
    beforeEach(async(inject([MatchMedia, MediaMarshaller],
        (service: MockMatchMedia, marshal: MediaMarshaller) => {
          matchMedia = service;      // inject only to manually onMediaChange mediaQuery ranges
          mediaMarshaller = marshal;
        })));
    afterEach(() => {
      matchMedia.clearAll();
    });

    it('call onMediaChange when breakpoint activates', () => {
      matchMedia.activate('xs');
      expect(mediaMarshaller.onMediaChange).toHaveBeenCalled();
    });

    it('doesn\'t call onMediaChange when match-media activates the same breakpoint twice', () => {
      matchMedia.activate('xs');
      matchMedia.activate('xs');
      expect(mediaMarshaller.updateStyles).toHaveBeenCalledTimes(1);
    });

    it('should set correct activated breakpoint', () => {
      matchMedia.activate('lg');
      expect(mediaMarshaller.activatedAlias).toBe('lg');

      matchMedia.activate('gt-md');
      expect(mediaMarshaller.activatedAlias).toBe('gt-md');
    });

    it('should init', () => {
      let triggered = false;
      const builder = () => {
        triggered = true;
      };
      mediaMarshaller.init(fakeElement, fakeKey, builder);
      mediaMarshaller.setValue(fakeElement, fakeKey, 0, 'xs');
      triggered = false;
      matchMedia.activate('xs');
      expect(triggered).toBeTruthy();
    });

    it('should init with observables', () => {
      let triggered = false;
      const subject: Subject<void> = new Subject();
      const obs = subject.asObservable();
      const builder = () => {
        triggered = true;
      };
      mediaMarshaller.init(fakeElement, fakeKey, builder, () => {
      }, [obs]);
      subject.next();
      expect(triggered).toBeTruthy();
    });

    it('should updateStyles', () => {
      let triggered = false;
      const builder = () => {
        triggered = true;
      };
      mediaMarshaller.init(fakeElement, fakeKey, builder);
      mediaMarshaller.setValue(fakeElement, fakeKey, 0, '');
      triggered = false;
      mediaMarshaller.updateStyles();
      expect(triggered).toBeTruthy();
    });

    it('should updateElement', () => {
      let triggered = false;
      const builder = () => {
        triggered = true;
      };
      mediaMarshaller.init(fakeElement, fakeKey, builder);
      mediaMarshaller.updateElement(fakeElement, fakeKey, 0);
      expect(triggered).toBeTruthy();
    });

    it('should get the right value', () => {
      const builder = () => {
      };
      mediaMarshaller.init(fakeElement, fakeKey, builder);
      mediaMarshaller.setValue(fakeElement, fakeKey, 0, '');
      const value = mediaMarshaller.getValue(fakeElement, fakeKey);
      expect(value).toEqual(0);
    });

    it('should track changes', fakeAsync(() => {
      const builder = () => {
      };
      let triggered = false;
      mediaMarshaller.init(fakeElement, fakeKey, builder);
      mediaMarshaller.trackValue(fakeElement, fakeKey).subscribe(() => {
        triggered = true;
      });
      mediaMarshaller.setValue(fakeElement, fakeKey, 0, '');
      expect(triggered).toBeTruthy();
    }));

    it('should release', () => {
      let triggered = false;
      const subject: Subject<void> = new Subject();
      const obs = subject.asObservable();
      const builder = () => {
        triggered = true;
      };
      mediaMarshaller.init(fakeElement, fakeKey, builder, () => {
      }, [obs]);
      mediaMarshaller.releaseElement(fakeElement);
      subject.next();
      expect(triggered).toBeFalsy();
    });

    it('call onMediaChange when printing', () => {
      matchMedia.activate('print');
      expect(mediaMarshaller.onMediaChange).toHaveBeenCalled();
    });

  });

});

const fakeElement = {} as HTMLElement;
const fakeKey = 'FAKE_KEY';
