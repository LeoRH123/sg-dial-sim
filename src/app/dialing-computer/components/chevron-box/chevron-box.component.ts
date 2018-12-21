import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";

import { TimelineLite } from "gsap";
import { BehaviorSubject } from "rxjs";
import { filter, take } from "rxjs/operators";

import { ChevronBoxAnimations, ChevronBoxAnimationConfig } from "app/dialing-computer/animations";
import { GateControlService } from "app/dialing-computer/services";
import { GateStatus, Glyph } from "app/shared/models";
import { GateStatusService } from "app/shared/services";

@Component({
	selector: "chevron-box",
	templateUrl: "./chevron-box.component.html",
	styleUrls: ["./chevron-box.component.scss"],
})
export class ChevronBoxComponent implements OnInit {
	@Input("gatePosition") gatePosition$: BehaviorSubject<DOMRect>;
	public glyph: Glyph;
	@Input() number: number;

	@ViewChild("chevronBox", { read: ElementRef })
	private chevronBox: ElementRef;

	private position: DOMRect;
	@ViewChild("symbol") private symbol: ElementRef;

	constructor(private gateControl: GateControlService, private gateStatus: GateStatusService) {}

	ngOnInit() {
		this.gateControl.activations$.pipe(filter(a => a.chevron === this.number)).subscribe(a => {
			this.glyph = a.glyph;
			this.gatePosition$.pipe(filter(pos => !!pos), take(1)).subscribe(pos => {
				a.symbolTimeline = a.fail ? this.lockSymbolFailed(pos) : this.lockSymbolSuccess(pos);
				this.gateControl.symbolAnimReady$.next(this.number);
			});
		});

		this.gateControl.result$.subscribe(res => {
			if (res.destination) {
				ChevronBoxAnimations.flashOnActivate(this.chevronBox);
			}
		});

		this.gateStatus.subscribe(status => {
			if (status === GateStatus.Idle) {
				this.clearSymbol();
			}
		});
	}

	public clearSymbol(): void {
		ChevronBoxAnimations.clearSymbol(this.chevronBox, this.symbol);
		this.glyph = undefined;
	}

	public lockSymbolFailed(gatePosition: DOMRect): TimelineLite {
		return ChevronBoxAnimations.lockSymbolFailed(this.buildAnimationConfig(gatePosition));
	}

	public lockSymbolSuccess(gatePosition: DOMRect): TimelineLite {
		return ChevronBoxAnimations.lockSymbolSuccess(this.buildAnimationConfig(gatePosition));
	}

	private buildAnimationConfig(gatePosition: DOMRect): ChevronBoxAnimationConfig {
		this.updateSymbolPosition();

		return {
			chevronBox: this.chevronBox,
			centerY: gatePosition.y + gatePosition.height / 2 - this.position.y - this.position.height / 2,
			startX: gatePosition.x + gatePosition.width / 2 - this.position.x - this.position.width / 2,
			startY: gatePosition.y - this.position.y + 50,
			symbol: this.symbol,
		};
	}

	private updateSymbolPosition(): void {
		this.position = this.symbol.nativeElement.getBoundingClientRect();
	}
}