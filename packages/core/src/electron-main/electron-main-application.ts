/********************************************************************************
 * Copyright (C) 2019 Ericsson and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import * as electron from 'electron';
import { injectable, inject, named } from 'inversify';
import { ContributionProvider, MaybePromise } from '../common';

export const ElectronMainApplicationContribution = Symbol('ElectronMainApplicationContribution');
export interface ElectronMainApplicationContribution {
    onStart?(app: Electron.App): MaybePromise<void>;
}

@injectable()
export class ElectronMainApplication {

    @inject(ContributionProvider) @named(ElectronMainApplicationContribution)
    protected readonly contributions: ContributionProvider<ElectronMainApplicationContribution>;

    async start(app: electron.App): Promise<void> {
        await Promise.all(this.contributions.getContributions()
            .map(contribution => contribution.onStart && contribution.onStart(app)));
    }

}
