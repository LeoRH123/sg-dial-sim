/* SGC Computer Simulator
Copyright (C) 2018  Philip Fulgham

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>. */

import { Injectable } from "@angular/core";

import { DefaultAddressSet, Destination, Glyph } from "shared/models";

@Injectable()
export class GateNetworkService {
	public getActiveAddress(address: Glyph[]): Destination {
		let sixSymbolMatches = DefaultAddressSet.filter(d => d.address[0].position === address[0].position)
			.filter(d => d.address[1].position === address[1].position)
			.filter(d => d.address[2].position === address[2].position)
			.filter(d => d.address[3].position === address[3].position)
			.filter(d => d.address[4].position === address[4].position)
			.filter(d => d.address[5].position === address[5].position);

		if (sixSymbolMatches.length === 0) {
			return null;
		} else if (address.length === 7) {
			return sixSymbolMatches.filter(m => m.address.length === 6)[0];
		}
	}
}
