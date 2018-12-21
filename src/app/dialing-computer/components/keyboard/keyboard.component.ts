import { Component, ElementRef, EventEmitter, OnInit, Output } from "@angular/core";

import { TweenLite } from "gsap";

import { GateControlService } from "app/dialing-computer/services";
import { GateStatus, Glyph, Glyphs } from "app/shared/models";
import { GateNetworkService, GateStatusService } from "app/shared/services";

@Component({
	selector: "keyboard",
	templateUrl: "./keyboard.component.html",
	styleUrls: ["./keyboard.component.scss"],
})
export class KeyboardComponent implements OnInit {
	@Output() dialAddress: EventEmitter<Glyph[]> = new EventEmitter();

	public address: Glyph[] = [];
	public isDialingAvailable: boolean;
	public keys: Glyph[] = Glyphs.standard;

	public get addressWithOrigin(): Glyph[] {
		let address = this.address.slice();
		if (this.address.length >= 6) {
			address.push(Glyphs.pointOfOrigin);
		}
		return address;
	}

	public get elem(): HTMLElement {
		return this._elem.nativeElement;
	}

	constructor(
		private _elem: ElementRef,
		private gateControl: GateControlService,
		private gateNetwork: GateNetworkService,
		private gateStatus: GateStatusService
	) {}

	ngOnInit() {
		this.gateStatus.subscribe(status => {
			switch (status) {
				case GateStatus.Idle:
					this.isDialingAvailable = true;
					break;
				case GateStatus.Aborted:
				case GateStatus.Shutdown:
					this.clearAddress();
				default:
					this.isDialingAvailable = false;
			}
		});
	}

	public backspace(): void {
		this.address.pop();
	}

	public clearAddress(): void {
		this.address = [];
	}

	public closeKeyboard(): void {
		TweenLite.to(this.elem, 1, { css: { className: "+=minimized" } });
	}

	public isAddressValid(): boolean {
		return !!this.gateNetwork.getActiveAddress(this.addressWithOrigin);
	}

	public isGlyphNumberInactive(glyph: number): boolean {
		return glyph > 6;
	}

	public isGlyphNumberSelected(glyph: number): boolean {
		return !!this.address[glyph - 1];
	}

	public isGlyphSelected(glyph: Glyph): boolean {
		return !!this.address.find(item => item === glyph);
	}

	public selectGlyph(glyph: Glyph): void {
		if (this.address.length < 6 && !this.isGlyphSelected(glyph)) {
			this.address.push(glyph);
		}
	}

	public shutdown(): void {
		this.gateControl.shutdown();
		this.closeKeyboard();
	}

	public validateAndDial(): void {
		if (this.address.length === 6) {
			this.dialAddress.emit(this.address);
			this.closeKeyboard();
		}
	}
}
